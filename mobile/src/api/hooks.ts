import { useCallback, useEffect, useRef, useState } from 'react';
import { api, toApiError, ApiError, type ProductQuery } from './client';
import type { Category, Faq, Occasion, Product, SiteConfig, Store } from './types';

/**
 * Data hooks over the API client.
 *
 * Two shapes cover every screen:
 *   - `useAsyncResource`  a single object/list (with loading | error | success)
 *   - `useProductFeed`    a paginated, filterable list (adds load-more + refresh)
 *
 * Both cancel in-flight requests on unmount and on input change, and both treat
 * a cancelled request as "say nothing" rather than as an error — otherwise
 * navigating away mid-request would flash a spurious error screen.
 */

export type AsyncStatus = 'loading' | 'success' | 'error';

export interface AsyncResource<T> {
  status: AsyncStatus;
  data: T | null;
  error: ApiError | null;
  /** A reload of already-loaded data is in flight (pull-to-refresh). */
  refreshing: boolean;
  reload: () => void;
}

export function useAsyncResource<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>
): AsyncResource<T> {
  const loadRef = useRef(load);
  loadRef.current = load;

  const [state, setState] = useState<{ status: AsyncStatus; data: T | null; error: ApiError | null }>({
    status: 'loading',
    data: null,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const keyRef = useRef(key);

  const reload = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const keyChanged = keyRef.current !== key;
    if (keyChanged) {
      keyRef.current = key;
      setRefreshing(false);
      setState({ status: 'loading', data: null, error: null });
    } else if (attempt === 0) {
      setState({ status: 'loading', data: null, error: null });
    } else {
      setRefreshing(true);
    }

    loadRef
      .current(controller.signal)
      .then((data) => {
        if (!active) return;
        setState({ status: 'success', data, error: null });
        setRefreshing(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const apiError = toApiError(error);
        if (apiError.aborted) return;
        setState({ status: 'error', data: null, error: apiError });
        setRefreshing(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key, attempt]);

  return { ...state, refreshing, reload };
}

/* -------------------------------------------------------------------------- */
/* Single resources                                                            */
/* -------------------------------------------------------------------------- */

export function useCategories(): AsyncResource<Category[]> {
  return useAsyncResource('categories', (signal) => api.listCategories(signal));
}

export function useOccasions(): AsyncResource<Occasion[]> {
  return useAsyncResource('occasions', (signal) => api.listOccasions(signal));
}

export function useStores(): AsyncResource<Store[]> {
  return useAsyncResource('stores', (signal) => api.listStores(signal));
}

export function useFaqs(): AsyncResource<Faq[]> {
  return useAsyncResource('faqs', (signal) => api.listFaqs(signal));
}

export function useSite(): AsyncResource<SiteConfig> {
  return useAsyncResource('site', (signal) => api.getSite(signal));
}

/**
 * @param idOrSku cuid id or sku from the route. `null` when the route param is
 *                missing, which surfaces as an error state rather than a blank
 *                screen (it means a malformed deep link, not an empty product).
 */
export function useProduct(idOrSku: string | null): AsyncResource<Product> {
  return useAsyncResource(idOrSku === null ? 'product:missing' : `product:${idOrSku}`, (signal) => {
    if (idOrSku === null) {
      return Promise.reject(new ApiError('No product was requested — the link is missing a product id.', { status: 0 }));
    }
    return api.getProduct(idOrSku, signal);
  });
}

/* -------------------------------------------------------------------------- */
/* Paginated catalogue feed                                                    */
/* -------------------------------------------------------------------------- */

/** Items per page. The API default is 24 and its maximum is 60. */
export const PRODUCT_PAGE_SIZE = 12;

export interface ProductFeedFilters {
  /** Category slug or name, or null for "all". */
  category: string | null;
  /** Occasion slug or name, or null for "all". */
  occasion: string | null;
  /** Free-text search. */
  query: string;
}

export interface ProductFeed {
  items: Product[];
  total: number;
  hasMore: boolean;
  status: AsyncStatus;
  error: ApiError | null;
  refreshing: boolean;
  loadingMore: boolean;
  reload: () => void;
  loadMore: () => void;
}

interface FeedState {
  items: Product[];
  total: number;
  hasMore: boolean;
  status: AsyncStatus;
  error: ApiError | null;
  refreshing: boolean;
  loadingMore: boolean;
}

const EMPTY_FEED: FeedState = {
  items: [],
  total: 0,
  hasMore: false,
  status: 'loading',
  error: null,
  refreshing: false,
  loadingMore: false,
};

export function useProductFeed(filters: ProductFeedFilters): ProductFeed {
  const [state, setState] = useState<FeedState>(EMPTY_FEED);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const itemsRef = useRef<Product[]>([]);
  const hasMoreRef = useRef(false);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (mode: 'reset' | 'more') => {
    if (mode === 'more' && (!hasMoreRef.current || inFlightRef.current)) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    // A new request supersedes whatever is still in flight (filter changed,
    // search text changed, or the customer tapped Load more twice).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;

    const { category, occasion, query } = filtersRef.current;
    const offset = mode === 'more' ? itemsRef.current.length : 0;

    setState((previous) => ({
      ...previous,
      error: null,
      refreshing: mode === 'reset' && previous.items.length > 0,
      loadingMore: mode === 'more',
      status: mode === 'reset' && previous.items.length === 0 ? 'loading' : previous.status,
    }));

    const request: ProductQuery = { limit: PRODUCT_PAGE_SIZE, offset };
    if (category) request.category = category;
    if (occasion) request.occasion = occasion;
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) request.q = trimmedQuery;

    try {
      const page = await api.listProducts(request, controller.signal);
      if (requestIdRef.current !== requestId) return;

      const items = mode === 'more' ? [...itemsRef.current, ...page.data] : page.data;
      itemsRef.current = items;
      hasMoreRef.current = page.pagination.hasMore;
      setState({
        items,
        total: page.pagination.total,
        hasMore: page.pagination.hasMore,
        status: 'success',
        error: null,
        refreshing: false,
        loadingMore: false,
      });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      const apiError = toApiError(error);
      if (apiError.aborted) return;
      // Already-loaded items stay on screen; the error is shown as a notice with
      // a retry so a failed page 3 never wipes pages 1 and 2.
      setState((previous) => ({
        ...previous,
        status: previous.items.length > 0 ? 'success' : 'error',
        error: apiError,
        refreshing: false,
        loadingMore: false,
      }));
    } finally {
      if (requestIdRef.current === requestId) inFlightRef.current = false;
    }
  }, []);

  const filterKey = `${filters.category ?? ''}|${filters.occasion ?? ''}|${filters.query.trim()}`;

  useEffect(() => {
    itemsRef.current = [];
    hasMoreRef.current = false;
    setState(EMPTY_FEED);
    void load('reset');
    return () => {
      abortRef.current?.abort();
    };
  }, [filterKey, load]);

  const reload = useCallback(() => {
    void load('reset');
  }, [load]);

  const loadMore = useCallback(() => {
    void load('more');
  }, [load]);

  return { ...state, reload, loadMore };
}
