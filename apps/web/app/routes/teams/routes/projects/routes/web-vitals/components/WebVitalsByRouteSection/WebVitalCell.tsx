import { WebVitalName } from '@metronome/db';
import { FunctionComponent } from 'react';

import { cn, Icon } from '#app/components';
import { formatDuration } from '#app/utils';

export type WebVitalCellProps = {
  value?: number | null;
  score?: number | null;
  name: WebVitalName;
};

export const WebVitalCell: FunctionComponent<WebVitalCellProps> = ({ value, name, score }) => {
  if ((value !== 0 && !value) || !score) {
    return <span>-</span>;
  }

  const ScoreIcon =
    score < 33.3333 ? Icon.TriangleFilled : score < 66.6666 ? Icon.SquareFilled : Icon.CircleFilled;

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-1">
        <ScoreIcon
          className={cn(
            'w-2 h-2',
            (score ?? 0) < 33.3333
              ? 'text-red-500'
              : (score ?? 0) < 66.6666
              ? 'text-yellow-400'
              : 'text-green-500',
          )}
        />
      </div>
      <span>
        {name === 'CLS' ? Math.round(value * 100) / 100 : formatDuration(value, 'ms', true)}
      </span>
    </div>
  );
};
