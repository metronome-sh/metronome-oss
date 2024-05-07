import type { Meta, StoryObj } from '@storybook/react';

import { WebAnalyticsSection } from '.';
import { defer, json } from '@remix-run/node';
import {
  bounceRate,
  project,
  sessionsOverview,
  pageviewsCount,
  visitorsRightNow,
} from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ overview/components/WebAnalyticsSection',
  component: WebAnalyticsSection,
  parameters: {},
} satisfies Meta<typeof WebAnalyticsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'WebAnalyticsSection',
    value: '200',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () => {
            return json({
              project,
              sessionsOverview,
              bounceRate,
              pageviewsCount,
              visitorsRightNow,
            });
          },
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Loading: Story = {
  args: {
    title: 'WebAnalyticsSection',
    value: '200',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Story,
          loader: () => {
            return defer({
              project,
              sessionsOverview: new Promise(() => {}),
              bounceRate: new Promise(() => {}),
              pageviewsCount: new Promise(() => {}),
              visitorsRightNow: new Promise(() => {}),
            });
          },
        },
      ]);

      return <RemixStub />;
    },
  ],
};
