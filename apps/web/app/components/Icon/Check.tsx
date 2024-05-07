import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const Check: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M5 12l5 5l10 -10"></path>
    </Svg>
  );
};
