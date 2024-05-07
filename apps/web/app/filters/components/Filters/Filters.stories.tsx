import type { Meta, StoryObj } from '@storybook/react';

import { Filters } from '.';
import { filters } from '#app/filters';
import { createRemixStub } from '#storybook/mocks/createRemixStub';
import { loader as rootLoader } from '../../../root';
import { json } from '@remix-run/node';
import { user } from '#.storybook/stubs';

const meta = {
  title: 'Basic/Filters',
  component: Filters,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const RemixStub = createRemixStub([
        {
          id: 'root',
          path: '/',
          loader: async (): ReturnType<typeof rootLoader> => {
            return json({ user, observableRoutes: [], timeZoneId: 'UTC' });
          },
          Component: Story,
        },
      ]);

      return <RemixStub initialEntries={['/']} />;
    },
  ],
} satisfies Meta<typeof Filters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: {
    filters: [filters.dateRange(), filters.interval()],
  },
};

export const Errors: Story = {
  args: {
    filters: [filters.dateRange({ withAll: true }), filters.errorStatus()],
  },
};
