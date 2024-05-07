import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const SquareFilled: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M19 2h-14a3 3 0 0 0 -3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3 -3v-14a3 3 0 0 0 -3 -3z"
        strokeWidth="0"
        fill="currentColor"
      />
    </Svg>
  );
};
