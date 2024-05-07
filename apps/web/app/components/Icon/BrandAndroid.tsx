import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const BrandAndroid: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 10l0 6"></path>
      <path d="M20 10l0 6"></path>
      <path d="M7 9h10v8a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-8a5 5 0 0 1 10 0"></path>
      <path d="M8 3l1 2"></path>
      <path d="M16 3l-1 2"></path>
      <path d="M9 18l0 3"></path>
      <path d="M15 18l0 3"></path>
    </Svg>
  );
};
