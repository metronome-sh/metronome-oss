import type { Meta, StoryObj } from '@storybook/react';

import { RotateApiKey } from '.';
import { json } from '@remix-run/node';
import { project } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const usage = 999_999_999;

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ settings/components/InformationForm/components/RotateApiKey',
  component: RotateApiKey,
  parameters: {},
} satisfies Meta<typeof RotateApiKey>;

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

export const Open: Story = {
  args: {
    initialDialogOpen: true,
  },
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

export const Submitting: Story = {
  args: {
    initialDialogOpen: true,
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project, usage }),
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
  args: {
    initialDialogOpen: true,
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project, usage }),
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
  args: {
    initialDialogOpen: true,
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/1/1/settings',
            Component: Story,
            loader: () => json({ project, usage }),
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
