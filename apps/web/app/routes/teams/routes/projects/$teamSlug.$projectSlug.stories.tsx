import type { Meta, StoryObj } from '@storybook/react';
import TeamSlugAppSlugComponent from './$teamSlug.$projectSlug.route';
import { defer, json } from '@remix-run/node';
import { project, projects, user, team } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import { loader as rootLoader } from '../../../../root';
import TeamComponent, { loader as teamLoader } from '../../$teamSlug.route';
import { loader as teamProjectLoader } from './$teamSlug.$projectSlug.route';

const meta = {
  title: 'Routes/:teamSlug ⁄ :projectSlug/route',
  component: TeamSlugAppSlugComponent,
  parameters: {
    layout: 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof TeamSlugAppSlugComponent>;

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
                  id: '$teamSlug.$projectSlug',
                  path: '/teamSlug/projectSlug',
                  Component: Story,
                  loader: async (): ReturnType<typeof teamProjectLoader> =>
                    defer({
                      project,
                      semver: Promise.resolve({
                        latestClientVersion: '0.0.1',
                        needsToUpdate: false,
                      }),
                    }),
                  // children: [
                  //   {
                  //     id: '$teamSlug.$projectSlug.overview',
                  //     path: '/teamSlug/projectSlug/overview',
                  //     Component: Story,
                  //     loader: async () => json({}),
                  //   },
                  // ],
                },
              ],
            },
          ],
        },
      ]);

      return <RemixStub initialEntries={['/teamSlug/projectSlug']} />;
    },
  ],
};
