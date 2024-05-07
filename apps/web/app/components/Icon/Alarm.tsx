import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Alarm: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
      <path d="M12 10l0 3l2 0"></path>
      <path d="M7 4l-2.75 2"></path>
      <path d="M17 4l2.75 2"></path>
    </Svg>
  );
};
