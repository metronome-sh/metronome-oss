import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const ClockHourTwo: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 12l3 -2" />
      <path d="M12 7v5" />
    </Svg>
  );
};
