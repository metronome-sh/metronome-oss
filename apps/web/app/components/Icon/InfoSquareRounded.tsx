import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const InfoSquareRounded: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 9h.01"></path>
      <path d="M11 12h1v4h1"></path>
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
    </Svg>
  );
};
