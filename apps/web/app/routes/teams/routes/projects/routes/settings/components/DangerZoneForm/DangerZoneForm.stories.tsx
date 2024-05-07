import type { Meta, StoryObj } from '@storybook/react';

import { DangerZoneForm } from '.';
import { json } from '@remix-run/node';
import { project, projects } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ settings/components/DangerZoneForm',
  component: DangerZoneForm,
  parameters: {},
} satisfies Meta<typeof DangerZoneForm>;

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
          loader: () => json({ project, projects }),
        },
      ]);

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};
