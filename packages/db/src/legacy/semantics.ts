export const SemanticAttributes = {
  // Device
  DEVICE_CONNECTION: 'device.connection',

  DEVICE_USER_AGENT: 'device.ua',

  // App
  APP_HASH: 'app.hash',

  // Remix
  /**
   * The Remix route id
   *
   * @deprecated Use REMIX_ROUTE_ID instead
   */
  REMIX_ROUTE: 'remix.route',

  REMIX_ROUTE_ID: 'remix.route.id',

  REMIX_PATHNAME: 'remix.pathname',

  REMIX_FUNCTION: 'remix.function',

  REMIX_RUNTIME: 'remix.runtime',

  REMIX_REQUEST_TYPE: 'remix.request.type',

  // Web Vitals
  WEB_VITAL_NAME: 'vital.name',

  WEB_VITAL_VALUE: 'vital.value',

  WEB_VITAL_ID: 'vital.id',

  DEVICE_CLIENT_NAME: 'device.client.name',

  DEVICE_CLIENT_VERSION: 'device.client.version',

  DEVICE_CATEGORY: 'device.category',

  DEVICE_TYPE: 'device.type',

  DEVICE_BRAND: 'device.brand',

  // Internal
  /**
   * The metronome version that was used to generate the span or metric.
   */
  METRONOME_VERSION: 'metronome.version',

  /**
   * Internal error flag
   */
  INTERNAL_ERROR: 'internal.error',

  /**
   * The span or metric project ID.
   */
  PROJECT_ID: 'project.id',

  ORGANIZATION_ID: 'organization.id',

  // Common
  DEPRECATED_HTTP_STATUS_TEXT: 'http.status.text',

  HTTP_STATUS_MESSAGE: 'http.status.message',

  HTTP_STATUS_CODE: 'http.status.code',

  HTTP_METHOD: 'http.method',

  /**
   * The HTTP pathname
   *
   * @deprecated Use HTTP_PATHNAME instead
   */
  HTTP_URL: 'http.url',

  /**
   * The HTTP pathname
   */
  HTTP_PATHNAME: 'http.pathname',

  /**
   * The exception name
   */
  EXCEPTION_NAME: 'exception.name',

  /**
   * The exception message
   */
  EXCEPTION_MESSAGE: 'exception.message',

  /**
   * The exception stack trace
   */
  EXCEPTION_STACK: 'exception.stack',

  /**
   * The related span id.
   */
  RELATED_SPAN_ID: 'related.span_id',
} as const;
