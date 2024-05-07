import { Await, Link } from '@remix-run/react';
import { type FunctionComponent, Suspense, useRef } from 'react';

import { Avatar, Brand, Button, Icon, ScrollArea, Sheet, UserMenu } from '#app/components';
import { useRootLoaderData } from '#app/hooks/useRootLoaderData';

import { useDocsLoaderData } from '../../hooks/useDocsLoaderData';
import { Sidebar } from '..';

export const DocsHeader: FunctionComponent = () => {
  const { user } = useRootLoaderData();
  const { lastViewedProject } = useDocsLoaderData();

  return (
    <div className="fixed top-0 inset-x-0 flex w-screen h-15 border-b bg-black z-50">
      <div className="flex justify-between w-full gap-4 pr-4 pl-1 lg:pl-8 bg-background/60">
        <div className="flex items-center">
          <Sheet>
            <Sheet.Trigger asChild>
              <Button variant="outline" size="icon" className="mx-2 lg:hidden">
                <Icon.Menu className="h-6 w-6" />
              </Button>
            </Sheet.Trigger>
            <Sheet.Content side="left">
              <ScrollArea className="h-screen pb-8">
                <Sidebar inSheet />
              </ScrollArea>
            </Sheet.Content>
          </Sheet>
          <Brand.Logo className="md:hidden h-12" />
          <Brand className="hidden md:block" />
        </div>
        <div className="flex justify-between gap-4">
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Suspense>
                  <Await resolve={lastViewedProject}>
                    {(resolvedLastViewedProject) => (
                      <Button asChild variant="outline">
                        <Link
                          className="text-sm transition-colors hover:text-primary hover:bg-muted px-3 py-2 rounded-md max-w-50 sm:max-w-max"
                          to={
                            resolvedLastViewedProject
                              ? `/${user.usersToTeams[0].team.slug}/${resolvedLastViewedProject.slug}`
                              : `/${user.usersToTeams[0].team.slug}`
                          }
                        >
                          {resolvedLastViewedProject ? (
                            <>
                              <span className="whitespace-nowrap">Return to </span>
                              <span className="px-1">
                                <Avatar className="w-4 h-4 rounded-none">
                                  <Avatar.Image
                                    src={`/resources/favicon?url=${
                                      resolvedLastViewedProject.url ?? 'https://remix.run'
                                    }`}
                                    alt={resolvedLastViewedProject.name ?? 'Project avatar'}
                                  />
                                  <Avatar.Fallback className="uppercase text-[10px] font-semibold group-hover:bg-muted-foreground/40">
                                    {resolvedLastViewedProject.name?.at(0)}
                                  </Avatar.Fallback>
                                </Avatar>
                              </span>
                              <span className="truncate">{resolvedLastViewedProject?.name}</span>
                            </>
                          ) : (
                            'Dashboard'
                          )}
                        </Link>
                      </Button>
                    )}
                  </Await>
                </Suspense>
                <UserMenu />
              </>
            ) : (
              <Link
                to="/authentication/grant"
                className="text-sm transition-colors hover:text-primary hover:bg-muted px-3 py-2 rounded-md"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
