import { json, type LinksFunction, type LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import path from 'path';
import favicon from '#app/images/favicon.svg';
import faviconAlt from '#app/images/favicon-alternate.png';
import faviconAltSvg from '#app/images/favicon-alternate.svg';
import socialPreview from '#app/images/social-preview.png';
import { EventProvider } from '#app/events/EventProvider';
import { getObservableRoutes } from '#app/events/getObservableRoutes';
import { handle } from '#app/handlers/handle';
import { useTimeZoneSync } from '#app/hooks/useTimeZoneSync';

import './tailwind.css';

import { getTimeZoneFromRequest } from './utils/timeZone';
const title = 'Metronome';
const metronomeUrl = 'https://metronome.sh';
// prettier-ignore
const description = "Delivering the best experience to users is critical for your success. Metronome lets you visualize how your Remix app performs from top to bottom.";
const image = `https://metronome.sh${socialPreview}`;

export const meta: MetaFunction = () => [
  { title: 'Metronome' },
  { description: 'Metronome for Remix Analytics' },
  { viewport: 'width=device-width, initial-scale=1' },
  { charset: 'utf-8' },
  { 'og:type': 'website' },
  { 'og:url': metronomeUrl },
  { 'og:title': title },
  { 'og:description': description },
  { 'og:image': image },
  { 'twitter:card': 'summary_large_image' },
  { 'twitter:url': metronomeUrl },
  { 'twitter:title': title },
  { 'twitter:description': description },
  { 'twitter:image': image },
];

export const links: LinksFunction = () => [
  { rel: 'icon', href: favicon, type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: faviconAlt },
  { rel: 'mask-icon', href: faviconAltSvg, color: '#fff' },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  const user = await auth.user({ required: false });

  const observableRoutes = getObservableRoutes?.([path.resolve(process.cwd(), 'app')]) ?? [];

  const timeZone = getTimeZoneFromRequest(request);

  return json({
    user,
    observableRoutes,
    timeZoneId: timeZone.id,
  });
}

function App() {
  useTimeZoneSync();

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body className="antialiased dark:bg-zinc-950">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  return (
    <EventProvider>
      <App />
    </EventProvider>
  );
}
