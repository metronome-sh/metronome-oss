import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const EyeClosed: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4"></path>
      <path d="M3 15l2.5 -3.8"></path>
      <path d="M21 14.976l-2.492 -3.776"></path>
      <path d="M9 17l.5 -4"></path>
      <path d="M15 17l-.5 -4"></path>
    </Svg>
  );
};
