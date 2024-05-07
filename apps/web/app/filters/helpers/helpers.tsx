/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode } from 'react';
import { type Schema } from 'zod';

import {
  type ActiveFilterOption,
  type CustomFilterOption,
  type FilterDefinitionFunction,
  type FilterOption,
  type FilterUpdate,
} from '../filters.types';
import { InvalidFilterValueError } from '../InvalidFilterValueError';

const cache = new WeakMap<
  FilterDefinitionFunction<any, unknown>[],
  {
    [k: string]: FilterDefinitionFunction<any, unknown>;
  }
>();

function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}

export function getIsCustomOption(
  filters: FilterDefinitionFunction<any, unknown>[],
  option: ActiveFilterOption,
) {
  const filtersMap = Object.fromEntries(filters.map((filter) => [filter.filterId, filter]));
  const { options } = filtersMap[option.filterId];
  return !options.find((o) => arraysEqual(o.value(), option.value));
}

export function toMap(filters: FilterDefinitionFunction<any, unknown>[]) {
  if (cache.has(filters)) {
    return cache.get(filters) as { [k: string]: FilterDefinitionFunction<any, unknown> };
  }

  const map = Object.fromEntries(filters.map((filter) => [filter.filterId, filter]));

  cache.set(filters, map);

  return map;
}

export function toActiveFilterOption(
  filterId: string,
  option: FilterOption<string>,
): ActiveFilterOption {
  const { optionId, value, label } = option;
  return { filterId, optionId, value: value(), label: label() };
}

export function valueToActiveFilterOption(
  filterId: string,
  value: string[],
  label: ReactNode,
): ActiveFilterOption {
  return { filterId, optionId: null as any, label, value, isCustom: true };
}

export function toFilterOption(
  filters: FilterDefinitionFunction<any, unknown>[],
  option: ActiveFilterOption,
): FilterOption<unknown> | CustomFilterOption {
  const filter = filters.find((f) => f.filterId === option.filterId);

  if (!filter) {
    throw new Error(`Filter [${option.filterId}] not found`);
  }

  if (option.isCustom) {
    if (!filter.custom) {
      throw new Error(`Filter [${option.filterId}] has no custom option`);
    }

    return filter.custom;
  }

  const filterOption = filter.options.find((o) => o.optionId === option.optionId);

  if (!filterOption) {
    throw new Error(`Option [${option.optionId}] not found in filter [${option.filterId}]`);
  }

  return filterOption;
}

export function toUrlSearchParamsString(
  options: ActiveFilterOption[],
  search?: URLSearchParams,
): string {
  const keys = options.map((option) => option.filterId);

  const filteredEntries = search
    ? [...search.entries()].filter(([key]) => !keys.includes(key))
    : [];

  const entries = options.reduce(
    (acc, option) => {
      const entry = option.value.map((value) => [option.filterId, value] as [string, string]);
      return [...acc, ...entry];
    },
    [] as [string, string][],
  );

  return new URLSearchParams([...entries, ...filteredEntries]).toString();
}

export function depencenciesCollides(
  filters: FilterDefinitionFunction<any, unknown>[],
  leftOption: ActiveFilterOption,
  rightOption: ActiveFilterOption,
): boolean {
  const leftOptionFilter = toMap(filters)[leftOption.filterId];

  // Check if the active option is a custom option
  const leftIsCustomOption = getIsCustomOption(filters, leftOption);
  const leftActiveOption = toFilterOption(filters, leftOption);

  let dependencyFn:
    | ((selfValue: string[], dependencyValue: string[]) => boolean | Schema<unknown>)
    | undefined;

  if (leftIsCustomOption) {
    dependencyFn = leftOptionFilter.custom?.dependencies?.[rightOption.filterId];
    // If there is no dependency, skip
    if (!dependencyFn) return false;
  } else {
    dependencyFn = leftActiveOption.dependencies?.[rightOption.filterId];
    // If there is no dependency, skip
    if (!dependencyFn) return false;
  }

  const result = dependencyFn(leftOption.value, rightOption.value);

  if (Object.hasOwnProperty.call(result, 'safeParse')) {
    // if the schema passes, the dependency is met, so we return false as there is no collision
    return !(result as unknown as Schema).safeParse(rightOption.value).success;
  } else if (typeof result === 'boolean') {
    // If the result is true, it means that the dependency is met, so we return false as there is no collision
    return !result;
  } else {
    throw new Error('Invalid dependency resolver');
  }
}

