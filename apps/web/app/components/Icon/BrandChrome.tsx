import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const BrandChrome: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
      <path d="M12 9h8.4"></path>
      <path d="M14.598 13.5l-4.2 7.275"></path>
      <path d="M9.402 13.5l-4.2 -7.275"></path>
    </Svg>
  );
};
