import type { Meta, StoryObj } from '@storybook/react';

import { RoutesSection } from '.';
import { defer, json } from '@remix-run/node';
import { urlsList, routesList } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/RoutesSection',
  component: RoutesSection,
  parameters: {},
} satisfies Meta<typeof RoutesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () =>
            json({
              routesList,
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
          Component: Story,
          loader: () =>
            defer({
              urlsList: new Promise(() => {}),
              routesList: new Promise(() => {}),
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
          Component: Story,
          loader: () =>
            defer({
              urlsList: Promise.reject(),
              routesList: Promise.reject(),
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
            Component: Story,
            loader: () =>
              json({
                urlsList,
                routesList,
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
                pathname: '/team_1/project_1/overview',
                search: '',
                state: null,
              },
            },
            {
              state: 'loading',
              location: {
                hash: '',
                key: '2',
                pathname: '/team_1/project_2/overview',
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
