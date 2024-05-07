import type { Meta, StoryObj } from '@storybook/react';
import { defer } from '@remix-run/node';
import { createErrorsRouteStub, ErrorsRouteLoader } from '#storybook/mocks/createRemixStub';
import TeamSlugProjectSlugErrors from './$teamSlug.$projectSlug.errors.route';
const meta = {
  title: 'Routes/:teamSlug ⁄ :projectSlug ⁄ errors /route',
  component: TeamSlugProjectSlugErrors,
  parameters: {
    layout: 'fullscreen',
  },
  args: {},
} satisfies Meta<typeof TeamSlugProjectSlugErrors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createErrorsRouteStub({
        Component: Story,
      });
      return <RemixStub />;
    },
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      const RemixStub = createErrorsRouteStub({
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
      const RemixStub = createErrorsRouteStub({
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
