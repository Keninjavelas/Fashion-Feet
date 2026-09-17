/**
 * Route params from Expo Router arrive as `string | string[] | undefined`.
 * Screens only care about the first value, and only when it is a non-empty
 * string — an empty/whitespace param is treated as "not supplied" so that a
 * stray `?category=` cannot produce a filter that matches nothing.
 */
export function readRouteParam(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== 'string') return null;
  const trimmed = first.trim();
  return trimmed.length > 0 ? trimmed : null;
}
