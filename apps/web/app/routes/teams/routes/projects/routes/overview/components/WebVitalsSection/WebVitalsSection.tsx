import { webVitals } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatDuration } from '#app/utils';

import { Section } from '../../../../components/Section';
import { useIsNavigatingOverview } from '../../hooks/useIsNavigatingOverview';
import { WebVitalsCard } from './components/WebVitalsCard';

const VITALS = [
  { name: 'LCP', median: '2.5 s', p10: '4.0 s' },
  { name: 'FID', median: '100 ms', p10: '300 ms' },
  { name: 'CLS', median: '0.1', p10: '0.25' },
  { name: 'INP', median: '200 ms', p10: '500 ms' },
];

const WebVitals: FunctionComponent = () => {
  const { webVitalsOverview } = useLoaderData() as {
    webVitalsOverview?: ReturnType<typeof webVitals.overview>;
  };

  const { webVitalsOverview: webVitalsOverviewEvent } = useEventData() as {
    webVitalsOverview?: Awaited<ReturnType<typeof webVitals.overview>>;
  };

  invariant(webVitalsOverview, 'requestOverview was not found in loader data');

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return (
      <>
        {VITALS.map((vital) => (
          <WebVitalsCard.Skeleton
            key={vital.name}
            name={vital.name}
            median={vital.median}
            p10={vital.p10}
          />
        ))}
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <>
          {VITALS.map((vital) => (
            <WebVitalsCard.Skeleton
              key={vital.name}
              name={vital.name}
              median={vital.median}
              p10={vital.p10}
            />
          ))}
        </>
      }
    >
      <Await
        resolve={webVitalsOverview}
        errorElement={
          <>
            {VITALS.map((vital) => (
              <WebVitalsCard.Error key={vital.name} />
            ))}
          </>
        }
      >
        {(resolvedWebVitalsOverview) => {
          const overview = Object.fromEntries(
            (webVitalsOverviewEvent ?? resolvedWebVitalsOverview).map((vital) => [
              vital.name,
              {
                ...vital,
                parsed: {
                  ...vital.values,
                  p75:
                    vital.name === 'CLS'
                      ? vital.values.p75 !== null
                        ? `${Math.round(vital.values.p75 * 100) / 100}`
                        : '—'
                      : formatDuration(vital.values.p75, 'ms'),
                },
              },
            ]),
          );

          return (
            <>
              {VITALS.map((vital) => {
                return (
                  <WebVitalsCard
                    key={`${vital.name}-${overview[vital.name].values.p75}`}
                    name={vital.name}
                    median={vital.median}
                    p10={vital.p10}
                    score={overview[vital.name].scores.p75}
                    value={overview[vital.name].parsed.p75}
                  />
                );
              })}
            </>
          );
        }}
      </Await>
    </Suspense>
  );
};

export const WebVitalsSection: FunctionComponent = () => {
  return (
    <Section>
      <Section.Title title="Core Web Vitals" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <WebVitals />
      </div>
    </Section>
  );
};
