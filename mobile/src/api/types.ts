/**
 * The frozen public contract of the Fashion Feet REST API, in one place.
 *
 * Source of truth (server side, read-only reference — this app never edits it):
 *   src/lib/publicSerializers.ts    every field and its nullability
 *   src/lib/publicApi.ts            envelopes, pagination, error + 429 shape
 *   src/app/api/v1/** /route.ts     query parameters and status codes
 *
 * Base path: /api/v1 — GET only, no auth, no cookies.
 *   Lists  ->  { data: T[] }            (plus `pagination` on /products)
 *   Item   ->  { data: T }
 *   Errors ->  { error: string }
 *
 * If the server contract changes, this file is the single place that has to be
 * updated — screens and the API client both read their types from here.
 */

export interface ProductFlags {
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  festivalExclusive: boolean;
}

export interface Product {
  id: string;
  sku: string | null;
  title: string;
  description: string;
  craftsmanship: string | null;
  category: string;
  gender: string;
  occasion: string | null;
  price: number;
  promoPrice: number | null;
  discount: number | null;
  /** What the customer actually pays. The server derives it; do not re-derive. */
  effectivePrice: number;
  material: string | null;
  colors: string[];
  sizes: string[];
  care: string | null;
  sizeGuide: string | null;
  flags: ProductFlags;
  collectionId: string | null;
  images: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface Collection {
  id: string;
  title: string;
  description: string | null;
  banner: string | null;
  thumbnail: string | null;
  displayOrder: number;
}

export interface Store {
  id: string;
  name: string;
  code: string | null;
  type: string;
  /** DTO allows OPEN | COMING_SOON | TEMPORARILY_CLOSED; kept as string because
   *  the contract does not promise the server can never add a value, and the UI
   *  must not crash on one it has not seen (see STORE_STATUS_LABELS). */
  status: string;
  city: string;
  state: string;
  country: string;
  street: string | null;
  pinCode: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  openingHours: string | null;
  services: string[];
  photos: string[];
  description: string | null;
  accessibility: string | null;
  displayOrder: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  displayOrder: number;
}

export interface Appearance {
  primaryColor: string | null;
  accentGold: string | null;
  typography: string | null;
  buttonStyle: string | null;
  cardRadius: string | null;
}

/**
 * A storefront homepage section. The server stores this as free-form JSON and
 * casts it, so only the fields below are guaranteed by the endpoint; `items` is
 * unknown by design and is never rendered by this app.
 */
export interface SiteHomepageSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  displayOrder: number;
  visible?: boolean;
  stylePreset?: string;
  motionPreset?: string;
  layoutSettings?: {
    width?: string;
    paddingY?: string;
    alignment?: string;
  };
  items?: unknown[];
}

export interface SiteHomepage {
  page: string;
  version: number | null;
  publishedAt: string | null;
  sections: SiteHomepageSection[];
}

export interface SiteConfig {
  appearance: Appearance;
  homepage: SiteHomepage;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Every list endpoint of this API. */
export interface ListEnvelope<T> {
  data: T[];
}

/** /api/v1/products is the only endpoint that paginates today. */
export interface PaginatedEnvelope<T> extends ListEnvelope<T> {
  pagination: Pagination;
}

/** Documented failure shape. The client raises ApiError with this message. */
export interface ErrorEnvelope {
  error: string;
}
