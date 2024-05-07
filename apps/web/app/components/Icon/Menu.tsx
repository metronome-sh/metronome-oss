import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Menu: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8l16 0" />
      <path d="M4 16l16 0" />
    </Svg>
  );
};
