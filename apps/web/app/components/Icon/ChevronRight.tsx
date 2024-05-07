import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const ChevronRight: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M9 6l6 6l-6 6"></path>
    </Svg>
  );
};
