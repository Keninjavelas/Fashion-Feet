export const CATALOGUES = [
  { slug: "daily-wear", name: "Daily Wear" },
  { slug: "festive", name: "Festive" },
  { slug: "ceremonial", name: "Ceremonial" },
] as const;

export type CatalogueName = (typeof CATALOGUES)[number]["name"];

export function findCatalogue(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return CATALOGUES.find((catalogue) => catalogue.slug === normalized || catalogue.name.toLowerCase() === normalized) ?? null;
}

export function catalogueHref(slug: string, gender?: "Men" | "Women") {
  const params = new URLSearchParams({ catalogue: slug });
  if (gender) params.set("gender", gender);
  return `/shop?${params.toString()}`;
}
