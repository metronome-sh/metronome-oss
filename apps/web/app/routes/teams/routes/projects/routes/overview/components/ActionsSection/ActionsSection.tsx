import { type FunctionComponent } from 'react';

import { Section } from '../../../../components/Section';
import { Chart } from './components/Chart';
import { Duration } from './components/Duration';
import { Errors } from './components/Errors';
import { Invocations } from './components/Invocations';
import { useTeamProjectLoaderData } from '../../../../hooks/useTeamProjectLoaderData';
import { cn } from '#app/components/utils';

export const ActionsSection: FunctionComponent = () => {
  const { project } = useTeamProjectLoaderData();

  return (
    <Section>
      <Section.Title title="Actions" />
      <div>
        <div className="relative w-full rounded-lg overflow-hidden border border-muted/50">
          <div className="p-2 lg:p-4 flex justify-between gap-4 flex-wrap md:flex-nowrap">
            <div className={cn('flex-grow', project.isCloudflare ? 'md:w-1/2' : 'md:w-1/3')}>
              <Invocations />
            </div>
            <div className={cn('flex-grow', project.isCloudflare ? 'md:w-1/2' : 'md:w-1/3')}>
              <Errors />
            </div>
            {!project.isCloudflare ? (
              <div className="flex-grow md:w-1/3">
                <Duration />
              </div>
            ) : null}
          </div>
          <div className="h-40 lg:h-60">
            <Chart />
          </div>
        </div>
      </div>
    </Section>
  );
};
