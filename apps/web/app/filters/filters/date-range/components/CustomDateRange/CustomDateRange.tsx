import { type FunctionComponent, useCallback, useMemo, useState } from 'react';
import { type SelectRangeEventHandler } from 'react-day-picker';

import { Calendar, cn } from '#app/components';
import { type CustomComponentProps } from '#app/filters/filters.types';
import { useMediaQuery } from '#app/hooks/useMediaQuery';

import { Updates } from '../../../../components/Filter/components/Updates';

export const CustomDateRange: FunctionComponent<CustomComponentProps> = ({
  setValue,
  value,
  updates,
}) => {
  const range = useMemo(() => {
    if (value.length === 0) {
      return undefined;
    }

    return {
      from: new Date(value.at(0)!),
      to: value.at(1) ? new Date(value.at(1)!) : undefined,
    };
  }, [value]);

  const setDate = useCallback<SelectRangeEventHandler>(
    (newRange) => {
      if (newRange === undefined) {
        setValue([]);
        return;
      }

      setValue?.(
        [
          newRange?.from?.toISOString() ?? new Date().toISOString(),
          newRange?.to?.toISOString(),
        ].filter(Boolean) as string[],
      );
    },
    [setValue],
  );

  const [numberOfMonths, setNumberOfMonths] = useState(2);

  useMediaQuery({ size: 'sm' }, (matches) => {
    setNumberOfMonths(matches ? 2 : 1);
  });

  return (
    <div>
      <div className="flex justify-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setDate}
          numberOfMonths={numberOfMonths}
        />
      </div>
      <div
        className={cn('py-1 flex gap-1 text-xs', {
          invisible: updates.length === 0,
        })}
      >
        <span>
          Selecting this date range will update {updates.length > 1 ? 'some filters' : 'a filter'}
        </span>
        <Updates
          updates={updates}
          trigger={
            <span className="underline decoration-dashed text-yellow-500 cursor-pointer text-left">
              More info
            </span>
          }
        />
      </div>
    </div>
  );
};
