import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const BuildingLighthouse: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 3l2 3l2 15h-8l2 -15z"></path>
      <path d="M8 9l8 0"></path>
      <path d="M3 11l2 -2l-2 -2"></path>
      <path d="M21 11l-2 -2l2 -2"></path>
    </Svg>
  );
};
