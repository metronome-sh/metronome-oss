import { actions } from '../schema';
import { ActionEventSchema } from '../schemaValidation';
import { ActionEvent } from '../types';
import {
  createRemixFunctionInsert,
  createRemixFunctionOverview,
  createRemixFunctionOverviewSeries,
  createRemixFunctionWatch,
} from '../utils/remixFunctions';

export function isActionEvent(event: unknown): event is ActionEvent {
  const result = ActionEventSchema.safeParse(event);
  return result.success;
}

export function convertSpanToActionEvent(span: any): ActionEvent {
  const name = 'action';

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

  const actionEvent = { name, details };

  if (!isActionEvent(actionEvent)) {
    throw new Error('Invalid loader event');
  }

  return actionEvent;
}

export const insert = createRemixFunctionInsert(actions);

export const overview = createRemixFunctionOverview(actions);

export const overviewSeries = createRemixFunctionOverviewSeries(actions);

export const watch = createRemixFunctionWatch(actions);
