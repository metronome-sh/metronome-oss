import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const SquaresFilled: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
      <path d="M8 14.5l6.492 -6.492"></path>
      <path d="M13.496 20l6.504 -6.504l-6.504 6.504z"></path>
      <path d="M8.586 19.414l10.827 -10.827"></path>
      <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
    </Svg>
  );
};
