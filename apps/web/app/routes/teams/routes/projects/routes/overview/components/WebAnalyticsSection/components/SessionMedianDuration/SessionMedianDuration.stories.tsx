import type { Meta, StoryObj } from '@storybook/react';

import { SessionMedianDuration } from '.';
import { json } from '@remix-run/node';
import { project, sessionsOverview } from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title:
    'Routes/:teamId ⁄ :projectId ⁄ overview/components/WebAnalyticsSection/components/SessionMedianDuration',
  component: SessionMedianDuration,
  parameters: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () => json({ project, sessionsOverview }),
        },
      ]);

      return <RemixStub />;
    },
  ],
} satisfies Meta<typeof SessionMedianDuration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'SessionMedianDuration',
    value: '200',
  },
};
