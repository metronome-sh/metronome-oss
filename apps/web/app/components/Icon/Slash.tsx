import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Slash: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 5l-10 14" />
    </Svg>
  );
};
