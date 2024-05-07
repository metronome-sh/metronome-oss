import { Await } from '@remix-run/react';
import { FunctionComponent, ReactNode, Suspense } from 'react';
import { useErrorHashLoaderData } from '../hooks/useErrorHashLoaderData';
import { Icon } from '#app/components/Icon';
import { RouteDisplay } from '#app/components/RouteDisplay';

export const Event: FunctionComponent = () => {
  const { event } = useErrorHashLoaderData();

  return (
    <div className="md:px-4">
      <h3 className="text-lg font-medium">Tags</h3>
      <Suspense fallback={null}>
        <Await resolve={event}>
          {(resolvedEvent) => {
            if (!resolvedEvent) return null;

            const visibleKeys = [
              'http.method',
              'url.full',
              'app.version',
              'remix.route_id',
              'remix.route_path',
              'remix.function',
              'http.pathname',
              /package\..*/,
              'device.model',
            ];

            const { spanAttributes } = resolvedEvent.span;

            const attributes = Object.entries(spanAttributes)
              .filter(([key, value]) => {
                if (value === '') return false;

                return visibleKeys.some((visibleKey) => {
                  if (visibleKey instanceof RegExp) {
                    return visibleKey.test(key);
                  }
                  return visibleKey === key;
                });
              })
              .map(([key, value]) => {
                return (
                  <div key={key} className="block border w-fit rounded-md px-2 divide-x text-sm">
                    <div className="inline-block py-1 pr-2 text-muted-foreground">{key}</div>
                    <div className="inline-block py-1 pl-2 text-white tracking-wider">{value}</div>
                  </div>
                );
              });

            return (
              <div className="pt-4">
                <div className="flex gap-6 flex-wrap">
                  <TagHighlight
                    tag="remix.route_id"
                    value={<RouteDisplay route={spanAttributes['remix.route_id']} />}
                    icon={Icon.RouteSquareTwo}
                  />
                  <TagHighlight
                    tag={'package.remix.react'}
                    value={`Remix`}
                    sufix={spanAttributes['package.remix.react']}
                    icon={Icon.RemixLetterDark} // TODO make this dynamic
                  />
                  {spanAttributes['browser.name'] ? (
                    <TagHighlight
                      tag="browser.name | engine.version"
                      value={spanAttributes['browser.name']}
                      sufix={spanAttributes['engine.version']}
                      icon={Icon.BrandChrome} // TODO make this dynamic
                    />
                  ) : null}
                  {spanAttributes['os.name'] ? (
                    <TagHighlight
                      tag={spanAttributes['os.version'] ? 'os.name | os.version' : 'os.name'}
                      value={spanAttributes['os.name']}
                      sufix={spanAttributes['os.version']}
                      icon={Icon.BrandApple} // TODO make this dynamic
                    />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 pt-8">{attributes}</div>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
};

const TagHighlight: FunctionComponent<{
  tag: ReactNode;
  value: ReactNode;
  sufix?: ReactNode;
  icon: FunctionComponent<{ className?: string }>;
}> = ({ tag, value, sufix, icon: Icon }) => {
  return (
    <div className="flex items-center flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="w-7 h-7 opacity-60 stroke-1" />
        <div>
          <div>
            {value}
            {sufix ? <span className="text-muted-foreground text-xs pl-1">{sufix}</span> : null}
          </div>
          <div className="text-muted-foreground/80 text-xs">{tag}</div>
        </div>
      </div>
    </div>
  );
};
