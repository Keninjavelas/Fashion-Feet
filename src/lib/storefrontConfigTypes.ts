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
    badge: "Handcrafted Luxury",
    title: "Timeless Elegance in Every Step",
    subtitle: "Handcrafted Punjabi Juttis & Modern Mojaris",
    description: "Hand-embroidery by skilled artisans in the Punjabi tradition.",
    ctaText: "Explore Collection",
    ctaLink: "/shop",
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
    badge: "Curated Galleries",
    title: "Occasion Collections",
    subtitle: "Curated for Weddings, Royal Festivities, & Everyday Elegance",
    displayOrder: 2,
    visible: true,
    stylePreset: "LIGHT_GOLD",
    motionPreset: "STAGGER",
    layoutSettings: { width: "DEFAULT", paddingY: "NORMAL", alignment: "LEFT" }
  },
  {
    id: "sec_craftsmanship",
    type: "CRAFTSMANSHIP_HERITAGE",
    badge: "The Royal Atelier",
    title: "Mastery in Every Hand-Stitched Pair",
    subtitle: "Hand-Embroidery on Every Pair",
    description: "Each Jutti is crafted from vegetable-tanned leather soles and adorned with dabka, cut-dana, and bullion embroidery.",
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
    badge: "Custom Fit Assurance",
    title: "Bespoke Size Studio",
    subtitle: "Zero-Bite Guarantee & Custom Sizing",
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
    badge: "Flagship Showrooms",
    title: "Experience Fashion Feet In-Person",
    subtitle: "Boutiques Opening Soon Across Major Cities",
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
