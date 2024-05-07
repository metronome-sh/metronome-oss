import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const X: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </Svg>
  );
};
