import { useNavigate, useSearchParams } from '@remix-run/react';
import { type FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Button, Icon } from '#app/components';
import { type ActiveFilterOption, type FilterDefinitionFunction } from '#app/filters/filters.types';
import {
  analyzeDependencies as analyzeDependenciesPrimitive,
  getInitialFiltersOptions,
  mergeFilterOptionsWithSearch,
  toFilterOption as toFilterOptionPrimitive,
  toMap,
  toUrlSearchParamsString,
} from '#app/filters/helpers/helpers';

import { filtersContext } from '../../filtersContext';
import { Filter } from '../Filter';

export type FiltersProps = {
  // TODO fix typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: FilterDefinitionFunction<any, unknown>[];
};

export const Filters: FunctionComponent<FiltersProps> = ({ filters }) => {
  const [search] = useSearchParams();

  const [activeFilterOptions, setActiveFilterOptions] = useState<ActiveFilterOption[]>(() => {
    return mergeFilterOptionsWithSearch(search, filters);
  });

  const [highlightedFilters, sethighlightedFilters] = useState<string[]>([]);

  const navigate = useNavigate();

  const onSelect = useCallback(
    (option: ActiveFilterOption) => {
      sethighlightedFilters([]);

      const { updates } = analyzeDependenciesPrimitive(filters, option, activeFilterOptions);

      const updateOptions = updates.map((u) => u.to);

      const filteredOptions = activeFilterOptions.filter((o) => {
        return (
          !updateOptions.find((u) => u.filterId === o.filterId) && o.filterId !== option.filterId
        );
      });

      const next = [...filteredOptions, ...updateOptions, option];

      setActiveFilterOptions(next);

      navigate({ search: toUrlSearchParamsString(next) }, { preventScrollReset: true });
    },
    [filters, activeFilterOptions, navigate],
  );

  const onHover = useCallback(
    (option: ActiveFilterOption) => {
      const { updates } = analyzeDependenciesPrimitive(filters, option, activeFilterOptions);
      const filterIds = updates.map((update) => update.from.filterId);
      sethighlightedFilters(filterIds);
    },
    [activeFilterOptions, filters],
  );

  const onBlur = useCallback(() => {
    sethighlightedFilters([]);
  }, []);

  const isDirty = useMemo(() => {
    const map = toMap(filters);

    return !activeFilterOptions.every((option) => {
      return map[option.filterId].initial === option.optionId;
    });
  }, [activeFilterOptions, filters]);

  const handleReset = useCallback(() => {
    const next = getInitialFiltersOptions(filters);
    setActiveFilterOptions(next);
    navigate({ search: toUrlSearchParamsString(next) }, { preventScrollReset: true });
  }, [filters, navigate]);

  const analyzeDependencies = useCallback(
    (option: ActiveFilterOption) => {
      return analyzeDependenciesPrimitive(filters, option, activeFilterOptions);
    },
    [activeFilterOptions, filters],
  );

  const toFilterOption = useCallback(
    (activeFilterOption: ActiveFilterOption) => {
      return toFilterOptionPrimitive(filters, activeFilterOption);
    },
    [filters],
  );

  return (
    <div className="md:px-4 flex gap-2">
      <filtersContext.Provider
        value={{
          filters,
          activeFilterOptions,
          analyzeDependencies,
          toFilterOption,
          onSelect,
          onHover,
          onBlur,
        }}
      >
        {filters.map((filter) => (
          <Filter
            key={filter.filterId}
            filter={filter}
            highlight={highlightedFilters.includes(filter.filterId)}
          />
        ))}
      </filtersContext.Provider>
      {isDirty ? (
        <Button className="px-2" size="sm" variant="outline-dashed" onClick={handleReset}>
          <Icon.RotateTwo />
        </Button>
      ) : null}
    </div>
  );
};
