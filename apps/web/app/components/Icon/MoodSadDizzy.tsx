import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const MoodSadDizzy: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
      <path d="M14.5 16.05a3.5 3.5 0 0 0 -5 0"></path>
      <path d="M8 9l2 2"></path>
      <path d="M10 9l-2 2"></path>
      <path d="M14 9l2 2"></path>
      <path d="M16 9l-2 2"></path>
    </Svg>
  );
};
