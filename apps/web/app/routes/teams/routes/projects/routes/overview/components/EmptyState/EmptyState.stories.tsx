import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './EmptyState';
import { json } from '@remix-run/node';
import { project } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ overview/components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () => json({ project }),
        },
      ]);

      return <RemixStub />;
    },
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
