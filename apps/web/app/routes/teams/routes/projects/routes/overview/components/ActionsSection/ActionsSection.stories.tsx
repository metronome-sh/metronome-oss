import type { Meta, StoryObj } from '@storybook/react';

import { ActionsSection } from '.';
import { defer, json } from '@remix-run/node';
import { actionsSeries, actionsOverview } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ overview/components/ActionsSection',
  component: ActionsSection,
  parameters: {},
} satisfies Meta<typeof ActionsSection>;

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
          action: () =>
            json({
              actionsOverview,
              actionsSeries,
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
          action: () =>
            defer({
              actionsOverview: new Promise(() => {}),
              actionsSeries: new Promise(() => {}),
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
          action: () =>
            defer({
              actionsOverview: Promise.reject(),
              actionsSeries: Promise.reject(),
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
            path: '/team_1/project_1/overview',
            Component: Story,
            loader: () => {
              return json({
                actionsOverview,
                actionsSeries,
              });
            },
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

      return <RemixStub initialEntries={['/team_1/project_1/overview']} />;
    },
  ],
};
