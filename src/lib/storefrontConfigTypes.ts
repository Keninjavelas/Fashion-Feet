import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export interface StorefrontSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  mediaAssetId?: string;
  displayOrder: number;
  visible: boolean;
  stylePreset?: string;
  motionPreset?: string;
  layoutSettings?: {
    width?: "DEFAULT" | "FULL" | "NARROW";
    paddingY?: "COMPACT" | "NORMAL" | "SPACIOUS";
    alignment?: "LEFT" | "CENTER" | "RIGHT";
  };
  items?: any[];
}

export const DEFAULT_HOMEPAGE_SECTIONS: StorefrontSection[] = [
  {
    id: "sec_hero",
    type: "HERO_BANNER",
    badge: "Designer Punjabi Juttis",
    title: "Punjabi Juttis, Beautifully Made",
    subtitle: "Discover designs for everyday moments, celebrations, and ceremonies.",
    description: "Explore Fashion Feet footwear through real photographs from the collection.",
    ctaText: "Explore the designs",
    ctaLink: "/women",
    image: PLACEHOLDER_HOMEPAGE_IMAGE,
    displayOrder: 1,
    visible: true,
    stylePreset: "DARK_ROYAL",
    motionPreset: "FADE_UP",
    layoutSettings: { width: "FULL", paddingY: "SPACIOUS", alignment: "CENTER" }
  },
  {
    id: "sec_collections",
    type: "FEATURED_COLLECTIONS",
    badge: "The collections",
    title: "Find your next pair",
    subtitle: "Daily Wear, Festive, and Ceremonial designs.",
    displayOrder: 2,
    visible: true,
    stylePreset: "LIGHT_GOLD",
    motionPreset: "STAGGER",
    layoutSettings: { width: "DEFAULT", paddingY: "NORMAL", alignment: "LEFT" }
  },
  {
    id: "sec_craftsmanship",
    type: "CRAFTSMANSHIP_HERITAGE",
    badge: "Design details",
    title: "A closer look at the collection",
    subtitle: "Colour, texture, and detail seen up close.",
    description: "Explore the photographed designs in the Fashion Feet archive.",
    ctaText: "Discover Our Heritage",
    ctaLink: "/about",
    image: PLACEHOLDER_HOMEPAGE_IMAGE,
    displayOrder: 3,
    visible: true,
    stylePreset: "GLASS",
    motionPreset: "REVEAL",
    layoutSettings: { width: "DEFAULT", paddingY: "SPACIOUS", alignment: "LEFT" }
  },
  {
    id: "sec_trending",
    type: "TRENDING_DESIGNS",
    badge: "Artisan Picks",
    title: "Trending Footwear",
    subtitle: "Our Most Coveted Groom & Bridal Mojaris",
    displayOrder: 4,
    visible: true,
    stylePreset: "LIGHT_GOLD",
    motionPreset: "FADE_UP",
    layoutSettings: { width: "DEFAULT", paddingY: "NORMAL", alignment: "LEFT" }
  },
  {
    id: "sec_size_studio",
    type: "SIZE_STUDIO_PROMO",
    badge: "Find your fit",
    title: "Start with a good measurement",
    subtitle: "Measure your feet and ask about sizing for your chosen pair.",
    description: "Measure your feet at home, or get in touch and we will help you find the right fit.",
    ctaText: "Find Your Size",
    ctaLink: "/size-guide",
    displayOrder: 5,
    visible: true,
    stylePreset: "DARK_ROYAL",
    motionPreset: "PARALLAX",
    layoutSettings: { width: "DEFAULT", paddingY: "NORMAL", alignment: "CENTER" }
  },
  {
    id: "sec_stores",
    type: "STORES_PROMO",
    badge: "Discover Fashion Feet",
    title: "Explore the photographed collection",
    subtitle: "Our designs are available to view online.",
    displayOrder: 6,
    visible: true,
    stylePreset: "GLASS",
    motionPreset: "FADE_UP",
    layoutSettings: { width: "DEFAULT", paddingY: "NORMAL", alignment: "CENTER" }
  }
];

export const DEFAULT_PAGE_CONFIGS: Record<string, StorefrontSection[]> = {
  homepage: DEFAULT_HOMEPAGE_SECTIONS,
  men: [
    {
      id: "sec_men_hero",
      type: "HERO_BANNER",
      badge: "Groom & Royal Couture",
      title: "Men's Heritage Collection",
      subtitle: "Traditional Royal Mojaris & Velvet Sherwani Footwear",
      ctaText: "Shop Men's",
      ctaLink: "/shop?gender=Men",
      image: PLACEHOLDER_HOMEPAGE_IMAGE,
      displayOrder: 1,
      visible: true,
      stylePreset: "DARK_ROYAL",
      motionPreset: "FADE_UP"
    }
  ],
  women: [
    {
      id: "sec_women_hero",
      type: "HERO_BANNER",
      badge: "",
      title: "Women's Punjabi Juttis",
      subtitle: "Extravagant Zardozi, Cut-Dana, & Pearl Embroidery",
      ctaText: "Shop Women's",
      ctaLink: "/shop?gender=Women",
      image: PLACEHOLDER_HOMEPAGE_IMAGE,
      displayOrder: 1,
      visible: true,
      stylePreset: "LIGHT_GOLD",
      motionPreset: "FADE_UP"
    }
  ],
  about: [
    {
      id: "sec_about_hero",
      type: "HERO_BANNER",
      badge: "Our Story",
      title: "Fashion Feet Legacy",
      subtitle: "Preserving the Craft of Hand-Stitched Juttis",
      description: "Fashion Feet was born out of a passion to keep the art of hand-stitched Juttis alive.",
      displayOrder: 1,
      visible: true,
      stylePreset: "GLASS",
      motionPreset: "REVEAL"
    }
  ],
  footer: [
    {
      id: "sec_footer_global",
      type: "GLOBAL_FOOTER",
      badge: "Fashion Feet Atelier",
      title: "Fashion Feet",
      subtitle: "Handcrafted Punjabi Juttis & Royal Mojaris",
      description: "Crafted with passion. Worldwide delivery.",
      ctaText: "Customer Concierge",
      ctaLink: "/contact",
      displayOrder: 1,
      visible: true,
      stylePreset: "DARK_ROYAL"
    }
  ]
};
