import type { Meta, StoryObj } from '@storybook/react';

import { ReferrersTable } from '.';
import { defer, json } from '@remix-run/node';
import { timeZone, sourcesList } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import * as Tabs from '@radix-ui/react-tabs';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/ReferrersSection/components/ReferrersTable',
  component: ReferrersTable,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ReferrersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          element: (
            <Tabs.Root defaultValue="countries">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () => json({ sourcesList, timeZone }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          element: (
            <Tabs.Root defaultValue="countries">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              sourcesList: new Promise(() => {}),
              timeZone,
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Error: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          element: (
            <Tabs.Root defaultValue="countries">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () => defer({ sourcesList: Promise.reject(), timeZone }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Navigating: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/',
            element: (
              <Tabs.Root defaultValue="countries">
                <div className="w-200 h-60">
                  <Story />
                </div>
              </Tabs.Root>
            ),
            loader: () =>
              json({
                sourcesList,
                timeZone,
              }),
          },
        ],
        {},
        {
          navigation: [
            {
              state: 'idle',
              location: {
                hash: '',
                key: '1',
                pathname: '/team_1/project_1/web-analytics',
                search: '',
                state: null,
              },
            },
            {
              state: 'loading',
              location: {
                hash: '',
                key: '2',
                pathname: '/team_1/project_2/web-analytics',
                search: '',
                state: null,
              },
            },
          ],
        },
      );

      return <RemixStub />;
    },
  ],
};
