import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const TriangleInvertedFilled: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M20.118 3h-16.225a2.914 2.914 0 0 0 -2.503 4.371l8.116 13.549a2.917 2.917 0 0 0 4.987 .005l8.11 -13.539a2.914 2.914 0 0 0 -2.486 -4.386z"
        strokeWidth="0"
        fill="currentColor"
      ></path>
    </Svg>
  );
};
