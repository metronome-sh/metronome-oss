import { queues } from '@metronome/queues';
import { type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  const apiKey = request.headers.get('ApiKey');

  if (!apiKey) return new Response(null, { status: 202 });

  const data = await request.json();

  if (!data) return new Response(null, { status: 202 });

  await queues.metrics.add({ apiKey, data });

  return new Response(null, { status: 202 });
}
