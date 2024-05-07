import { Icon } from '#app/components';
import { ServerFilterProps, type FilterDefinitionFunction } from '#app/filters/filters.types';
import { ErrorHousekeepingStatus } from '@metronome/db';
import { serverOnly$ } from 'vite-env-only';
import { SetNonNullable } from 'type-fest';

const server: ServerFilterProps<ErrorHousekeepingStatus> = serverOnly$({
  parse: (activeOption) => {
    const [value] = activeOption.value;

    const validValues = ['unresolved', 'archived', 'resolved'];

    if (!validValues.includes(value)) {
      throw new Error('Invalid error state');
    }

    return value as ErrorHousekeepingStatus;
  },
})!;

export const errorStatus = () =>
  ({
    filterId: 'error-is',
    label: 'Interval',
    icon: Icon.Folder,
    server,
    initial: 'unresolved',
    options: [
      {
        optionId: 'unresolved',
        label: () => 'Unresolved',
        value: () => ['unresolved'],
      },
      {
        optionId: 'archived',
        label: () => 'Archived',
        value: () => ['archived'],
      },
      {
        optionId: 'resolved',
        label: () => 'Resolved',
        value: () => ['resolved'],
      },
    ],
  }) satisfies FilterDefinitionFunction<ErrorHousekeepingStatus, ErrorHousekeepingStatus>;
