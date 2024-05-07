import { useSubmit } from '@remix-run/react';
import { type FunctionComponent, PropsWithChildren } from 'react';

import { useRootLoaderData } from '#app/hooks/useRootLoaderData';

import { Avatar, Button, DropdownMenu } from '..';

export const UserMenu: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { user } = useRootLoaderData();
  const submit = useSubmit();

  if (!user) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center">
          <Avatar className="h-8 w-8">
            <Avatar.Image src={user.avatar || ''} alt={user.name} />
            <Avatar.Fallback>{user.name.at(0)?.toLocaleUpperCase()}</Avatar.Fallback>
          </Avatar>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56" align="end" forceMount>
        <DropdownMenu.Label className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.settings?.selectedEmail ?? user.email}
            </p>
          </div>
        </DropdownMenu.Label>
        {children ? (
          <>
            <DropdownMenu.Separator />
            {children}
          </>
        ) : null}
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            submit(null, { method: 'post', action: '/authentication/logout' });
          }}
        >
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
