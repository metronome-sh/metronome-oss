import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const RouteSquareTwo: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M14 5a2 2 0 0 0 -2 2v10a2 2 0 0 1 -2 2"></path>
      <path d="M3 17h4v4h-4z"></path>
      <path d="M17 3h4v4h-4z"></path>
    </Svg>
  );
};
