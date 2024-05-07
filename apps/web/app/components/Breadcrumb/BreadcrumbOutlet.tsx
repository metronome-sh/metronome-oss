import { FunctionComponent } from 'react';

export interface BreadcrumbOutletProps {
  id?: string;
}

export const BreadcrumbOutlet: FunctionComponent<BreadcrumbOutletProps> = ({
  id = 'default-breadcrumb',
}) => {
  return (
    <nav aria-label="breadcrumb" className="breadcrumb">
      <ol
        className="flex gap-2 [&>li:first-child>.breadcrumb-chevron]:hidden sm:[&>li:first-child>.breadcrumb-chevron]:block"
        id={id}
      />
    </nav>
  );
};
