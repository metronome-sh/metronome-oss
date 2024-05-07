import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const DeviceDesktop: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"></path>
      <path d="M7 20h10"></path>
      <path d="M9 16v4"></path>
      <path d="M15 16v4"></path>
    </Svg>
  );
};
