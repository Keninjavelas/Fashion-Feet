import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ApiError } from '../api/client';
import { useSite, type AsyncStatus } from '../api/hooks';
import type { Appearance, SiteHomepageSection } from '../api/types';
import { buildTheme, type Theme } from '../theme/theme';

/**
 * One request to /api/v1/site, shared by every screen.
 *
 * The endpoint carries the appearance tokens and the PUBLISHED homepage
 * composition. Fetching it once at the root means the brand colour is available
 * to every screen without each one re-requesting it (and without the rate
 * limiter ever seeing five copies of the same call on launch).
 *
 * A failure here is NOT fatal: the theme falls back to the storefront defaults
 * and screens that do not need /site carry on. Only the Home screen shows the
 * problem, as an inline notice above the products it did manage to load.
 */

interface SiteContextValue {
  status: AsyncStatus;
  error: ApiError | null;
  refreshing: boolean;
  reload: () => void;
  appearance: Appearance | null;
  /** Visible homepage sections, in displayOrder. Empty when /site is unavailable. */
  sections: SiteHomepageSection[];
  publishedAt: string | null;
  version: number | null;
  theme: Theme;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const site = useSite();

  const value = useMemo<SiteContextValue>(() => {
    const appearance = site.data?.appearance ?? null;
    const rawSections = site.data?.homepage.sections ?? [];
    const sections = rawSections
      .filter((section) => section.visible !== false)
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      status: site.status,
      error: site.error,
      refreshing: site.refreshing,
      reload: site.reload,
      appearance,
      sections,
      publishedAt: site.data?.homepage.publishedAt ?? null,
      version: site.data?.homepage.version ?? null,
      theme: buildTheme(appearance),
    };
  }, [site.status, site.error, site.refreshing, site.reload, site.data]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

function useSiteContext(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) {
    throw new Error('The site context is unavailable — screens must be rendered inside <SiteProvider>.');
  }
  return value;
}

export function useSiteConfig(): SiteContextValue {
  return useSiteContext();
}

export function useTheme(): Theme {
  return useSiteContext().theme;
}
