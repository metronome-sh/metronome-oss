import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const FolderUp: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" />
      <path d="M19 22v-6" />
      <path d="M22 19l-3 -3l-3 3" />
    </Svg>
  );
};
