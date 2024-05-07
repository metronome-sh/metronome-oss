import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from '.';
import { user } from '#storybook/stubs';
import { json } from '@remix-run/node';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Basic/User Menu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () => json({ user }),
        },
      ]);

      return <RemixStub />;
    },
  ],
} satisfies Meta<typeof UserMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
