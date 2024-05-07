import { ActionEvent, LoaderEvent, RequestEvent, WebVitalEvent } from '../types';
import { LegacySpan } from './legacySpan';
import { SemanticAttributes } from './semantics';

export function transformLegacyRequest(span: LegacySpan): RequestEvent {
  return {
    name: 'request',
    details: {
      adapter: span.attributes[SemanticAttributes.REMIX_RUNTIME],
      timestamp: span.timestamp,
      method: span.attributes[SemanticAttributes.HTTP_METHOD],
      duration: span.durationNano,
      errored: span.attributes[SemanticAttributes.HTTP_STATUS_CODE] >= 400,
      pathname: span.attributes[SemanticAttributes.HTTP_URL],
      statusCode: span.attributes[SemanticAttributes.HTTP_STATUS_CODE],
      type: span.attributes[SemanticAttributes.REMIX_REQUEST_TYPE],
      startTime: span.startNano,
      version: span.attributes[SemanticAttributes.METRONOME_VERSION],
      ip: '',
      ua: '',
      hash: '',
    },
  };
}

export function transformLegacyLoader(span: LegacySpan): LoaderEvent {
  return {
    name: 'loader',
    details: {
      adapter: 'unknown',
      timestamp: span.timestamp,
      duration: span.durationNano,
      errored: span.attributes[SemanticAttributes.HTTP_STATUS_CODE] >= 400,
      startTime: span.startNano,
      version: span.attributes[SemanticAttributes.METRONOME_VERSION],
      httpMethod: 'GET',
      httpPathname: span.attributes[SemanticAttributes.HTTP_URL] || '',
      httpStatusCode: span.attributes[SemanticAttributes.HTTP_STATUS_CODE],
      httpStatusText: span.attributes[SemanticAttributes.DEPRECATED_HTTP_STATUS_TEXT],
      routeId: span.attributes[SemanticAttributes.REMIX_ROUTE],
      ip: '',
      ua: '',
      hash: '',
    },
  };
}

export function transformLegacyAction(span: LegacySpan): ActionEvent {
  return {
    name: 'action',
    details: {
      adapter: 'unknown',
      timestamp: span.timestamp,
      duration: span.durationNano,
      errored: span.attributes[SemanticAttributes.HTTP_STATUS_CODE] >= 400,
      startTime: span.startNano,
      version: span.attributes[SemanticAttributes.METRONOME_VERSION],
      httpMethod: 'POST',
      httpPathname: span.attributes[SemanticAttributes.HTTP_URL] || '',
      httpStatusCode: span.attributes[SemanticAttributes.HTTP_STATUS_CODE],
      httpStatusText: span.attributes[SemanticAttributes.DEPRECATED_HTTP_STATUS_TEXT],
      routeId: span.attributes[SemanticAttributes.REMIX_ROUTE],
      ip: '',
      ua: '',
      hash: '',
    },
  };
}

export function transformLegacyWebVitals(span: LegacySpan): WebVitalEvent {
  return {
    name: 'web-vital',
    details: {
      connection: span.attributes[SemanticAttributes.DEVICE_CONNECTION],
      metric: {
        id: 'unknown',
        name: span.attributes[SemanticAttributes.WEB_VITAL_NAME],
        value: span.attributes[SemanticAttributes.WEB_VITAL_VALUE],
        navigationType: 'navigate',
        rating: 'good',
      },
      timestamp: span.timestamp,
      routeId: span.attributes[SemanticAttributes.REMIX_ROUTE_ID],
      pathname: span.attributes[SemanticAttributes.REMIX_PATHNAME],
      routePath: span.attributes[SemanticAttributes.REMIX_PATHNAME],
      screen: 'unknown',
      hostname: '',
      query: '',
      deviceCategory: 'desktop',
      language: 'en-US',
      referrer: '',
      ip: '',
      ua: '',
      hash: '',
    },
  };
}
