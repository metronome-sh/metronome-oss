import type { Meta, StoryObj } from '@storybook/react';

import { MedianSessionTimeTabContent } from '.';
import { defer, json } from '@remix-run/node';
import { timeZone, medianSessionTimeSeries } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import * as Tabs from '@radix-ui/react-tabs';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/GeneralWebAnalyticsSection/components/MedianSessionTimeTabContent',
  component: MedianSessionTimeTabContent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MedianSessionTimeTabContent>;

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
            <Tabs.Root defaultValue="median-session-time">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            json({
              medianSessionTimeSeries,
              timeZone,
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
            <Tabs.Root defaultValue="median-session-time">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              medianSessionTimeSeries: new Promise(() => {}),
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
            <Tabs.Root defaultValue="median-session-time">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              medianSessionTimeSeries: Promise.reject(),
              timeZone,
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
              <Tabs.Root defaultValue="median-session-time">
                <div className="w-200 h-60">
                  <Story />
                </div>
              </Tabs.Root>
            ),
            loader: () =>
              json({
                medianSessionTimeSeries,
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
