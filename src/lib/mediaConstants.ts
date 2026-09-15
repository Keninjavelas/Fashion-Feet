export const MEDIA_FOLDERS = [
  { id: "branding", name: "Branding & Logos", description: "Primary, dark & light logos, favicons, loading animations" },
  { id: "homepage", name: "Homepage Assets", description: "Hero banners, scroll story visuals, craftsmanship features" },
  { id: "products", name: "Product Imagery", description: "Men's, Women's & Wedding handcrafted Jutti galleries" },
  { id: "collections", name: "Curated Collections", description: "Wedding Royale, Luxury Velvet, Casual Mojaris banners" },
  { id: "festivals", name: "Festival Campaigns", description: "Diwali, Baisakhi, Eid, Christmas theme drops & banners" },
  { id: "stores", name: "Boutique Stores", description: "Flagship showroom photos & experience center imagery" },
  { id: "backgrounds", name: "Backgrounds & Textures", description: "Zari patterns, silk velvet gradients, watermark overlays" },
  { id: "icons", name: "Icons & Badges", description: "Heritage seals, guarantee badges, custom SVG icons" },
  { id: "miscellaneous", name: "Miscellaneous", description: "General visual assets & promotional graphics" },
] as const;

export type MediaFolderId = (typeof MEDIA_FOLDERS)[number]["id"];
