import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Heartbeat: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572"></path>
      <path d="M3 13h2l2 3l2 -6l1 3h3"></path>
    </Svg>
  );
};
