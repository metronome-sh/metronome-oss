import { useFetchers, useSubmit } from '@remix-run/react';
import { FunctionComponent, ReactNode, useCallback, useMemo } from 'react';
import { invariant } from 'ts-invariant';
import { cn } from '#app/components/utils';
import { Icon } from '#app/components/Icon';
import { Select } from '#app/components/Select';
import { useRelativeErrorDates } from '../../../hooks/useRelativeErrorDates';
import { useErrorHashLoaderData } from '../hooks/useErrorHashLoaderData';

export const Error: FunctionComponent = () => {
  const { error } = useErrorHashLoaderData();
  const { lastSeenFormatted, relativeLastSeen } = useRelativeErrorDates(error);
  const submit = useSubmit();
  const fetcher = useFetchers().find((fetcher) => fetcher.key === 'error-list-item:' + error.hash);

  const handleValueChange = useCallback(
    (intent: string) => {
      invariant(intent, 'intent must be defined');

      submit(new FormData(), {
        method: 'post',
        action: `./?index&intent=${intent}`,
        fetcherKey: `error-list-item:${error.hash}`,
        navigate: false,
        unstable_flushSync: true,
      });
    },
    [error],
  );

  const errorValue = useMemo(() => {
    if (fetcher) {
      if (fetcher.state === 'submitting') {
        const url = new URL(fetcher.formAction ?? '', 'http://localhost');
        const intent = url.searchParams.get('intent');
        if (intent) return intent;
      }

      if (fetcher.data) return fetcher.data.intent;
    }

    return error.status.substring(0, error.status.length - 1);
  }, [fetcher, error.status]);

  return (
    <div className="md:px-4 flex justify-between flex-wrap-reverse sm:flex-nowrap gap-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Highlight
          className={cn('*:!text-white', {
            'border-green-700': error.kind === 2,
            'border-blue-700': error.kind === 1,
          })}
          value={
            error.kind === 2 ? (
              <>
                <Icon.Monitor /> <span className="pl-1">Client</span>
              </>
            ) : (
              <>
                <Icon.Server /> <span className="pl-1">Server</span>
              </>
            )
          }
        />
        <Highlight title="Error ID" value={error.hash} />
        <Highlight title="Date" value={`${lastSeenFormatted} (${relativeLastSeen})`} />
      </div>
      <div className="flex justify-end flex-grow sm:pl-8 sm:max-w-40">
        <Select onValueChange={handleValueChange} value={errorValue}>
          <Select.Trigger className="text-nowrap">
            <Select.Value placeholder="Select a status" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Label>Select an action</Select.Label>

              <Select.Item data-intent="unresolve" value="unresolve">
                <Icon.FolderUp />
                <span className="pl-2">Unresolved</span>
              </Select.Item>
              <Select.Item data-intent="archive" value="archive">
                <Icon.FolderPause />
                <span className="pl-2">Archived</span>
              </Select.Item>
              <Select.Item data-intent="resolve" value="resolve">
                <Icon.FolderCheck />
                <span className="pl-2">Resolved</span>
              </Select.Item>
            </Select.Group>
          </Select.Content>
        </Select>
      </div>
    </div>
  );
};

const Highlight: FunctionComponent<{ title?: string; value: ReactNode; className?: string }> = ({
  title,
  value,
  className,
}) => {
  return (
    <div className="space-y-2">
      <span className={cn('flex items-center border w-fit rounded-md px-2 divide-x', className)}>
        {title ? <span className="inline-block py-1 pr-2 text-white">{title}</span> : null}
        <span className={cn('flex items-center py-1 text-muted-foreground', { 'pl-2': !!title })}>
          {value}
        </span>
      </span>
    </div>
  );
};