export function analyzeDependencies(
  filters: FilterDefinitionFunction<any, unknown>[],
  option: ActiveFilterOption,
  activeOptions: ActiveFilterOption[],
): { updates: FilterUpdate[] } {
  let updates = [] as FilterUpdate[];

  if (filters.length === 0) {
    return { updates };
  }

  const activeOptionMap = Object.fromEntries(
    activeOptions.map((activeOption) => [activeOption.filterId, activeOption]),
  );

  updates = filters.reduce((acc, filter) => {
    // If is the same filter, skip
    if (filter.filterId === option.filterId) return acc;

    // Check for custom option selection on this filter
    const filterActiveOption = activeOptionMap[filter.filterId];

    // If there is no active option, throw
    if (!filterActiveOption) {
      throw new Error(
        `Unable to find an option in [${filter.filterId}] filter that satistifes [${
          option.filterId
        }] with value(s) [${JSON.stringify(option.value)}] .
        If these filters are not dependent on each other, make sure to remove the dependency at [${
          option.filterId
        }] filter.
        Otherwise, make sure to select an option that satisfies the dependency.`,
      );
    }

    const optionCollidesWithActiveFilterOption = depencenciesCollides(
      filters,
      option,
      filterActiveOption,
    );

    if (!optionCollidesWithActiveFilterOption) {
      return acc;
    }

    const nextNonCollidingOption = filter.options.find((o) => {
      return !depencenciesCollides(filters, option, toActiveFilterOption(filter.filterId, o));
    });

    if (!nextNonCollidingOption) {
      throw new Error(
        `No non-colliding option was found in filter [${filter.filterId}] for option [${option.filterId}:${option.optionId}]`,
      );
    }

    return [
      ...acc,
      {
        from: filterActiveOption,
        to: toActiveFilterOption(filter.filterId, nextNonCollidingOption),
      },
    ];
  }, [] as FilterUpdate[]);

  return { updates };
}

export function getInitialFilterOption(filter: FilterDefinitionFunction<any, unknown>) {
  const option = filter.options.find((o) => o.optionId === filter.initial);

  if (!option) throw new Error(`Filter [${filter.filterId}] has no initial option`);

  return toActiveFilterOption(filter.filterId, option);
}

export function getInitialFiltersOptions(filters: FilterDefinitionFunction<any, unknown>[]) {
  return filters.map(getInitialFilterOption);
}

export function mergeFilterOptionsWithSearch(
  search: URLSearchParams,
  filters: FilterDefinitionFunction<any, unknown>[],
): ActiveFilterOption[] {
  const filtersMap = Object.fromEntries(filters.map((filter) => [filter.filterId, filter]));
  const ids = filters.map((filter) => filter.filterId);

  // Get the entries only for the filters
  const entries = [...search.entries()].filter(([key]) => ids.includes(key));

  const grouped = Object.entries(
    entries.reduce(
      (acc, [key, value]) => {
        if (acc[key]) {
          const values = acc[key];
          return { ...acc, [key]: [...values, value] };
        }
        return { ...acc, [key]: [value] };
      },
      {} as Record<string, string[]>,
    ),
  );

  const optionEntries = grouped.map(([key, value]) => {
    const filter = filtersMap[key];

    // find an option with this value
    const option = filter.options.find((o) => arraysEqual(o.value(), value));

    if (option) {
      return [key, toActiveFilterOption(key, option)] as [
        key: string,
        activeFilterOption: ActiveFilterOption,
      ];
    }

    const isValid = filter.custom?.validate?.(value);

    if (!isValid) throw new InvalidFilterValueError(key, value);

    const CustomLabel = filter.custom?.label;

    const customOption: ActiveFilterOption = {
      filterId: key,
      optionId: 'custom',
      label: CustomLabel ? <CustomLabel value={value} /> : null,
      value,
      isCustom: true,
    };

    return [key, customOption] as [key: string, activeFilterOption: ActiveFilterOption];
  });

  const options = optionEntries.map(([, option]) => option);

  const keys = optionEntries.map(([key]) => key);

  const derived = [
    ...getInitialFiltersOptions(filters).filter((f) => !keys.includes(f.filterId)),
    ...options,
  ];

  optionEntries.forEach(([key, option]) => {
    const { updates } = analyzeDependencies(filters, option, options);
    if (updates.length > 0) throw new InvalidFilterValueError(key, option.value);
  });

  return derived;
}
