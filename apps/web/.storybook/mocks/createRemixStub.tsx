import { EventProvider } from '#app/events/EventProvider.js';
import { Outlet, defer, json } from '@remix-run/react';
import { createRemixStub as createRemixStubPrimitive } from '@remix-run/testing';
import { loader as rootLoader } from '../../app/root';
import { error, project, projectErrors, projects, team, user } from '../stubs';
import TeamComponent, { loader as teamLoader } from '../../app/routes/teams/$teamSlug.route';
import ProjectComponent, {
  loader as teamProjectLoader,
} from '../../app/routes/teams/routes/projects/$teamSlug.$projectSlug.route';
import ErrorsComponent, {
  loader as errorsLoader,
} from '../../app/routes/teams/routes/projects/routes/errors/$teamSlug.$projectSlug.errors.route';
import ErrorHashComponent, {
  loader as errorHashLoader,
} from '../../app/routes/teams/routes/projects/routes/errors/routes/$hash/$teamSlug.$projectSlug.errors_.$hash.route';

type Routes = Parameters<typeof createRemixStubPrimitive>[0];
type Context = Parameters<typeof createRemixStubPrimitive>[1];

export type StubRouteObject = Parameters<typeof createRemixStubPrimitive>[0][number];

export function createRemixStub(
  routes: Routes,
  context?: Context,
  mocks?: any, //MockContextValue,
) {
  // Inject the context in each route and children
  const injectRouteContext = (route: Routes[number]) => {
    const routeWithContext: Routes[number] = {
      ...route,
      Component: () => {
        const Component = route.Component;

        return Component ? (
          <EventProvider>
            <Component />
          </EventProvider>
        ) : (
          <Outlet />
        );
      },
      // Component: <MockProvider mocks={mocks ?? {}}>{route.element}</MockProvider>,
    };

    if (routeWithContext.children) {
      routeWithContext.children = routeWithContext.children.map((child) => {
        return injectRouteContext(child);
      }) as Routes[number]['children'];
    }

    return routeWithContext;
  };

  const routesWithContext = routes.map((route) => {
    return injectRouteContext(route);
  });

  return createRemixStubPrimitive(routesWithContext, context);
}

const rootRoute: StubRouteObject = {
  id: 'root',
  path: '',
  loader: async (): ReturnType<typeof rootLoader> => {
    return json({ user, observableRoutes: [], timeZoneId: 'UTC' });
  },
  Component: Outlet,
};

export const createRootRouteStub = (overrides?: Partial<StubRouteObject>) => {
  return createRemixStub([{ ...rootRoute, ...(overrides ?? {}) }]);
};

const teamSlugRoute: StubRouteObject = {
  id: '$teamSlug',
  path: `:teamSlug`,
  Component: TeamComponent,
  loader: async (): ReturnType<typeof teamLoader> => {
    return json({ team, projects, lastSelectedProjectSlug: null });
  },
};

export const createTeamSlugRouteStub = (overrides?: Partial<StubRouteObject>) => {
  return createRemixStub([
    { ...rootRoute, children: [{ ...teamSlugRoute, ...(overrides ?? {}) }] },
  ]);
};

const projectSlugRoute: StubRouteObject = {
  id: '$teamSlug.$projectSlug',
  path: `:projectSlug`,
  Component: ProjectComponent,
  loader: async (): ReturnType<typeof teamProjectLoader> =>
    defer({
      project,
      semver: Promise.resolve({
        latestClientVersion: '0.0.1',
        needsToUpdate: false,
      }),
      unseenErrorsCount: Promise.resolve(0),
    }),
};

export const createProjectSlugRouteStub = (overrides?: Partial<StubRouteObject>) => {
  return createRemixStub([
    {
      ...rootRoute,
      children: [
        {
          ...teamSlugRoute,
          children: [{ ...projectSlugRoute, ...(overrides ?? {}) }],
        },
      ],
    },
  ]);
};

export type ErrorsRouteLoader = ReturnType<typeof errorsLoader>;

const errorsRoute: StubRouteObject = {
  id: '$teamSlug.$projectSlug.errors',
  path: `errors`,
  Component: ErrorsComponent,
  loader: async (): ErrorsRouteLoader => {
    return defer({ projectErrors: Promise.resolve(projectErrors), interval: 'today' });
  },
};

export const createErrorsRouteStub = (overrides?: Partial<StubRouteObject>) => {
  const RemixStub = createRemixStub([
    {
      ...rootRoute,
      children: [
        {
          ...teamSlugRoute,
          children: [
            {
              ...projectSlugRoute,
              children: [{ ...errorsRoute, ...(overrides ?? {}) }],
            },
          ],
        },
      ],
    },
  ]);

  return function ErrorsRouteStub() {
    return <RemixStub initialEntries={[`/${team.slug}/${project.slug}/errors`]} />;
  };
};

export type ErrorHashRouteLoader = ReturnType<typeof errorHashLoader>;

const errorsHashRoute: StubRouteObject = {
  id: '$teamSlug.$projectSlug.errors_.$hash',
  path: `errors/:hash`,
  Component: ErrorHashComponent,
  loader: async (): ErrorHashRouteLoader => {
    return defer({});
  },
};

export const createErrorHashRouteStub = (overrides?: Partial<StubRouteObject>) => {
  const RemixStub = createRemixStub([
    {
      ...rootRoute,
      children: [
        {
          ...teamSlugRoute,
          children: [
            {
              ...projectSlugRoute,
              children: [{ ...errorsHashRoute, ...(overrides ?? {}) }],
            },
          ],
        },
      ],
    },
  ]);

  return function ErrorHashRouteStub() {
    return <RemixStub initialEntries={[`/${team.slug}/${project.slug}/errors/${error.hash}`]} />;
  };
};
