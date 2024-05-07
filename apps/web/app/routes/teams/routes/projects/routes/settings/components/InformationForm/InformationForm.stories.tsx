import type { Meta, StoryObj } from '@storybook/react';

import { InformationForm } from '.';
import { json } from '@remix-run/node';
import { project, usage } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ settings/components/InformationForm',
  component: InformationForm,
} satisfies Meta<typeof InformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/1/1/settings',
          Component: Story,
          loader: () => json({ project, usage }),
        },
      ]);

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};
