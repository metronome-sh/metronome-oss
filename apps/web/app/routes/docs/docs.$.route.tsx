import { type RenderableTreeNode } from '@markdoc/markdoc';
import { projects } from '@metronome/db';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { handle } from '#app/handlers/handle';

import { DocsHeader, Sidebar, SidebarContainer, TableOfContents } from './components';
import { useMarkdoc } from './components/Markdoc';
import { getDocumentationSections, getDocumentMarkdocContent } from './getters';
import { type DocumentHeadings } from './types';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { auth } = await handle(request);
  const user = await auth.user({ required: false });

  const path = params['*'] || 'index';

  let content: RenderableTreeNode;
  let headings: DocumentHeadings;

  try {
    ({ content, headings } = await getDocumentMarkdocContent(
      path.endsWith('.mdoc') ? path : `${path}.mdoc`,
    ));
  } catch (error) {
    console.log(error);
    throw new Response('Not found', { status: 404 });
  }

  const sections = await getDocumentationSections();

  const lastViewedProject = user ? projects.getLastViewedProject(user.id) : null;

  return defer({ sections, content, headings, lastViewedProject });
}

export default function Doc() {
  const { content } = useLoaderData<typeof loader>();

  const children = useMarkdoc(content);

  return (
    <div className="flex min-h-screen flex-col dark:black">
      <DocsHeader />
      <SidebarContainer />
      <div className="xl:px-90 pt-15 max-w-400 mx-auto w-full pb-10 leading-relaxed lg:pl-80">
        <div className="pt-8">
          <div className="px-3">{children}</div>
        </div>
      </div>
      <TableOfContents />
    </div>
  );
}
