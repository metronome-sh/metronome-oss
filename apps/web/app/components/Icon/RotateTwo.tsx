import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const RotateTwo: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M15 4.55a8 8 0 0 0 -6 14.9m0 -4.45v5h-5"></path>
      <path d="M18.37 7.16l0 .01"></path>
      <path d="M13 19.94l0 .01"></path>
      <path d="M16.84 18.37l0 .01"></path>
      <path d="M19.37 15.1l0 .01"></path>
      <path d="M19.94 11l0 .01"></path>
    </Svg>
  );
};
