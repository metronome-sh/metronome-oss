import { projects, sourcemaps } from '@metronome/db';
import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const apiKey = request.headers.get('x-api-key');
  const version = request.headers.get('x-version');

  if (!apiKey) return new Response('Api key not provided', { status: 400 });

  if (!version) return new Response('Version not provided', { status: 400 });

  const project = await projects.findByApiKey({ apiKey: apiKey });

  if (!project) return new Response('Project not found', { status: 404 });

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler(),
  );

  const file = formData.get('file') as Blob | undefined;

  if (!file) return new Response('File not provided', { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  await sourcemaps.create({ project, version, fileBuffer });

  return new Response(null, { status: 202 });
}
