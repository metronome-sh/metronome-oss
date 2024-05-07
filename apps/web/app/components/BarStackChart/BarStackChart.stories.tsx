import type { Meta, StoryObj } from '@storybook/react';

import { BarStackChart } from '.';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import { requestsCountSeries, timeZoneWithOffset } from '#storybook/stubs';
import { json } from '@remix-run/node';

const meta = {
  title: 'Basic/BarStackChart',
  component: BarStackChart,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          id: 'root',
          path: '/',
          element: (
            <div className="w-200 h-100">
              <Story />
            </div>
          ),
          loader: () => json({ timeZoneWithOffset }),
        },
      ]);

      return <RemixStub />;
    },
  ],
} satisfies Meta<typeof BarStackChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: requestsCountSeries.series,
    colors: ['#0d9488', '#14b8a6'],
    labels: { dataCount: 'Data requests', documentCount: 'Document requests' },
  },
};

export const CustomLabel: Story = {
  args: {
    data: requestsCountSeries.series,
    colors: ['#0d9488', '#14b8a6'],
    labels: {
      dataCount: 'Data requests',
      documentCount: 'Document requests',
    },
    formatValues: {
      dataCount: (value) => `${value}%`,
    },
  },
};

export const Skeleton: Story = {
  args: {
    data: requestsCountSeries.series,
    colors: ['#0d9488', '#14b8a6'],
    labels: { dataCount: 'Data requests', documentCount: 'Document requests' },
  },
  render: (args) => <BarStackChart.Skeleton />,
};

export const Error: Story = {
  args: {
    data: requestsCountSeries.series,
    colors: ['#0d9488', '#14b8a6'],
    labels: { dataCount: 'Data requests', documentCount: 'Document requests' },
  },
  render: (args) => <BarStackChart.Error />,
};
