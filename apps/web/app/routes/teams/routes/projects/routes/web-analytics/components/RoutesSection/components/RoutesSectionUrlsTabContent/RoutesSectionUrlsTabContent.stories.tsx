import type { Meta, StoryObj } from '@storybook/react';

import { RoutesSectionUrlsTabContent } from '.';
import { urlsList } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import * as Tabs from '@radix-ui/react-tabs';
import { defer, json } from '@remix-run/node';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/RoutesSection/components/RoutesSectionUrlsTabContent',
  component: RoutesSectionUrlsTabContent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RoutesSectionUrlsTabContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => (
            <Tabs.Root defaultValue="urls">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            json({
              urlsList,
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
          Component: () => (
            <Tabs.Root defaultValue="urls">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              urlsList: new Promise(() => {}),
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
          Component: () => (
            <Tabs.Root defaultValue="urls">
              <div className="w-200 h-60">
                <Story />
              </div>
            </Tabs.Root>
          ),
          loader: () =>
            defer({
              urlsList: Promise.reject(),
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
            Component: () => (
              <Tabs.Root defaultValue="urls">
                <div className="w-200 h-60">
                  <Story />
                </div>
              </Tabs.Root>
            ),
            loader: () =>
              json({
                urlsList,
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
