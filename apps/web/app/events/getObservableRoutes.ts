import { env } from '@metronome/env';
import { globSync } from 'glob';
import { resolve } from 'path';
import { serverOnly$ } from 'vite-env-only';
// import { fileURLToPath } from 'url';

let observableRoutes: string[] = [];

export const getObservableRoutes = serverOnly$(function getObservableRoutes(paths: string[]) {
  if (observableRoutes.length === 0 || env.dev) {
    // prettier-ignore
    const routesWithEvents = globSync(paths.map((p) => `${p}/**/*.{events.route.tsx,events.route.ts}`));

    // Strip the routesPath from the route and the extension
    observableRoutes = routesWithEvents.map((route) => {
      const routePath = route
        .split('/')
        .at(-1)!
        .replace('.events.route.tsx', '')
        .replace('.events.route.ts', '');

      return routePath;
    });
  }

  return observableRoutes;
})!;
