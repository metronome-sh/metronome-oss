import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const CircleFilled: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z"
        strokeWidth="0"
        fill="currentColor"
      />
    </Svg>
  );
};
