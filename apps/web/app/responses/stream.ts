import { handle } from '#app/handlers/handle';

import { empty } from './empty';

export interface StreamCleanupCallback {
  (): void;
}

export interface StreamSetupCallback<LoaderFunction> {
  (
    send: (data: Partial<UnwrapDeferred<LoaderFunction>>, ts: number) => void,
    controller: AbortController,
  ): Promise<StreamCleanupCallback> | StreamCleanupCallback;
}

export async function stream<LoaderFunction>(
  routeId: string,
  request: Request,
  callback: StreamSetupCallback<LoaderFunction>,
): Promise<Response> {
  const { query } = await handle(request);
  if ((await query.get('_intent')) === 'handshake') return empty();

  if (!request.signal) return new Response(null, { status: 400 });

  const streamController = new AbortController();

  let cleanup: StreamCleanupCallback | void;

  const readableStream = new ReadableStream({
    async start(controller) {
      let closed = false;

      function close() {
        console.log('Closing stream');
        if (closed) return;

        cleanup?.();
        closed = true;
        request.signal.removeEventListener('abort', close);
        try {
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }

      streamController.signal.addEventListener('abort', close);

      const encoder = new TextEncoder();

      if (request.signal.aborted) close();

      request.signal.addEventListener('abort', close);

      function send(sendData: Partial<UnwrapDeferred<LoaderFunction>>, ts: number) {
        if (closed) return;

        const stringified = JSON.stringify({
          routeId,
          detail: { data: sendData, ts },
        });

        controller.enqueue(encoder.encode('event: message\n'));
        controller.enqueue(encoder.encode(`data: ${stringified}\n\n`));
      }

      cleanup = await callback(send, streamController);

      if (request.signal.aborted) close();
    },
  });

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
