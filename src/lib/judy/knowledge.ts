import { prisma } from "@/lib/prisma";
import {
  PUBLIC_APPEARANCE_KEYS,
  serializeCollection,
  serializeFaq,
  serializeProduct,
  serializeStore,
} from "@/lib/publicSerializers";
import {
  DEFAULT_PAGE_CONFIGS,
  getPublishedStorefrontConfig,
  type StorefrontSection,
} from "@/lib/storefrontConfig";
import type { JudyKnowledgeBase, JudyKnowledgeEntry } from "@/lib/judy/types";

/**
 * Judy's knowledge base.
 *
 * Every entry below is built from data the website already publishes, and every
 * field is whitelisted field-by-field — the same discipline as
 * `publicSerializers.ts`. Nothing is spread from a Prisma row, so adding a
 * column to the schema (an internal `managerName`, a draft flag, a cost price)
 * can never widen what Judy can say.
 *
 * The tables are read with the same predicates the storefront and the public
 * `/api/v1` surface use:
 *   - Product : `archived: false, published: true`  (see /api/v1/products)
 *   - Store   : status in OPEN | COMING_SOON | TEMPORARILY_CLOSED (see /api/v1/stores)
 *   - Faq     : every row is public by schema (see /api/v1/faqs)
 *   - Collection : `visible: true, status: "PUBLISHED"` (see /api/v1/collections)
 *   - StorefrontConfig : only the PUBLISHED row, draft sandboxes excluded
 *   - CompanyContent / SiteSetting : only the appearance keys that
 *     `PUBLIC_APPEARANCE_KEYS` already treats as public, and only PUBLISHED rows
 *
 * IMPORTANT — expected behaviour when the catalogue is empty:
 * Product, Faq, Store and StorefrontConfig currently hold ZERO rows. Judy's
 * coverage today is therefore almost nil, and that is by design: with no
 * retrieved entry she must say "I don't have that information yet" and point at
 * `/contact` rather than guess. Coverage grows automatically the moment real
 * content is published, because this file is the only place that defines what
 * she can see.
 */

/**
 * Statuses a customer is allowed to see — the same list `/api/v1/stores` uses.
 * DRAFT is an unpublished location being set up and ARCHIVED is a closed one;
 * neither may reach Judy, who would otherwise announce a store that does not
 * exist as a place to visit.
 */
const PUBLIC_STORE_STATUSES = ["OPEN", "COMING_SOON", "TEMPORARILY_CLOSED"] as const;

/** How long a loaded knowledge base stays warm before it is rebuilt from the DB. */
const KNOWLEDGE_TTL_MS = 60_000;

const EMPTY_COUNTS: JudyKnowledgeBase["counts"] = {
  faq: 0,
  product: 0,
  collection: 0,
  store: 0,
  homepage: 0,
  company: 0,
};

function formatPrice(amount: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // ICU should always be present; if it is not, a stable non-crashing format
    // beats an exception. The number is still the real database value.
    return `INR ${amount}`;
  }
}

function splitKeywords(...parts: Array<string | null | undefined>): string[] {
  return parts
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .split(/[^A-Za-z0-9\u00c0-\u024f]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function sectionsToEntries(page: string, sections: StorefrontSection[]): JudyKnowledgeEntry[] {
  return sections
    .filter((section) => section.visible !== false)
    .map((section) => {
      const titleLine = `${section.title}${section.subtitle ? ` — ${section.subtitle}` : ""}`;

      // Badge/subtitle/description are only added when they are not already part
      // of the headline, so a section that repeats its subtitle in its title does
      // not produce a stuttering answer.
      const extraLines = [section.badge, section.subtitle, section.description]
        .filter((line): line is string => typeof line === "string" && line.trim().length > 0)
        .map((line) => line.trim())
        .filter((line) => !titleLine.toLowerCase().includes(line.toLowerCase()));

      return {
        id: `section:${page}:${section.id}`,
        source: "homepage" as const,
        title: `${page === "homepage" ? "Homepage" : page} section — ${section.title}`,
        text: [titleLine, ...extraLines].join("\n"),
        keywords: splitKeywords(section.badge, section.title, section.subtitle, page),
        link: section.ctaLink,
      };
    })
    .filter((entry) => entry.text.trim().length > 0);
}

async function loadFaqEntries(): Promise<JudyKnowledgeEntry[]> {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }],
  });

  return faqs.map((faq) => {
    const pub = serializeFaq(faq);
    return {
      id: `faq:${pub.id}`,
      source: "faq" as const,
      title: pub.question,
      text: pub.answer,
      keywords: splitKeywords(pub.category, pub.question),
      link: "/faq",
    };
  });
}

