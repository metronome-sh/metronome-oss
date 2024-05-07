import { type FunctionComponent, type ReactNode } from 'react';

import { Icon } from '#app/components';
import { HoverCard } from '#app/components/HoverCard';
import { cn } from '#app/components/utils';
import { type FilterUpdate } from '#app/filters/filters.types';

import { UpdateOption } from './UpdateOption';

export type UpdatesProps = {
  updates: FilterUpdate[];
  trigger?: ReactNode;
};

export const Updates: FunctionComponent<UpdatesProps> = ({ updates, trigger }) => {
  if (updates.length === 0) return null;

  console.log({ trigger, updates });

  return (
    <HoverCard openDelay={0.5} closeDelay={0}>
      <div className={cn(!trigger && 'text-right flex-grow')}>
        <HoverCard.Trigger asChild>
          <span className="group">
            <Icon.AlertSquareRoundedOutline className="stroke-yellow-400 text-yellow-500" />
          </span>
        </HoverCard.Trigger>
      </div>
      <HoverCard.Content className="px-2 pt-1 py-2 pointer-events-none w-fit">
        <div className="pb-1">
          Selecting this value will update the following {updates.length > 1 ? 'filters' : 'filter'}
        </div>
        {updates.map((update) => {
          return (
            <div key={update.from.filterId} className="flex gap-2 items-center">
              <UpdateOption option={update.from} />
              <span className="">
                <Icon.ArrowNarrowRight />
              </span>
              <UpdateOption option={update.to} />
            </div>
          );
        })}
      </HoverCard.Content>
    </HoverCard>
  );
};
