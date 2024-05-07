import { DropdownMenu } from '#app/components/DropdownMenu';
import { Icon } from '#app/components/Icon';
import { Button } from '#app/components/Button/Button';
import { Link, useFetcher, useSubmit } from '@remix-run/react';
import { FunctionComponent, useCallback } from 'react';
import { ProjectError } from '@metronome/db';
import { ErrorListRoutesPill } from './ErrorListRoutesPill';
import { cn } from '#app/components/utils';
import { useRelativeErrorDates } from '../hooks/useRelativeErrorDates';
import { invariant } from 'ts-invariant';

type ErrorListItemProps = {
  error: ProjectError;
};

export const ErrorListItem: FunctionComponent<ErrorListItemProps> = ({ error }) => {
  const { relativeFirstSeen, relativeLastSeen } = useRelativeErrorDates(error);

  const submit = useSubmit();

  const handleOnSelect = useCallback(
    (e: Event) => {
      const intent = (e.target as HTMLElement).getAttribute('data-intent');

      invariant(intent, 'intent must be defined');

      const form = new FormData();

      form.append('hashes', error.hash);

      submit(form, {
        method: 'post',
        action: `./?index&intent=${intent}`,
        fetcherKey: `error-list-item:${error.hash}`,
        navigate: false,
        unstable_flushSync: true,
      });
    },
    [error],
  );

  return (
    <li
      className={cn(
        'relative group pt-2 pb-3 px-4 border-b border-x border-zinc-800 overflow-hidden first:border-t first:rounded-t-lg last:rounded-b-lg',
        // TODO hilight the most recent errors
        false ? 'bg-yellow-900/10 hover:bg-yellow-900/20' : 'bg-zinc-900/50 hover:bg-zinc-900',
      )}
    >
      <Link
        className="flex flex-col md:flex-row justify-between md:items-center"
        prefetch="intent"
        to={`./${error.hash}`}
      >
        <div>
          <div className="font-medium tracking-wider">{error.name}</div>
          <div className="font-mono text-sm pr-9">{error.message}</div>
          <div className="flex gap-2 mt-4 text-xs flex-wrap">
            <div
              className={cn('flex items-center border rounded px-1 py-0.5 gap-1', {
                'border-blue-700': error.kind !== 2,
                'border-green-700': error.kind === 2,
              })}
            >
              {error.kind === 2 ? <Icon.Monitor /> : <Icon.Server />}
              <span className="font-medium">{error.kind === 2 ? 'Client' : 'Server'}</span>
            </div>
            <div className="px-1 py-0.5 border rounded flex gap-1 items-center">
              <Icon.ClockHourTwo />
              <span>First seen {relativeFirstSeen}</span>
            </div>{' '}
            <ErrorListRoutesPill routes={error.routeIds} />
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center justify-between gap-4 w-full md:w-auto">
          <div className="flex space-x-4 text-sm flex-shrink-0 pt-2 md:pt-0">
            <span>{relativeLastSeen}</span>
            <span>
              {error.occurrences} {error.occurrences === 1 ? 'occurrence' : 'occurrences'}
            </span>
          </div>
          <div
            className="flex-shrink-0 w-fit absolute md:static top-1 right-1"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button size="icon" variant="outline" type="button">
                  <Icon.Dots />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="mx-2">
                {error.status !== 'unresolved' ? (
                  <DropdownMenu.Item
                    className="font-medium flex gap-2 items-center w-full"
                    data-intent="unresolve"
                    onSelect={handleOnSelect}
                  >
                    <Icon.FolderUp />
                    <span>{error.status === 'archived' ? 'Unarchive' : 'Unresolve'}</span>
                  </DropdownMenu.Item>
                ) : null}
                {error.status !== 'archived' ? (
                  <DropdownMenu.Item
                    className="font-medium flex gap-2 items-center w-full"
                    data-intent="archive"
                    onSelect={handleOnSelect}
                  >
                    <Icon.FolderPause />
                    <span>Archive</span>
                  </DropdownMenu.Item>
                ) : null}
                {error.status !== 'resolved' ? (
                  <DropdownMenu.Item
                    className="font-medium flex gap-2 items-center w-full"
                    data-intent="resolve"
                    onSelect={handleOnSelect}
                  >
                    <Icon.FolderCheck />
                    <span>Resolve</span>
                  </DropdownMenu.Item>
                ) : null}
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>
      </Link>
    </li>
  );
};
