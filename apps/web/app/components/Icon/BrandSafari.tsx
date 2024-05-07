import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const BrandSafari: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M8 16l2 -6l6 -2l-2 6l-6 2"></path>
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
    </Svg>
  );
};
