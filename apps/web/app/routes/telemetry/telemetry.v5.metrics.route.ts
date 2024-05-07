import { queues } from '@metronome/queues';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) return new Response('Api key not provided', { status: 400 });

  await queues.otelMetrics.add({ apiKey, metrics: await request.json() });

  return new Response(null, { status: 202 });
}
