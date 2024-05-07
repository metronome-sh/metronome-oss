import type { Meta, StoryObj } from '@storybook/react';

import { SessionsTabTrigger } from '.';
import { defer, json } from '@remix-run/node';
import { sessionsOverview } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import * as Tabs from '@radix-ui/react-tabs';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/GeneralWebAnalyticsSection/components/SessionsTabTrigger',
  component: SessionsTabTrigger,
  parameters: {},
} satisfies Meta<typeof SessionsTabTrigger>;

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
            <Tabs.Root defaultValue="other">
              <Tabs.List>
                <Story />
              </Tabs.List>
            </Tabs.Root>
          ),
          loader: () =>
            json({
              sessionsOverview,
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Selected: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          element: (
            <Tabs.Root defaultValue="sessions">
              <Tabs.List>
                <Story />
              </Tabs.List>
            </Tabs.Root>
          ),
          loader: () =>
            json({
              sessionsOverview,
            }),
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
            <Tabs.Root defaultValue="visitors">
              <Tabs.List>
                <Story />
              </Tabs.List>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              sessionsOverview: new Promise(() => {}),
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
            <Tabs.Root defaultValue="visitors">
              <Tabs.List>
                <Story />
              </Tabs.List>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              sessionsOverview: Promise.reject(),
            }),
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
              <Tabs.Root defaultValue="visitors">
                <Tabs.List>
                  <Story />
                </Tabs.List>
              </Tabs.Root>
            ),
            loader: () =>
              json({
                sessionsOverview,
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
