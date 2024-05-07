import { useSearchParams } from '@remix-run/react';
import { useMemo, useRef } from 'react';

import { type ActiveFilterOption, type FilterDefinitionFunction } from '#app/filters/filters.types';
import { mergeFilterOptionsWithSearch } from '#app/filters/helpers';

export function useFilterActiveOption<T extends string>(
  filter: FilterDefinitionFunction<T, unknown>,
) {
  // TODO filter returns a function, so this is a hack to get around the useMemo
  const filterRef = useRef(filter);

  const [search] = useSearchParams();

  const [activeOption] = useMemo(
    () => mergeFilterOptionsWithSearch(search, [filterRef.current]),
    [search],
  );

  return activeOption as ActiveFilterOption<T>;
}
