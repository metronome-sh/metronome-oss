import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Calendar: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"></path>
      <path d="M16 3v4"></path>
      <path d="M8 3v4"></path>
      <path d="M4 11h16"></path>
      {/* <path d="M11 15h1"></path> */}
      {/* <path d="M12 15v3"></path> */}
    </Svg>
  );
};
