/**
 * Homepage sections carry merchandiser-authored `ctaLink` values copied from the
 * website (e.g. "/shop", "/contact"). Those are web paths; only the ones with a
 * native equivalent are offered as a button. An unmapped link (say
 * "/size-guide", which has no screen in this app) hides the button rather than
 * rendering a control that navigates nowhere.
 */
export type NativeRoute = '/shop' | '/stores' | '/faq' | '/contact';

const ROUTE_PREFIXES: ReadonlyArray<{ prefix: string; route: NativeRoute }> = [
  { prefix: '/shop', route: '/shop' },
  { prefix: '/store', route: '/stores' },
  { prefix: '/faq', route: '/faq' },
  { prefix: '/contact', route: '/contact' },
];

export function nativeRouteForCta(ctaLink: string | undefined | null): NativeRoute | null {
  if (typeof ctaLink !== 'string') return null;
  const trimmed = ctaLink.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  for (const candidate of ROUTE_PREFIXES) {
    if (trimmed === candidate.prefix || trimmed.startsWith(`${candidate.prefix}?`) || trimmed.startsWith(`${candidate.prefix}/`)) {
      return candidate.route;
    }
  }
  return null;
}
