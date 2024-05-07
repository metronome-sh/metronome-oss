import type { Meta, StoryObj } from '@storybook/react';
import { defer } from '@remix-run/node';
import { createErrorHashRouteStub, ErrorsRouteLoader } from '#storybook/mocks/createRemixStub';
import ErrorsHash from './$teamSlug.$projectSlug.errors_.$hash.route';
const meta = {
  title: 'Routes/:teamSlug ⁄ :projectSlug ⁄ errors ⁄ :hash /route',
  component: ErrorsHash,
  parameters: {
    layout: 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof ErrorsHash>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createErrorHashRouteStub({
        Component: Story,
      });
      return <RemixStub />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createErrorHashRouteStub({
        Component: Story,
        loader: async (): ErrorsRouteLoader => {
          return defer({
            projectErrors: new Promise<[]>(() => {}),
            interval: 'today',
          });
        },
      });

      return <RemixStub />;
    },
  ],
};

export const EmptyState: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createErrorHashRouteStub({
        Component: Story,
        loader: async (): ErrorsRouteLoader => {
          return defer({
            projectErrors: Promise.resolve([]),
            interval: 'today',
          });
        },
      });

      return <RemixStub />;
    },
  ],
};
