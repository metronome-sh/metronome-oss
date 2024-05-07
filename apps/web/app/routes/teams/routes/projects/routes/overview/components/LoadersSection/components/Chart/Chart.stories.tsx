import type { Meta, StoryObj } from '@storybook/react';

import { Chart } from '.';
import { defer, json } from '@remix-run/node';
import { loadersSeries } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ overview/components/LoadersSection/components/Chart',
  component: Chart,
  parameters: {},
  decorators: [
    (Story) => {
      return (
        <div className="h-80">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () =>
            json({
              loadersSeries,
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () =>
            defer({
              loadersSeries: new Promise(() => {}),
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Error: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () =>
            defer({
              loadersSeries: Promise.reject(),
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};
