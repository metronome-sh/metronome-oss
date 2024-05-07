import { createContext } from 'react';

import {
  type ActiveFilterOption,
  type CustomFilterOption,
  type FilterDefinitionFunction,
  type FilterOption,
  type FilterUpdate,
} from './filters.types';

export interface FiltersContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: FilterDefinitionFunction<any, unknown>[];
  activeFilterOptions: ActiveFilterOption[];
  analyzeDependencies(option: ActiveFilterOption): { updates: FilterUpdate[] };
  toFilterOption(option: ActiveFilterOption): FilterOption<unknown> | CustomFilterOption;
  onSelect(option: ActiveFilterOption): void;
  onHover(option: ActiveFilterOption): void;
  onBlur(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filtersContext = createContext<FiltersContextValue>(null as any);
