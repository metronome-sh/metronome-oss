import { users } from '@metronome/db';
import { ActionFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { handle } from '#app/handlers/handle';
import { success } from '#app/responses';

export async function action({ request, params }: ActionFunctionArgs) {
  const { notificationId = '' } = params;
  invariant(notificationId, 'notificationId is required');

  const { auth } = await handle(request);

  const user = await auth.user();

  await users.markNotificationAsSeen(user.id, notificationId);

  return success();
}
