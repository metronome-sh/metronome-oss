import type { Meta, StoryObj } from '@storybook/react';

import { VisibilityForm } from '.';
import { json } from '@remix-run/node';
import { project } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ settings/components/VisibilityForm',
  component: VisibilityForm,
  parameters: {},
} satisfies Meta<typeof VisibilityForm>;

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
          loader: () => json({ project }),
        },
      ]);

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};

export const Submitting: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project }),
          },
        ],
        {},
        {
          fetcher: { state: 'submitting' },
        },
      );

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};

export const Success: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project }),
          },
        ],
        {},
        {
          fetcher: { state: 'idle', data: { success: true } },
        },
      );

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};

export const Failure: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project }),
          },
        ],
        {},
        {
          fetcher: { state: 'idle', data: { success: false } },
        },
      );

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};
