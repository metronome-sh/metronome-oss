import type { Meta, StoryObj } from '@storybook/react';
import { Brand } from '.';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta: Meta<typeof Brand> = {
  title: 'Brand',
  component: Brand,
  parameters: {
    layout: 'centered',
  },
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/1/1/settings',
          Component: Story,
        },
      ]);

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Logo: Story = {
  args: {},
  render: (args) => <Brand.Logo {...args} />,
};
