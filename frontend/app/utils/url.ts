export const buildQueryParams = (
  query: Record<string, unknown | unknown[] | undefined>,
  defaults: Record<string, unknown | unknown[] | undefined> = {},
) => {
  const entries = Object.entries(query).filter(
    (entry): entry is [string, unknown | unknown[]] =>
      entry[1] !== undefined && entry[1] !== defaults[entry[0]],
  );

  if (entries.length === 0) {
    return "";
  }

  const flatEntries = entries.reduce<(readonly [string, string])[]>(
    (acc, [key, value]) => [
      ...acc,
      ...(Array.isArray(value)
        ? value.map((v) => [key, v] as const)
        : [[key, value] as const]),
    ],
    [],
  );

  return `?${flatEntries.map(([key, value]) => `${key}=${value}`).join("&")}`;
};
