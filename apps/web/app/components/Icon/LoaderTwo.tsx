import { FunctionComponent } from 'react';

import { Svg, SvgProps } from './Svg';

export const LoaderTwo: FunctionComponent<SvgProps> = (props) => {
  return (
    <Svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 3a9 9 0 1 0 9 9"></path>
    </Svg>
  );
};
