import { ReactNode, type FunctionComponent } from 'react';

import { Separator } from '#app/components';
import { cn } from '#app/components/utils';

export type PageHeaderProps = {
  className?: string;
  separatorClassName?: string;
  title: ReactNode;
  description?: ReactNode;
};

export const Heading: FunctionComponent<PageHeaderProps> = ({
  className,
  title,
  description,
  separatorClassName,
}) => {
  return (
    <div>
      <div className={cn('space-y-0.5 md:px-4 pt-6 pb-6', className)}>
        <h1 className="text-2xl font-medium">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="md:px-4 pb-2 md:pb-0">
        <Separator className={cn('opacity-50', separatorClassName)} />
      </div>
    </div>
  );
};
