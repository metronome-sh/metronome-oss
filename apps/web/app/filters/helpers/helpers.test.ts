import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import {
  type FilterDefinitionFunction,
  type FilterOption,
  type FilterUpdate,
} from '../filters.types';
import {
  analyzeDependencies,
  depencenciesCollides,
  getInitialFiltersOptions,
  getIsCustomOption,
  toActiveFilterOption,
} from './helpers';

const option1Filter1 = {
  optionId: 'option-1-filter-1',
  label: () => 'Option 1',
  value: () => ['option-1-filter-1-value'],
} satisfies FilterOption<unknown>;

const filter1 = {
  filterId: 'filter-1',
  initial: 'option-1-filter-1',
  options: [option1Filter1],
  label: 'Foo',
  server: { parse: () => null },
} satisfies FilterDefinitionFunction<any, unknown>;

const option1Filter2 = {
  optionId: 'option-1-filter-2',
  label: () => 'Option 1',
  value: () => ['option-1-filter-2-value'],
} satisfies FilterOption<unknown>;

const option2Filter2 = {
  optionId: 'option-2-filter-2',
  label: () => 'Option 2',
  value: () => ['option-2-filter-2-value'],
  dependencies: {
    'filter-1': () => true,
  },
} satisfies FilterOption<unknown>;

const filter2 = {
  filterId: 'filter-2',
  initial: 'option-1-filter-2',
  options: [option1Filter2, option2Filter2],
  label: 'Foo',
  server: { parse: () => null },
} satisfies FilterDefinitionFunction<any, unknown>;

const filters = [filter1, filter2];

describe('analyzeDependencies', () => {
  test('should return updates object empty if not filters are provided', async () => {
    const { updates } = analyzeDependencies([], toActiveFilterOption('filter-1', option1Filter1), [
      toActiveFilterOption('filter-1', option1Filter1),
      toActiveFilterOption('filter-2', option1Filter2),
    ]);
    expect(updates).toEqual([]);
  });

  test('should throw if filter doest not have an active option', async () => {
    expect(() =>
      analyzeDependencies(filters, toActiveFilterOption('filter-1', option1Filter1), []),
    ).toThrowError(
      /passed in filters array needs to exist as an active option in activeOptions array/,
    );
  });

  test('should return updates object empty if the activeOption of a filter is not custom and doesnt have a dependency', () => {
    const { updates } = analyzeDependencies(
      filters,
      toActiveFilterOption('filter-1', option1Filter1),
      [
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ],
    );

    expect(updates).toEqual([]);
  });

  test('should return updates object not empty if there are collisions with the dependency', () => {
    const { updates } = analyzeDependencies(
      filters,
      toActiveFilterOption('filter-1', option1Filter1),
      [
        toActiveFilterOption('filter-1', option1Filter1),
        {
          ...toActiveFilterOption('filter-2', option1Filter2),
          value: ['custom-value'],
        },
      ],
    );

    expect(updates).toEqual([]);
  });

  test('should return updates object empty if there is no collisions with the dependency and if a function with a boolean', () => {
    const { updates } = analyzeDependencies(
      filters,
      toActiveFilterOption('filter-1', option1Filter1),
      [
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ],
    );

    expect(updates).toEqual([]);
  });

  test('should return updates object empty if there is no collisions with the dependency and if a function with a zod schema', () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: {
        'filter-1': () => z.tuple([z.literal('option-1-filter-1-value')]),
      },
    } satisfies FilterOption<unknown>;

    const option2Filter2 = {
      optionId: 'option-2-filter-2',
      label: () => 'Option 2',
      value: () => ['option-2-filter-2-value'],
      dependencies: { 'filter-1': () => true },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const { updates } = analyzeDependencies(
      [filter1, filter2],
      toActiveFilterOption('filter-1', option1Filter1),
      [
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ],
    );

    expect(updates).toEqual([]);
  });

  test('should return updates object if the selected action is not compatible with the filter', () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: { 'filter-1': () => false },
    } satisfies FilterOption<unknown>;

    const option2Filter2 = {
      optionId: 'option-2-filter-2',
      label: () => 'Option 2',
      value: () => ['option-2-filter-2-value'],
      dependencies: { 'filter-1': () => true },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const filters = [filter1, filter2];

    const { updates } = analyzeDependencies(
      filters,
      toActiveFilterOption('filter-1', option1Filter1),
      [
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ],
    );

    expect(updates).toEqual([
      {
        from: toActiveFilterOption('filter-2', option1Filter2),
        to: toActiveFilterOption('filter-2', option2Filter2),
      },
    ] as FilterUpdate[]);
  });

  test("should throw if it doesn't find a non-colliding filter option ", () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: { 'filter-1': () => false },
    } satisfies FilterOption<unknown>;

    const option2Filter2 = {
      optionId: 'option-2-filter-2',
      label: () => 'Option 2',
      value: () => ['option-2-filter-2-value'],
      dependencies: { 'filter-1': () => false },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const filters = [filter1, filter2];

    expect(() =>
      analyzeDependencies(filters, toActiveFilterOption('filter-1', option1Filter1), [
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ]),
    ).toThrowError(/No non colliding option was found/);
  });
});

describe('getIsCustomOption', () => {
  test('should return false if option is in filter options', async () => {
    const isCustomOption = getIsCustomOption(
      filters,
      toActiveFilterOption('filter-1', option1Filter1),
    );

    expect(isCustomOption).toBe(false);
  });

  test('should return true if option is not in filter options', async () => {
    const isCustomOption = getIsCustomOption(filters, {
      ...toActiveFilterOption('filter-1', option1Filter1),
      value: ['custom-value'],
    });

    expect(isCustomOption).toBe(true);
  });
});

describe('getInitialFiltersOptions', () => {
  test('should return the initial option of the filter', async () => {
    const initialOptions = getInitialFiltersOptions(filters);

    expect(initialOptions).toEqual([
      toActiveFilterOption('filter-1', option1Filter1),
      toActiveFilterOption('filter-2', option1Filter2),
    ]);
  });
});

describe('depencenciesCollides', () => {
  test('should return false if deps do not collide', async () => {
    expect(
      depencenciesCollides(
        filters,
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ),
    ).toBe(false);
  });

  test('should return false if deps does not collide returning a zod schema', async () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: {
        'filter-1': () => z.tuple([z.literal('option-1-filter-1-value')]),
      },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const filters = [filter1, filter2];

    expect(
      depencenciesCollides(
        filters,
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ),
    ).toBe(false);
  });

  test('should return true if deps collide returning a boolean', async () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: { 'filter-1': () => false },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const filters = [filter1, filter2];

    expect(
      depencenciesCollides(
        filters,
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ),
    ).toBe(true);
  });

  test('should return true if deps collide returning a zod schema', async () => {
    const option1Filter2 = {
      optionId: 'option-1-filter-2',
      label: () => 'Option 1',
      value: () => ['option-1-filter-2-value'],
      dependencies: { 'filter-1': () => z.literal('this-will-collide') },
    } satisfies FilterOption<unknown>;

    const filter2 = {
      filterId: 'filter-2',
      initial: 'option-1',
      options: [option1Filter2, option2Filter2],
      label: 'Foo',
      server: { parse: () => null },
    } satisfies FilterDefinitionFunction<any, unknown>;

    const filters = [filter1, filter2];

    expect(
      depencenciesCollides(
        filters,
        toActiveFilterOption('filter-1', option1Filter1),
        toActiveFilterOption('filter-2', option1Filter2),
      ),
    ).toBe(true);
  });
});
