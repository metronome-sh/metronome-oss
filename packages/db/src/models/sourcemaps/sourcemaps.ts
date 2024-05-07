import AdmZip from 'adm-zip';
import { clickhouse } from '../../modules/clickhouse';
import { s3Client, getBucket, PutObjectCommand, deleteDirectory } from '../../modules/s3Client';
import { Project } from '../../types';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { invariant } from 'ts-invariant';
import { SourceMapConsumer } from 'source-map';
import { codeToHtml } from 'shiki';
import { cache } from '@metronome/cache';
import { StackTraceSource } from './sourcemaps.types';
import * as stackTraceParser from 'stacktrace-parser';
import { env } from '@metronome/env';
import * as cheerio from 'cheerio';

(SourceMapConsumer as any).initialize({
  'lib/mappings.wasm': 'https://cdn.jsdelivr.net/npm/source-map/lib/mappings.wasm',
});

export async function create({
  fileBuffer,
  version,
  project,
}: {
  fileBuffer: Buffer;
  version: string;
  project: Project;
}) {
  const bucketName = await getBucket();
  const directory = `${project.id}/${version}/`;

  await deleteDirectory(directory);

  const zip = new AdmZip(fileBuffer);

  await Promise.all(
    zip.getEntries().map(async (entry) => {
      if (entry.isDirectory) return;

      const key = `${project.id}/${version}/${entry.entryName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: entry.getData(),
          ContentType: 'text/plain',
        }),
      );
    }),
  );

  const result = await clickhouse.query({
    query: `SELECT count() FROM sourcemaps WHERE project_id = {projectId: String} AND version = {version: String}`,
    query_params: {
      projectId: project.id,
      version,
    },
    format: 'JSONEachRow',
  });

  const [row] = await result.json<{ 'count()': string }[]>();

  if (row['count()'] !== '0') return;

  await clickhouse.insert({
    table: 'sourcemaps',
    values: [
      {
        project_id: project.id,
        version,
      },
    ],
    format: 'JSONEachRow',
  });
}

export async function getSourcesFromStackTrace({
  project,
  version,
  stacktrace,
  hash,
}: {
  project: Project;
  version: string;
  stacktrace: string;
  hash: string;
}): Promise<StackTraceSource[]> {
  if (env.production) {
    const cached = await cache.get<StackTraceSource[]>(`sources:${project.id}:${version}:${hash}`);
    if (cached) return cached;
  }

  const result = await clickhouse.query({
    query: `
      select count() from sourcemaps
      where project_id = {projectId: String}
      and version = {version: String}
    `,
    query_params: {
      projectId: project.id,
      version,
    },
    format: 'JSONEachRow',
  });

  const [row] = await result.json<{ 'count()': string }[]>();

  if (row['count()'] === '0') return [];

  const bucketName = await getBucket();

  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: `${project.id}/${version}/mapping.json`,
  });

  let mapping: { routeFiles: string[]; sources: Record<string, string> } = {
    routeFiles: [],
    sources: {},
  };

  try {
    const { Body } = await s3Client.send(getCommand);

    invariant(Body, 'Body should be defined');

    const context = await Body.transformToString();

    mapping = JSON.parse(context) as { routeFiles: string[]; sources: Record<string, string> };
  } catch (error) {
    // TODO be able to handle if the mapping.json file is not found better
    console.error(`Error while fetching mapping.json for project ${project.id}/${version}`, error);
  }

  const files = Object.keys(mapping.sources);
  const routeFiles = mapping.routeFiles;

  const parsedStackTrace = stackTraceParser.parse(stacktrace);

  const stackFrames = parsedStackTrace.map((stackFrame) => {
    const { file = '', lineNumber, column } = stackFrame;

    const [, filename] = /.*\/(.*\.js)/.exec(file!) ?? [];

    if (!filename) return { at: stackFrame.file, filename: null, lineNumber, column, offset: 0 };

    const source = files.find((f) => {
      return f.includes(filename);
    });

    const offset = file!.match(/https?:\/\//) ? 0 : 1;

    return { at: stackFrame.file, filename: source ?? null, lineNumber, column, offset };
  });

  const cachedSourceMapContents: Record<string, string> = {};

  async function getSourceMapContents(filename: string): Promise<string> {
    const Key = `${project.id}/${version}/${mapping.sources[filename]}`;

    if (cachedSourceMapContents[filename]) return cachedSourceMapContents[filename];

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key,
    });

    const { Body } = await s3Client.send(getCommand);

    invariant(Body, 'Body should be defined');

    const Contents = await Body.transformToString('utf-8');

    cachedSourceMapContents[filename] = Contents;

    return Contents;
  }

  const sources = [] as {
    code: string | null;
    at: string | null;
    filename: string | null;
    entries: { lineNumber: number | null; column: number | null }[];
    source: string | null;
  }[];

  for (const frame of stackFrames) {
    const { at, filename, lineNumber, column } = frame;

    if (!filename || lineNumber === null || column === null) {
      sources.push({ code: null, at, filename, entries: [{ lineNumber, column }], source: null });
      continue;
    }

    const consumer = await new SourceMapConsumer(await getSourceMapContents(filename!));

    const originalPosition = consumer.originalPositionFor({
      line: lineNumber!,
      column: column!,
    });

    const { source, line } = originalPosition;

    invariant(originalPosition.source, 'originalPosition.source should be defined');
    invariant(originalPosition.line, 'originalPosition.line should be defined');

    const content = consumer.sourceContentFor(originalPosition.source);

    if (!content) {
      sources.push({ code: null, at, filename, entries: [{ lineNumber, column }], source });
      continue;
    }

    const existingSourceIdx = sources.findIndex(
      (source) => source.source === originalPosition.source,
    );

    const currentSource =
      existingSourceIdx === -1
        ? { code: content, at, filename, entries: [], source }
        : sources[existingSourceIdx];

    currentSource.entries.push({ lineNumber: line, column });

    const shouldSkipOffset =
      routeFiles.some((rf) => originalPosition.source?.includes(rf)) && at?.match(/http/);

    const linesToHighlight = currentSource.entries.map(
      ({ lineNumber }) => lineNumber! - (shouldSkipOffset ? 0 : 1),
    );

    const boundaryLines = 5;

    type Range = { start: number; end: number };

    // Merge overlapping positions
    const boundaries: Range[] = linesToHighlight.reduce<Range[]>((acc, cur) => {
      if (acc.length === 0)
        return [{ start: Math.max(cur - boundaryLines, 0), end: cur + boundaryLines }];

      const last = acc[acc.length - 1];
      if (cur - boundaryLines <= last.end) {
        last.end = Math.max(last.end, cur + boundaryLines);
      } else {
        acc.push({ start: Math.max(cur - boundaryLines, 0), end: cur + boundaryLines });
      }
      return acc;
    }, []);

    const code = await codeToHtml(content, {
      lang: 'tsx',
      theme: 'github-dark-dimmed',
      transformers: [
        {
          line(node, line) {
            if (linesToHighlight.includes(line - 1)) {
              this.addClassToHast(node, 'error');
            }

            if (
              linesToHighlight.length > 1 &&
              boundaries.some((boundary) => line === boundary.start + 1) &&
              line !== boundaries[0].start + 1
            ) {
              node.properties['data-line-upper-boundary'] = true;
            }

            if (
              !boundaries.some((boundary) => line >= boundary.start + 1 && line <= boundary.end + 1)
            ) {
              this.addClassToHast(node, 'remove');
            }

            node.properties['data-line-number'] = line;
          },
        },
      ],
    });

    // TODO use tokens to remove lines instead of cheerio
    const $ = cheerio.load(code);

    $('.remove').each(function () {
      $(this.next!).remove();
      $(this).remove();
    });

    currentSource.code = $.html();

    if (existingSourceIdx === -1) {
      sources.push(currentSource);
    } else {
      sources[existingSourceIdx] = currentSource;
    }
    consumer.destroy();
  }

  await cache.set(`sources:${project.id}:${version}:${hash}`, sources, 604800 /* 1 week */);

  return sources;
}
