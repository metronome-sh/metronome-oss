import { Schema, z } from 'zod';

import { FilterObject, mergeFilterOptionsWithSearch, toMap } from '#app/filters';

import { formatZodError } from './helpers';

export async function createQueryHandler({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const searchParamsObject = Object.fromEntries(searchParams.entries());

  function get<T extends string>(key: string) {
    return searchParams.get(key) as T | null;
  }

  function validate<T, S extends Schema<T>>(schema: S): z.infer<S> {
    const result = schema.safeParse(searchParamsObject);

    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new Response(`Invalid query data: ${JSON.stringify(formatZodError(result.error))}`, {
        status: 400,
      });
    }

    return result.data;
  }

  async function filters<
    T extends string,
    ServerParse,
    R extends Record<string, FilterObject<T, ServerParse>>,
  >(
    filtersObj: R,
  ): Promise<{
    [RK in keyof R]: Awaited<ReturnType<R[RK]['server']['parse']>>;
  }> {
    const filterEntries = Object.entries(filtersObj);

    const filterObjects = filterEntries.map(([, filberObject]) => filberObject);

    const search = new URLSearchParams(new URL(request.url).search);

    const ids = filterEntries.map(([, filter]) => filter.filterId);

    // Conserve the order of the filters
    // TODO do this inside the mergeFilterOptionsWithSearch function instead
    const options = mergeFilterOptionsWithSearch(search, filterObjects).sort((a, b) => {
      const aIndex = ids.indexOf(a.filterId);
      const bIndex = ids.indexOf(b.filterId);
      return aIndex - bIndex;
    });

    const map = toMap(filterObjects);

    const parsed = await Promise.all(
      options.map(async (option) => {
        const filter = map[option.filterId];
        return filter.server.parse(option, request, filter);
      }),
    );

    return Object.fromEntries(parsed.map((p, i) => [filterEntries[i][0], p])) as {
      [RK in keyof R]: Awaited<ReturnType<R[RK]['server']['parse']>>;
    };
  }

  return { get, filters, validate };
}
