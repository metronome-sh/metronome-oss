import { HoverCard } from '#app/components/HoverCard';
import { Icon } from '#app/components/Icon';
import { FunctionComponent } from 'react';

type ErrorListRoutesPillProps = {
  routes: string[];
};

export const ErrorListRoutesPill: FunctionComponent<ErrorListRoutesPillProps> = ({ routes }) => {
  return (
    <HoverCard>
      <HoverCard.Trigger asChild>
        <div className="px-1 py-0.5 border rounded flex items-center gap-1">
          <Icon.RouteSquareTwo />
          <span>
            {routes[0]} {routes.length > 1 ? ` and ${routes.length - 1} more` : ''}{' '}
          </span>
        </div>
      </HoverCard.Trigger>
      {routes.length > 1 ? (
        <HoverCard.Content align="start" sideOffset={8} className="p-2 flex flex-col gap-2 w-auto">
          <div>
            {routes.slice(1).map((route) => (
              <div key={route} className="text-sm space-x-2">
                <Icon.RouteSquareTwo />
                <span>{route}</span>
              </div>
            ))}
          </div>
        </HoverCard.Content>
      ) : null}
    </HoverCard>
  );
};
