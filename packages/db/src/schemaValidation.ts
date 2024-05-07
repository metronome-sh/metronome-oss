import { z } from 'zod';

export const BrowserDataSchema = z.object({
  pathname: z.string(),
  query: z.string(),
  screen: z.string(),
  referrer: z.string(),
  hostname: z.string(),
  language: z.string(),
  connection: z.string(),
  deviceCategory: z.string(),
});

export const RemixDataSchema = z.object({
  hash: z.string(),
  routeId: z.string(),
  routePath: z.string().optional(),
});

export const IdentifierSchema = z.object({
  ip: z.string(),
  ua: z.string(),
});

export const MetronomeInfoSchema = z.object({
  version: z.string(),
  adapter: z.string(),
});

export const PageviewEventSchema = z.object({
  name: z.literal('pageview'),
  details: z
    .object({
      timestamp: z.number(),
    })
    .merge(BrowserDataSchema)
    .merge(RemixDataSchema)
    .merge(IdentifierSchema),
});

export const NavigateAwayEventSchema = z.object({
  name: z.literal('navigate-away'),
  details: z
    .object({
      timestamp: z.number(),
    })
    .merge(BrowserDataSchema)
    .merge(RemixDataSchema)
    .merge(IdentifierSchema),
});

export const WebVitalEventSchema = z.object({
  name: z.literal('web-vital'),
  details: z
    .object({
      timestamp: z.number(),
      metric: z.object({
        id: z.string(),
        name: z.enum(['CLS', 'FID', 'TTFB', 'LCP', 'FCP', 'INP']),
        value: z.number(),
        rating: z.enum(['good', 'needs-improvement', 'poor']),
        // prettier-ignore
        navigationType: z.enum(["navigate", "reload", "back-forward", "back-forward-cache", "prerender", "restore"]),
      }),
    })
    .merge(BrowserDataSchema)
    .merge(RemixDataSchema)
    .merge(IdentifierSchema),
});

export const RequestEventSchema = z.object({
  name: z.literal('request'),
  details: z
    .object({
      adapter: z.string(),
      timestamp: z.number(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      errored: z.boolean(),
      duration: z.string(),
      statusCode: z.number(),
      pathname: z.string(),
      type: z.enum(['document', 'data']),
      startTime: z.string(),
      hash: z.string(),
      version: z.string(),
    })
    .merge(IdentifierSchema),
});

const RemixFunctionEventSchema = z.object({
  details: z
    .object({
      timestamp: z.number(),
      startTime: z.string().nullable(),
      duration: z.string(),
      errored: z.boolean(),
      httpMethod: z.string(),
      httpStatusCode: z.number(),
      httpStatusText: z.string(),
      httpPathname: z.string(),
    })
    .merge(RemixDataSchema)
    .merge(IdentifierSchema)
    .merge(MetronomeInfoSchema),
});

export const ActionEventSchema = z
  .object({
    name: z.literal('action'),
  })
  .merge(RemixFunctionEventSchema);

export const LoaderEventSchema = z
  .object({
    name: z.literal('loader'),
  })
  .merge(RemixFunctionEventSchema);

export const EventSchema = z.union([PageviewEventSchema, WebVitalEventSchema]);

export const EventsSchema = z.array(EventSchema);
