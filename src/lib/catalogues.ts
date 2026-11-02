export const CATALOGUES = [
  { slug: "daily-wear", name: "Daily Wear" },
  { slug: "festive", name: "Festive" },
  { slug: "ceremonial", name: "Ceremonial" },
  { slug: "rajwadi", name: "Rajwadi" },
  { slug: "functional", name: "Functional" },
  { slug: "office-wear", name: "Office Wear" },
] as const;

export type CatalogueName = (typeof CATALOGUES)[number]["name"];

export function findCatalogue(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return CATALOGUES.find((catalogue) => catalogue.slug === normalized || catalogue.name.toLowerCase() === normalized) ?? null;
}

export function catalogueAvailableForGender(slug: string, gender?: string) {
  if (slug === "rajwadi") return !gender || gender === "Women";
  if (slug === "functional" || slug === "office-wear") return !gender || gender === "Men";
  return true;
}

export function cataloguesForGender(gender?: string) {
  return CATALOGUES.filter((catalogue) => catalogueAvailableForGender(catalogue.slug, gender));
}

export function catalogueHref(slug: string, gender?: "Men" | "Women") {
  const params = new URLSearchParams({ catalogue: slug });
  if (slug === "rajwadi") params.set("gender", "Women");
  else if (slug === "functional" || slug === "office-wear") params.set("gender", "Men");
  else if (gender) params.set("gender", gender);
  return `/shop?${params.toString()}`;
}
