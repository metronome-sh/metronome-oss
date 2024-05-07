import { loaders } from '../schema';
import { LoaderEventSchema } from '../schemaValidation';
import { LoaderEvent } from '../types';
import {
  createRemixFunctionInsert,
  createRemixFunctionOverview,
  createRemixFunctionOverviewSeries,
  createRemixFunctionWatch,
} from '../utils/remixFunctions';

export function isLoaderEvent(event: unknown): event is LoaderEvent {
  const result = LoaderEventSchema.safeParse(event);
  return result.success;
}

export function convertSpanToLoaderEvent(span: any): LoaderEvent {
  const name = 'loader';

  const errored = span.attributes?.['app.errored'] === 'true';

  const details = {
    timestamp: span.startTime,
    startTime: `${span.startTime}`,
    duration: `${(span.endTime - span.startTime) * 1_000_000}`,
    errored,
    httpMethod: span.attributes?.['http.method'],
    httpStatusCode: errored ? 500 : Number(span.attributes?.['http.status_code']),
    httpStatusText: '',
    httpPathname: span.attributes?.['http.pathname'],
    hash: span.attributes?.['app.version'],
    routeId: span.attributes?.['remix.route_id'],
    routePath: span.attributes?.['remix.route_path'],
    ip: span.attributes?.['client.address'],
    ua: span.attributes?.['user_agent.original'],
    version: span.attributes?.['metronome.version'],
    adapter: 'vite',
  };

  const loaderEvent = { name, details };

  if (!isLoaderEvent(loaderEvent)) {
    throw new Error('Invalid loader event');
  }

  return loaderEvent;
}

export const insert = createRemixFunctionInsert(loaders);

export const overview = createRemixFunctionOverview(loaders);

export const overviewSeries = createRemixFunctionOverviewSeries(loaders);

export const watch = createRemixFunctionWatch(loaders);
