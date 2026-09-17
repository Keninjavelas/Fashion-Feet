import type {
  Category,
  Collection,
  Faq,
  Occasion,
  Product,
  ProductImage,
  Store,
} from "@prisma/client";

/**
 * Whitelist serializers for the public `/api/v1` surface.
 *
 * Every function in this file builds a NEW object literal, field by field.
 * Nothing is spread from a Prisma row, and no function returns its input.
 *
 * That is deliberate rather than stylistic. This codebase has a documented
 * history of leaking whole database rows to clients — the "leaked-full-row"
 * defect class in `docs/SecurityHardening.md` (defects #3, #15, #25), which at
 * its worst serialised `AdminUser.passwordHash` and `mfaSecret` into a browser
 * response. A public, unauthenticated endpoint is the worst possible place to
 * repeat that mistake, because there is no login wall in front of it at all.
 *
 * The practical consequence: adding a column to the Prisma schema can never
 * widen these responses by accident. A field becomes public only when somebody
 * edits this file on purpose.
 */

/**
 * Product `sizes`, `colors`, store `photos` and store `services` are stored as
 * untyped strings. The seed data writes them as JSON arrays, but a hand-edited
 * row may hold a comma-separated list, and several are null. Normalise all of
 * those to `string[]` so the mobile client never has to guess.
 */
function parseStringList(value: string | null | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      // Fall through to delimiter splitting: a malformed JSON blob should
      // degrade to "best effort list", never to a 500.
    }
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface PublicProduct {
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
  /** What the customer actually pays — saves the client re-deriving it. */
  effectivePrice: number;
  material: string | null;
  colors: string[];
  sizes: string[];
  care: string | null;
  sizeGuide: string | null;
  flags: {
    featured: boolean;
    newArrival: boolean;
    bestSeller: boolean;
    festivalExclusive: boolean;
  };
  collectionId: string | null;
  images: string[];
  createdAt: string;
}

export type ProductWithImages = Product & { images: ProductImage[] };

export function serializeProduct(product: ProductWithImages): PublicProduct {
  const promoPrice = product.promoPrice ?? null;

  return {
    id: product.id,
    sku: product.sku,
    title: product.title,
    description: product.description,
    craftsmanship: product.craftsmanship,
    category: product.category,
    gender: product.gender,
    occasion: product.occasion,
    price: product.price,
    promoPrice,
    discount: product.discount,
    effectivePrice: promoPrice !== null && promoPrice < product.price ? promoPrice : product.price,
    material: product.material,
    colors: parseStringList(product.colors),
    sizes: parseStringList(product.sizes),
    care: product.care,
    sizeGuide: product.sizeGuide,
    flags: {
      // Note the renames: `isNewArrival` etc. read poorly in a JSON contract and
      // the mobile client should not inherit internal column names.
      featured: product.featured,
      newArrival: product.isNewArrival,
      bestSeller: product.isBestSeller,
      festivalExclusive: product.isFestivalExclusive,
    },
    collectionId: product.collectionId,
    images: product.images.map((image) => image.url),
    createdAt: product.createdAt.toISOString(),
  };
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
}

export function serializeCategory(category: Category): PublicCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    displayOrder: category.displayOrder,
  };
  // Intentionally omitted: `active` (already filtered), `createdAt` (not useful
  // to a client and narrows the fingerprint).
}

export interface PublicOccasion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export function serializeOccasion(occasion: Occasion): PublicOccasion {
  return {
    id: occasion.id,
    name: occasion.name,
    slug: occasion.slug,
    description: occasion.description,
    displayOrder: occasion.displayOrder,
  };
}

export interface PublicCollection {
  id: string;
  title: string;
  description: string | null;
  banner: string | null;
  thumbnail: string | null;
  displayOrder: number;
}

export function serializeCollection(collection: Collection): PublicCollection {
  return {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    banner: collection.banner,
    thumbnail: collection.thumbnail,
    displayOrder: collection.displayOrder,
  };
}

export interface PublicStore {
  id: string;
  name: string;
  code: string | null;
  type: string;
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

export function serializeStore(store: Store): PublicStore {
  return {
    id: store.id,
    name: store.name,
    code: store.code,
    type: store.type,
    status: store.status,
    city: store.city,
    state: store.state,
    country: store.country,
    street: store.street,
    pinCode: store.pinCode,
    googleMapsUrl: store.googleMapsUrl,
    latitude: store.latitude,
    longitude: store.longitude,
    phone: store.phone,
    email: store.email,
    whatsapp: store.whatsapp,
    openingHours: store.openingHours,
    services: parseStringList(store.services),
    photos: parseStringList(store.photos),
    description: store.description,
    accessibility: store.accessibility,
    displayOrder: store.displayOrder,
  };
  // Intentionally omitted: `managerName`. It is a named individual's internal
  // point of contact, not storefront content, and publishing it on an
  // unauthenticated endpoint would put a person's name and role on the open
  // internet. `createdAt` is likewise internal housekeeping.
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPinned: boolean;
  displayOrder: number;
}

export function serializeFaq(faq: Faq): PublicFaq {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    isPinned: faq.isPinned,
    displayOrder: faq.displayOrder,
  };
  // NOTE: the `Faq` model has no `active`/`visible`/`status` column, so every
  // row in that table is public by construction. There is no hidden-FAQ flag to
  // filter on — do not add a filter that pretends otherwise. If unpublished FAQs
  // are ever needed, the schema needs a column first.
}

export interface PublicAppearance {
  primaryColor: string | null;
  accentGold: string | null;
  typography: string | null;
  buttonStyle: string | null;
  cardRadius: string | null;
}

/**
 * The only site-configuration keys that may leave the server.
 *
 * An allowlist rather than a denylist: settings are stored as arbitrary
 * key/value strings, so a future key named e.g. `payments.stripeSecret` would be
 * published by a `findMany()` dump. A new key is private until it is added here.
 */
export const PUBLIC_APPEARANCE_KEYS = [
  "appearance.primaryColor",
  "appearance.accentGold",
  "appearance.typography",
  "appearance.buttonStyle",
  "appearance.cardRadius",
] as const;

export function serializeAppearance(values: Record<string, string>): PublicAppearance {
  return {
    primaryColor: values["appearance.primaryColor"] ?? null,
    accentGold: values["appearance.accentGold"] ?? null,
    typography: values["appearance.typography"] ?? null,
    buttonStyle: values["appearance.buttonStyle"] ?? null,
    cardRadius: values["appearance.cardRadius"] ?? null,
  };
}
