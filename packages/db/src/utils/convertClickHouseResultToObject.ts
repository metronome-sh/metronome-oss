export function convertQueryResultToObject<
  Output extends Record<string, any>,
  Result extends Record<string, any> = {},
  QueryResult = Result[],
>(
  queryResult: QueryResult,
  options?: { prefix?: string; attributesDenyList?: string[] },
): Output[] {
  const inputArray = Array.isArray(queryResult) ? queryResult : [queryResult];

  const output = inputArray.map((entry) => {
    const entries = Object.entries(entry)
      .filter(([key]) => key.startsWith(options?.prefix || ''))
      .map(([key, value]) => {
        const newKey = key.replace(options?.prefix || '', '');
        return [newKey, value];
      }) as [string, any][];

    const keys = entries.filter(([key]) => key.endsWith('.key'));

    const nested = keys
      .map(([key, keyValue]) => {
        if (options?.attributesDenyList?.includes(key)) return null;

        const prefix = key.replace('.key', '');
        const values = entries.find(([k]) => k === `${prefix}.value`);

        if (!values) return null;

        const nestedEntries = (keyValue as string[]).map((v, i) => [v, values[1][i]] as const);

        return [key.replace('.key', ''), Object.fromEntries(nestedEntries)] as const;
      })
      .filter((v) => v !== null) as [string, any][];

    const nestedKeys = new Set(nested.map(([key]) => key));

    const camelCase = (key: string) => key.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());

    const newEntries = [...entries, ...nested].map(([key, value]) => [camelCase(key), value]);

    const output = Object.fromEntries(newEntries) as Output;

    nestedKeys.forEach((key) => {
      delete output[camelCase(`${key}.key`)];
      delete output[camelCase(`${key}.value`)];
    });

    // parse timestamps
    const timestampsKeys = ['timestamp', 'startTime', 'endTime'];

    timestampsKeys.forEach((key) => {
      if (output[key]) {
        (output as any)[key] = Number(output[key]);
      }
    });

    return output;
  });

  return output;
}
