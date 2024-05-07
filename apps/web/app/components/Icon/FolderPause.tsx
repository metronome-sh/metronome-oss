import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const FolderPause: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M13 19h-8a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v4" />
      <path d="M17 17v5" />
      <path d="M21 17v5" />
    </Svg>
  );
};
