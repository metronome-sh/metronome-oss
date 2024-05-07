/* eslint-disable @typescript-eslint/no-explicit-any */
import { webVitals } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { Section } from '../../../../components';
import { RoutesTable } from './RoutesTable';
import { RoutesTableLoadingState } from './RoutesTableLoadingState';

export const WebVitalsByRouteSection: FunctionComponent = () => {
  const { webVitalsBreakdownByRoute } = useLoaderData() as {
    webVitalsBreakdownByRoute?: ReturnType<typeof webVitals.breakdownByRoute>;
  };

  invariant(webVitalsBreakdownByRoute, 'webVitalsBreakdownByRoute was not found in loader data');

  return (
    <Section>
      <Section.Title title="Breakdown by route" />
      <Suspense fallback={<RoutesTableLoadingState />}>
        <Await resolve={webVitalsBreakdownByRoute}>
          <RoutesTable />
        </Await>
      </Suspense>
    </Section>
  );
};
