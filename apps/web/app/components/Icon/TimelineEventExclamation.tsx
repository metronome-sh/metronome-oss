import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const TimelineEventExclamation: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 20m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
      <path d="M10 20h-6"></path>
      <path d="M14 20h6"></path>
      <path d="M12 15l-2 -2h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h10a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-3l-2 2z"></path>
      <path d="M12 6v2"></path>
      <path d="M12 11v.01"></path>
    </Svg>
  );
};