async function loadProductEntries(): Promise<JudyKnowledgeEntry[]> {
  const products = await prisma.product.findMany({
    // The exact predicate the storefront and /api/v1/products use, so a draft or
    // archived SKU can never be quoted to a customer.
    where: { archived: false, published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return products.map((product) => {
    const pub = serializeProduct({ ...product, images: [] });
    const facts = [
      pub.description,
      `Category: ${pub.category}${pub.gender ? ` (${pub.gender})` : ""}.`,
      pub.occasion ? `Occasion: ${pub.occasion}.` : null,
      `Price: ${formatPrice(pub.effectivePrice)}${
        pub.promoPrice !== null && pub.promoPrice < pub.price ? ` (discounted from ${formatPrice(pub.price)})` : ""
      }.`,
      pub.material ? `Material: ${pub.material}.` : null,
      pub.colors.length > 0 ? `Colours: ${pub.colors.join(", ")}.` : null,
      pub.sizes.length > 0 ? `Sizes: ${pub.sizes.join(", ")}.` : null,
      pub.craftsmanship ? `Craftsmanship: ${pub.craftsmanship}.` : null,
      pub.care ? `Care: ${pub.care}.` : null,
      pub.sizeGuide ? `Size guide: ${pub.sizeGuide}.` : null,
      pub.sku ? `SKU: ${pub.sku}.` : null,
    ].filter((fact): fact is string => !!fact);

    return {
      id: `product:${pub.id}`,
      source: "product" as const,
      title: pub.title,
      text: facts.join("\n"),
      keywords: splitKeywords(pub.category, pub.gender, pub.occasion, pub.title, pub.colors.join(" ")),
      link: `/product/${pub.id}`,
    };
  });
}

async function loadCollectionEntries(): Promise<JudyKnowledgeEntry[]> {
  const collections = await prisma.collection.findMany({
    where: { visible: true, status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    take: 100,
  });

  return collections.map((collection) => {
    const pub = serializeCollection(collection);
    return {
      id: `collection:${pub.id}`,
      source: "collection" as const,
      title: pub.title,
      text: [pub.title, pub.description].filter(Boolean).join("\n"),
      keywords: splitKeywords(pub.title),
      // There is no `/collections/[id]` route in this app; collections are browsed
      // through the shop. Linking to a route that does not exist would be its own
      // small lie, so this points at something real.
      link: "/shop",
    };
  });
}

async function loadStoreEntries(): Promise<JudyKnowledgeEntry[]> {
  const stores = await prisma.store.findMany({
    where: { status: { in: [...PUBLIC_STORE_STATUSES] } },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    take: 100,
  });

  return stores.map((store) => {
    const pub = serializeStore(store);
    const address = [pub.street, pub.city, pub.state, pub.pinCode, pub.country]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .join(", ");

    const facts = [
      `Status: ${pub.status.replace(/_/g, " ").toLowerCase()}.`,
      address ? `Address: ${address}.` : null,
      pub.openingHours ? `Opening hours: ${pub.openingHours}.` : null,
      pub.phone ? `Phone: ${pub.phone}.` : null,
      pub.whatsapp ? `WhatsApp: ${pub.whatsapp}.` : null,
      pub.email ? `Email: ${pub.email}.` : null,
      pub.services.length > 0 ? `Services: ${pub.services.join(", ")}.` : null,
      pub.accessibility ? `Accessibility: ${pub.accessibility}.` : null,
      pub.description,
    ].filter((fact): fact is string => !!fact);

    return {
      id: `store:${pub.id}`,
      source: "store" as const,
      title: pub.name,
      text: facts.join("\n"),
      keywords: splitKeywords(pub.name, pub.city, pub.state, pub.type, "store boutique visit"),
      link: "/stores",
    };
  });
}

async function loadHomepageEntries(): Promise<JudyKnowledgeEntry[]> {
  const pages = Object.keys(DEFAULT_PAGE_CONFIGS);
  const entries: JudyKnowledgeEntry[] = [];

  for (const page of pages) {
    const sections = await getPublishedStorefrontConfig(page);
    entries.push(...sectionsToEntries(page, sections));
  }

  return entries;
}

async function loadCompanyEntries(): Promise<JudyKnowledgeEntry[]> {
  const [companyRows, siteRows] = await Promise.all([
    // Same source of truth as /api/v1/site: the appearance allowlist, PUBLISHED
    // rows only. A key that is not on the allowlist is private by default.
    prisma.companyContent.findMany({
      where: { key: { in: [...PUBLIC_APPEARANCE_KEYS] }, status: "PUBLISHED" },
      select: { key: true, content: true },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: [...PUBLIC_APPEARANCE_KEYS] } },
      select: { key: true, value: true },
    }),
  ]);

  const values: Record<string, string> = {};
  for (const row of companyRows) values[row.key] = row.content;
  for (const row of siteRows) values[row.key] = row.value;

  const present = Object.entries(values).filter(([, value]) => value && value.trim().length > 0);

  if (present.length === 0) return [];

  return [
    {
      id: "company:appearance",
      source: "company",
      title: "Brand appearance settings",
      text: present.map(([key, value]) => `${key.replace("appearance.", "Brand ")}: ${value}`).join("\n"),
      keywords: splitKeywords("brand colour appearance theme logo typography", ...present.map(([key]) => key)),
      link: "/about",
    },
  ];
}

interface CacheState {
  knowledge: JudyKnowledgeBase | null;
  loadedAtMs: number;
}

const globalForJudy = globalThis as unknown as { judyKnowledgeCache?: CacheState };
const cache: CacheState = (globalForJudy.judyKnowledgeCache ??= { knowledge: null, loadedAtMs: 0 });

/**
 * Loads (and briefly caches) Judy's knowledge base.
 *
 * Never throws. If the database is unreachable, or one table is missing, the
 * failing source degrades to zero entries and the reason is logged server-side —
 * a knowledge-base problem must not turn into a 500 on the chat endpoint, and it
 * must never turn into invented content either. Fewer entries means more honest
 * "I don't know yet" replies, which is the correct failure direction.
 */
export async function loadJudyKnowledge(options: { force?: boolean } = {}): Promise<JudyKnowledgeBase> {
  const fresh = cache.knowledge && Date.now() - cache.loadedAtMs < KNOWLEDGE_TTL_MS;
  if (fresh && !options.force && cache.knowledge) return cache.knowledge;

  const loaders: Array<[keyof JudyKnowledgeBase["counts"], () => Promise<JudyKnowledgeEntry[]>]> = [
    ["faq", loadFaqEntries],
    ["product", loadProductEntries],
    ["collection", loadCollectionEntries],
    ["store", loadStoreEntries],
    ["homepage", loadHomepageEntries],
    ["company", loadCompanyEntries],
  ];

  const counts = { ...EMPTY_COUNTS };
  const entries: JudyKnowledgeEntry[] = [];

  const results = await Promise.all(
    loaders.map(async ([source, load]) => {
      try {
        return { source, entries: await load() };
      } catch (error) {
        console.error(`[judy] knowledge source "${source}" failed to load:`, error);
        return { source, entries: [] as JudyKnowledgeEntry[] };
      }
    })
  );

  for (const result of results) {
    counts[result.source] = result.entries.length;
    entries.push(...result.entries);
  }

  const knowledge: JudyKnowledgeBase = {
    entries,
    counts,
    loadedAt: new Date().toISOString(),
  };

  cache.knowledge = knowledge;
  cache.loadedAtMs = Date.now();

  return knowledge;
}

/** Test/debug helper: drops the cache so the next load reads the database again. */
export function resetJudyKnowledgeCache(): void {
  cache.knowledge = null;
  cache.loadedAtMs = 0;
}
