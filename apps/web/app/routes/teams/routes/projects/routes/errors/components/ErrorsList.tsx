import { Icon } from '#app/components/Icon';
import { Await, useFetchers } from '@remix-run/react';
import { FunctionComponent, Suspense, useMemo } from 'react';
import { useErrorsLoaderData } from '../hooks/useErrorsLoaderData';
import { ErrorListItem } from './ErrorListItem';
import { useIsNavigatingErrors } from '../hooks/useIsNavigatingErrors';
import { useErrorsEventData } from '../hooks/useErrorsEventData';

const Fallback = () => (
  <div className="flex-grow flex items-center justify-center">
    <Icon.LoaderTwo className="w-6 h-6 animate-spin" />
  </div>
);

export const ErrorsList: FunctionComponent = () => {
  const { projectErrors } = useErrorsLoaderData();
  const { projectErrors: projectErrorsEvent } = useErrorsEventData(projectErrors);
  const isNavigating = useIsNavigatingErrors();
  const fetchers = useFetchers();

  const hiddenHashes = useMemo(() => {
    const listItemFetchers = fetchers.filter((fetcher) =>
      fetcher.key.startsWith('error-list-item:'),
    );

    const hashes = listItemFetchers.flatMap(({ formData }) => {
      if (!formData) return [];
      const hashes = formData.getAll('hashes');
      return hashes;
    });

    return hashes;
  }, [fetchers]);

  if (isNavigating) return <Fallback />;

  return (
    <Suspense fallback={<Fallback />}>
      <Await resolve={projectErrors}>
        {(projectErrorsResolved) => {
          const toRender = (projectErrorsEvent ?? projectErrorsResolved).filter((error) => {
            return !hiddenHashes.includes(error.hash);
          });

          if (toRender.length === 0)
            return (
              <div className="h-full flex flex-col justify-center items-center flex-grow">
                <Icon.Confetti className="w-15 h-15 text-zinc-700" strokeWidth={0.75} />
                <div className="text-sm pt-4 text-zinc-500">Hooray! No errors found.</div>
              </div>
            );

          return (
            <div className="space-y-4">
              <ul className="">
                {toRender.map((error) => (
                  <ErrorListItem key={error.hash} error={error} />
                ))}
              </ul>
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
};
