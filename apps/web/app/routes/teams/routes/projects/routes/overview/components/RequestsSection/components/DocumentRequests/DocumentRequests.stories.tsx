import type { Meta, StoryObj } from '@storybook/react';

import { DocumentRequests } from '.';
import { defer, json } from '@remix-run/node';
import { requestsOverview } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ overview/components/RequestsSection/components/DocumentRequests',
  component: DocumentRequests,
  parameters: {},
} satisfies Meta<typeof DocumentRequests>;

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
              requestsOverview,
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
              requestsOverview: new Promise(() => {}),
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
              requestsOverview: Promise.reject(),
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};
