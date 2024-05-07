import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const TerminalTwo: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M8 9l3 3l-3 3"></path>
      <path d="M13 15l3 0"></path>
      <path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
    </Svg>
  );
};
