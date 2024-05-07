import type { Meta, StoryObj } from '@storybook/react';

import { GeneralWebAnalyticsSection } from '.';
import { defer, json } from '@remix-run/node';
import {
  timeZone,
  visitorsSeries,
  visitorsRightNow,
  sessionsOverview,
  pageviewsCount,
  bounceRate,
  sessionsSeries,
  viewsSeries,
  bounceRateSeries,
  medianSessionTimeSeries,
} from '#storybook/stubs';
import { createRemixStub } from '#storybook/mocks/createRemixStub';

const meta = {
  title: 'Routes/:teamId ⁄ :projectId ⁄ web-analytics/components/GeneralWebAnalyticsSection',
  component: GeneralWebAnalyticsSection,
  parameters: {},
} satisfies Meta<typeof GeneralWebAnalyticsSection>;

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
              sessionsOverview,
              visitorsRightNow,
              visitorsSeries,
              pageviewsCount,
              bounceRate,
              viewsSeries,
              sessionsSeries,
              medianSessionTimeSeries,
              bounceRateSeries,
              timeZone,
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
              visitorsRightNow: new Promise(() => {}),
              visitorsSeries: new Promise(() => {}),
              sessionsOverview: new Promise(() => {}),
              pageviewsCount: new Promise(() => {}),
              bounceRate: new Promise(() => {}),
              viewsSeries: new Promise(() => {}),
              sessionsSeries: new Promise(() => {}),
              medianSessionTimeSeries: new Promise(() => {}),
              bounceRateSeries: new Promise(() => {}),
              timeZone,
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
              visitorsRightNow: Promise.reject(),
              visitorsSeries: Promise.reject(),
              sessionsOverview: Promise.reject(),
              pageviewsCount: Promise.reject(),
              bounceRate: Promise.reject(),
              viewsSeries: Promise.reject(),
              sessionsSeries: Promise.reject(),
              medianSessionTimeSeries: Promise.reject(),
              bounceRateSeries: Promise.reject(),
              timeZone,
            }),
        },
      ]);

      return <RemixStub />;
    },
  ],
};

export const Navigating: Story = {
  args: {},
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub(
        [
          {
            path: '/',
            Component: Story,
            loader: () =>
              json({
                visitorsRightNow,
                visitorsSeries,
                sessionsOverview,
                pageviewsCount,
                bounceRate,
                viewsSeries,
                sessionsSeries,
                medianSessionTimeSeries,
                bounceRateSeries,
                timeZone,
              }),
          },
        ],
        {},
        {
          navigation: [
            {
              state: 'idle',
              location: {
                hash: '',
                key: '1',
                pathname: '/team_1/project_1/web-analytics',
                search: '',
                state: null,
              },
            },
            {
              state: 'loading',
              location: {
                hash: '',
                key: '2',
                pathname: '/team_1/project_2/web-analytics',
                search: '',
                state: null,
              },
            },
          ],
        },
      );

      return <RemixStub />;
    },
  ],
};
