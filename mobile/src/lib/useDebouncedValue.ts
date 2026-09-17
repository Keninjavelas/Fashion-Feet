import { useEffect, useState } from 'react';

/**
 * Delays a rapidly changing value (search input) so the API is not queried on
 * every keystroke. The rate limiter on /api/v1 is per-IP, and typing is the
 * easiest way for a customer to trip it.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
