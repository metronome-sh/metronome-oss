import { Link } from '@remix-run/react';
import { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn, Icon } from '..';

type BreadcrumbProps = PropsWithChildren<{
  chevronClassName?: string;
  breadcrumbOutletId?: string;
  link?: string;
}>;

export const Breadcrumb: FunctionComponent<BreadcrumbProps> = ({
  chevronClassName,
  breadcrumbOutletId = 'default-breadcrumb',
  link,
  children,
}) => {
  const [breadcrumbOutlet, setBreadcrumbOutlet] = useState<HTMLOListElement>();

  useEffect(() => {
    const outletElement = document.getElementById(breadcrumbOutletId) as HTMLOListElement;
    if (outletElement) {
      setBreadcrumbOutlet(outletElement);
    }
  }, [breadcrumbOutletId]);

  if (!breadcrumbOutlet) return null;

  return createPortal(
    <li className="flex gap-1 items-center text-sm">
      <Icon.ChevronRight
        strokeWidth={2}
        className={cn('stroke-muted-foreground/50 breadcrumb-chevron', chevronClassName)}
      />
      {/* <Icon.Slash
        strokeWidth={2}
        className={cn('stroke-muted-foreground/50 breadcrumb-chevron w-6 h-6', chevronClassName)}
      /> */}
      {link ? (
        <Link to={link} prefetch="intent" className={cn(link && 'hover:underline')}>
          {children}
        </Link>
      ) : (
        <>{children}</>
      )}
    </li>,
    breadcrumbOutlet,
  );
};
