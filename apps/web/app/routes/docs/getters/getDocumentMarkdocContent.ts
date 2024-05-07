import markdoc, {
  type Config as MarkdocConfig,
  type RenderableTreeNode,
  type Tag,
} from '@markdoc/markdoc';
import fs from 'fs/promises';
import path from 'path';

import { getDocumentsPath } from '../constants';
import { DocumentHeadings } from '../types';

const { parse, Tokenizer, transform } = markdoc;

async function checkFileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getDocumentMarkdocContent(
  filename: string,
): Promise<{ content: RenderableTreeNode; headings: DocumentHeadings }> {
  let fullPath = path.resolve(getDocumentsPath(), filename);

  let exists = await checkFileExists(fullPath);

  if (!exists) {
    const dir = filename.replace('.mdoc', '');
    fullPath = path.resolve(getDocumentsPath(), dir, filename);
    exists = await checkFileExists(fullPath);

    if (!exists) {
      throw new Error(`Document ${filename} not found`);
    }
  }

  const source = await fs.readFile(fullPath, 'utf-8');

  const tokenizer = new Tokenizer({ allowComments: true });

  const tokens = tokenizer.tokenize(source);

  const ast = parse(tokens);

  // prettier-ignore
  const partials = {
    'metronome-installation.partial.mdoc': parse(await fs.readFile(path.resolve(getDocumentsPath(), 'partials/metronome-installation.partial.mdoc'), 'utf-8')),
    'metronome-init.partial.mdoc': parse(await fs.readFile(path.resolve(getDocumentsPath(), 'partials/metronome-init.partial.mdoc'), 'utf-8')),
    'metronome-root-config.partial.mdoc': parse(await fs.readFile(path.resolve(getDocumentsPath(), 'partials/metronome-root-config.partial.mdoc'), 'utf-8')),
  };

  const config: MarkdocConfig = {
    tags: {
      alert: {
        render: 'Alert',
        attributes: {
          title: { type: String },
        },
        children: ['text'],
      },
      link: {
        render: 'Link',
        attributes: {
          href: { type: String },
          title: { type: String },
          className: { type: String },
        },
        children: ['text'],
      },
      'installation-targets': {
        render: 'InstallationTargets',
        children: ['installation-target'],
        attributes: { className: { type: String } },
      },
      'installation-target': {
        render: 'InstallationTarget',
        selfClosing: true,
        attributes: {
          to: { type: String },
          title: { type: String },
          description: { type: String },
          className: { type: String },
          iconClassName: { type: String },
        },
      },
      button: {
        render: 'Button',
        selfClosing: true,
        attributes: {
          to: { type: String },
          rightIcon: { type: String },
          label: { type: String },
          className: { type: String },
        },
      },
      image: {
        render: 'Image',
        selfClosing: true,
        attributes: {
          src: { type: String },
          alt: { type: String },
          className: { type: String },
          byUrl: { type: String },
          byLabel: { type: String },
          fromUrl: { type: String },
          fromLabel: { type: String },
        },
      },
    },
    nodes: {
      hr: {
        render: 'HorizontalRule',
      },
      heading: {
        render: 'Heading',
        attributes: { level: { type: String }, className: { type: String } },
      },
      paragraph: {
        render: 'Paragraph',
        attributes: { className: { type: String } },
      },
      fence: {
        render: 'Fence',
        attributes: {
          className: { type: String },
          content: { type: String },
          language: { type: String },
          process: { type: Boolean },
          title: { type: String },
        },
        children: ['text'],
      },
      code: {
        render: 'Code',
        attributes: { content: { type: String }, className: { type: String } },
      },
      link: {
        render: 'Link',
        attributes: {
          href: { type: String },
          title: { type: String },
          className: { type: String },
        },
        children: ['text'],
      },
      table: {
        render: 'Table',
        children: ['table'],
      },
      thead: {
        render: 'THead',
        children: ['tr'],
      },
      tbody: {
        render: 'TBody',
        children: ['tr', 'tag'],
      },
      tr: {
        render: 'Tr',
        children: ['th', 'td'],
      },
      th: {
        render: 'Th',
        children: ['text'],
        attributes: {
          width: { type: Number },
          align: { type: String },
        },
      },
      td: {
        render: 'Td',
        children: [
          'inline',
          'heading',
          'paragraph',
          'image',
          'table',
          'tag',
          'fence',
          'blockquote',
          'list',
          'hr',
        ],
        attributes: {
          className: { type: String },
          colspan: { type: Number },
          rowspan: { type: Number },
          align: { type: String },
        },
      },
      strong: {
        render: 'Strong',
        children: ['text'],
      },
      list: {
        render: 'List',
        attributes: { ordered: { type: Boolean } },
        children: ['list-item'],
      },
      item: {
        render: 'ListItem',
        children: ['text', 'paragraph', 'list'],
      },
    },
    partials,
  };

  const content = transform(ast, config);

  const headings = (content as Tag).children
    .filter((child) => (child as Tag).name === 'Heading')
    .map((child) => ({
      title: ((child as Tag).children.at(0) as string) || '',
      level: (child as Tag).attributes.level,
    }));

  return { content, headings };
}
