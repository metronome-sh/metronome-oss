import type { Meta, StoryObj } from '@storybook/react';
import TeamSlugCreateComponent from './$teamSlug.create.route';
import { json } from '@remix-run/node';
import { project, projects, team, user } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import { loader as rootLoader } from '../../root';
import TeamComponent, { loader as teamLoader } from './$teamSlug.route';

const meta = {
  title: 'Routes/:teamSlug ⁄ create/route',
  component: TeamSlugCreateComponent,
  parameters: {
    layout: 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof TeamSlugCreateComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          id: 'root',
          loader: async (): ReturnType<typeof rootLoader> => {
            return json({ user, observableRoutes: [], timeZoneId: 'UTC' });
          },
          children: [
            {
              id: '$teamSlug',
              path: '/teamSlug',
              Component: TeamComponent,
              loader: async (): ReturnType<typeof teamLoader> => {
                return json({ team, projects, lastSelectedProjectSlug: null });
              },
              children: [
                {
                  id: '$teamSlug.create',
                  path: '/teamSlug/create',
                  Component: Story,
                },
              ],
            },
          ],
        },
      ]);

      return <RemixStub initialEntries={['/teamSlug/create']} />;
    },
  ],
};
