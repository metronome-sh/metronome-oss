import type { Meta, StoryObj } from '@storybook/react';

import { TableWithBarChart } from '.';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import { locationsByCountry, timeZone } from '#storybook/stubs';
import { json } from '@remix-run/node';
import { countryFlag } from '#app/utils/countryFlag';
import { cn } from '../utils';
import { formatNumber } from '#app/utils/formatNumber';
import { Tooltip } from '#app/components/Tooltip';

const meta = {
  title: 'Basic/TableWithBarChart',
  component: TableWithBarChart,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: () => (
            <div className="w-200 h-100">
              <Story />
            </div>
          ),
          loader: () => json({ timeZone }),
        },
      ]);

      return <RemixStub />;
    },
  ],
} satisfies Meta<typeof TableWithBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: locationsByCountry,
    valueKey: 'count',
  },
};

export const Customized: Story = {
  args: {
    data: locationsByCountry,
    valueKey: 'count',
    pageSize: 5,
    headers: { code: { hidden: true }, count: { className: 'text-right', label: 'Visitors' } },
    cells: {
      count: {
        render: (value, { className, ...props }) => (
          <div className={cn(className, 'text-right')} {...props}>
            {(value as number) < 1000 ? (
              value.toLocaleString()
            ) : (
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger disabled={(value as number) < 1000}>
                    {formatNumber(value as number)}
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>{value.toLocaleString()}</p>
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            )}
          </div>
        ),
      },
      code: {
        size: 40,
        render: (value, { className, ...props }) => (
          <div className={cn(className, 'relative')} {...props}>
            <div className="absolute inset-0 flex items-center justify-center text-xl pl-1">
              {countryFlag(value as string)}
            </div>
          </div>
        ),
      },
    },
  },
};

export const Skeleton: Story = {
  args: {
    data: locationsByCountry,
  } as any,
  render: (args) => <TableWithBarChart.Skeleton pageSize={5} />,
};

export const Error: Story = {
  args: {
    data: locationsByCountry,
  } as any,
  render: (args) => <TableWithBarChart.Error />,
};
