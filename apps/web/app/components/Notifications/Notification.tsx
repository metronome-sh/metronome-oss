import { useFetcher, useNavigation } from '@remix-run/react';
import { FunctionComponent, useState } from 'react';
import { createPortal } from 'react-dom';
import { invariant } from 'ts-invariant';

import { useRootLoaderData } from '#app/hooks/useRootLoaderData';
import { useIsomorphicLayoutEffect } from '#app/hooks/useIsomorphicLayoutEffect';

export type NotificationProps = {
  notificationOutletId?: string;
  notificationId?: string;
  render: (onHide: () => void) => JSX.Element;
};

export const Notification: FunctionComponent<NotificationProps> = ({
  notificationOutletId = 'default-notifications',
  notificationId,
  render,
}) => {
  const { user } = useRootLoaderData();

  invariant(user, 'User not found');

  const [notificationOutlet, setNotificationOutlet] = useState<HTMLOListElement>();

  const navigation = useNavigation();

  useIsomorphicLayoutEffect(() => {
    const outletElement = document.getElementById(notificationOutletId) as HTMLOListElement;
    if (outletElement) {
      setNotificationOutlet(outletElement);
    }
  }, [notificationOutletId, navigation.state]);

  const fetcher = useFetcher();

  const handleHideCallback = () => {
    if (notificationId) {
      fetcher.submit(null, { method: 'POST', action: `/notifications/${notificationId}` });
    }
  };

  const isSubmitting = fetcher.state === 'submitting';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const success = (fetcher.data as any)?.success as boolean | undefined;

  const showNotification =
    !isSubmitting && !user.settings?.seenNotifications?.includes(notificationId || '') && !success;

  return notificationOutlet && showNotification
    ? createPortal(
        <div className="mx-4 my-2">{render(handleHideCallback)}</div>,
        notificationOutlet,
      )
    : null;
};
