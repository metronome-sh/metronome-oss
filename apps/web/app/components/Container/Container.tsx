import { FunctionComponent, PropsWithChildren } from 'react';

import { Button, Icon } from '../index';
import { cn } from '../utils';

export type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export const Container: FunctionComponent<ContainerProps> = ({ className, children }) => {
  return (
    <div className={cn('min-h-[calc(100dvh)] flex flex-col w-full dark:bg-zinc-900/50', className)}>
      {children}
      <div className="mt-10 pb-2 text-center flex-shrink-0 opacity-50">
        <span className="text-muted-foreground text-sm">
          Made with <Icon.HeartFilled className="text-red-500" /> by{' '}
          <Button variant="link" className="px-0" asChild>
            <a href="https://github.com/ericktamayo" target="_blank" rel="noreferrer">
              Erick Tamayo
            </a>
          </Button>
        </span>
      </div>
    </div>
  );
};
