import type { Meta, StoryObj } from '@storybook/react';

import { DeleteProject } from '.';
import { json } from '@remix-run/node';
import { project, projects } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ settings/components/DangerZoneForm/components/DeleteProject',
  component: DeleteProject,
  parameters: {},
} satisfies Meta<typeof DeleteProject>;

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
          loader: () => json({ project, projects }),
        },
      ]);

      return <RemixStub initialEntries={['/1/1/settings']} />;
    },
  ],
};

export const SingleProject: Story = {
  args: {
    initialDialogOpen: true,
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/1/1/settings',
          Component: Story,
          loader: () => json({ project, projects: [project] }),
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
            loader: () => json({ project, projects }),
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
            loader: () => json({ project, projects }),
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
            loader: () => json({ project, projects }),
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
