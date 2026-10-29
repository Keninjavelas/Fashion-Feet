export interface ThemePreset {
  id: string;
  name: string;
  mood: string;
  isDark: boolean;
  badgeLabel: string;
  tokens: {
    "--color-bg": string;
    "--color-surface": string;
    "--color-surface-hover": string;
    "--color-text": string;
    "--color-text-muted": string;
    "--color-accent": string;
    "--color-jewel": string;
    "--color-border": string;
    "--color-shadow": string;
  };
  decorations: {
    particleType: "none" | "diyas" | "gulal" | "lanterns" | "snowfall" | "embers" | "wheat";
    particlesEnabled: boolean;
    announcementEnabled: boolean;
    announcementMessages: string[];
    heroTreatment: "plain" | "festive";
    ornamentDividersEnabled: boolean;
    cardBadge: string;
    heroHeadline: string;
    heroSubheadline: string;
  };
}

export const themePresets: Record<string, ThemePreset> = {
  default: {
    id: "default",
    name: "Normal Luxury Atelier",
    mood: "Warm & Elegant Luxury Showroom",
    isDark: false,
    badgeLabel: "Heritage Collection",
    tokens: {
      "--color-bg": "#F7F2EA",
      "--color-surface": "#FFFFFF",
      "--color-surface-hover": "#F2E9E1",
      "--color-text": "#281C1B",
      "--color-text-muted": "#594843",
      "--color-accent": "#805D2A",
      "--color-jewel": "#861638",
      "--color-border": "#D8C9BD",
      "--color-shadow": "rgba(31, 26, 23, 0.08)"
    },
    decorations: {
      particleType: "none",
      particlesEnabled: false,
      announcementEnabled: false,
      announcementMessages: [
        "Fashion Feet • Designer Punjabi Juttis"
      ],
      heroTreatment: "plain",
      ornamentDividersEnabled: false,
      cardBadge: "Heritage Pair",
      heroHeadline: "Handcrafted Luxury Footwear",
      heroSubheadline: "Where traditional Punjabi embroidery meets modern ergonomic comfort."
    }
  },
  diwali: {
    id: "diwali",
    name: "Diwali Festive Royal Vault",
    mood: "Warm, Royal & Celebratory Gold",
    isDark: true,
    badgeLabel: "Diwali Exclusive",
    tokens: {
      "--color-bg": "#12080C",
      "--color-surface": "#1C1412",
      "--color-surface-hover": "#241B18",
      "--color-text": "#FFFFFF",
      "--color-text-muted": "#F6F2EB",
      "--color-accent": "#D4AF37",
      "--color-jewel": "#8A1538",
      "--color-border": "rgba(212, 175, 55, 0.3)",
      "--color-shadow": "rgba(0, 0, 0, 0.5)"
    },
    decorations: {
      particleType: "diyas",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Diwali Festive Showcase Live • Regal Zari Embroidered Juttis & Velvet Mojaris",
        "Celebrate Festival of Lights with Limited Edition Gold Thread Pairs",
        "Complimentary Royal Diwali Gift Box with Every Order"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Diwali Exclusive",
      heroHeadline: "Celebrate Diwali with Timeless Golden Elegance",
      heroSubheadline: "Handcrafted Zari embroidery and glowing auspicious craftsmanship for your grand festive celebrations."
    }
  },
  holi: {
    id: "holi",
    name: "Holi Festival of Colors",
    mood: "Joyful, Artistic & Vibrant",
    isDark: false,
    badgeLabel: "Holi Color Drop",
    tokens: {
      "--color-bg": "#FFF9FB",
      "--color-surface": "#FFFFFF",
      "--color-surface-hover": "#FFF0F5",
      "--color-text": "#1A1A2E",
      "--color-text-muted": "#4A4E69",
      "--color-accent": "#FF758F",
      "--color-jewel": "#2A9D8F",
      "--color-border": "rgba(255, 117, 143, 0.25)",
      "--color-shadow": "rgba(255, 117, 143, 0.1)"
    },
    decorations: {
      particleType: "gulal",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Holi Color Palette Edition Live • Organic Gulal Dye Hand-Stitched Leather Juttis",
        "Celebrate Colours Through Handcrafted Punjabi Artistry",
        "Free Floral Fragrance & Care Kit Included"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Holi Color Drop",
      heroHeadline: "Celebrate Colours Through Handcrafted Artistry",
      heroSubheadline: "Vibrant organic shades and joyful floral motifs handcrafted for the festive spirit of spring."
    }
  },
  eid: {
    id: "eid",
    name: "Eid Festive Elegance",
    mood: "Elegant, Peaceful & Sophisticated Emerald",
    isDark: true,
    badgeLabel: "Eid Festive Elegance",
    tokens: {
      "--color-bg": "#0B1D16",
      "--color-surface": "#122C22",
      "--color-surface-hover": "#1A3A2E",
      "--color-text": "#FAF6F0",
      "--color-text-muted": "#D1E7DD",
      "--color-accent": "#D4AF37",
      "--color-jewel": "#064E3B",
      "--color-border": "rgba(212, 175, 55, 0.35)",
      "--color-shadow": "rgba(0, 0, 0, 0.6)"
    },
    decorations: {
      particleType: "lanterns",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Eid Festive Collection Live • Royal Velvet & Crescent Gold Embroidered Pairs",
        "Peaceful Elegance • Pure Silver Dabka & Pearl Artisan Craftsmanship",
        "Complimentary Velvet Dust Bag & Festive Box"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Eid Festive Elegance",
      heroHeadline: "Radiant Eid Elegance & Royal Heritage",
      heroSubheadline: "Emerald velvet, crescent gold threadwork, and serene luxury for your Eid gatherings."
    }
  },
  christmas: {
    id: "christmas",
    name: "Holiday & Christmas Edition",
    mood: "Warm, Cozy & Luxury Winter Showcase",
    isDark: true,
    badgeLabel: "Holiday Gift Edition",
    tokens: {
      "--color-bg": "#0D1F17",
      "--color-surface": "#162E23",
      "--color-surface-hover": "#1E3B2E",
      "--color-text": "#FFFFFF",
      "--color-text-muted": "#FEF3C7",
      "--color-accent": "#D4AF37",
      "--color-jewel": "#991B1B",
      "--color-border": "rgba(212, 175, 55, 0.3)",
      "--color-shadow": "rgba(0, 0, 0, 0.5)"
    },
    decorations: {
      particleType: "snowfall",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Holiday Season Collection Live • Deep Crimson & Forest Green Velvet Cushioning",
        "The Perfect Heritage Gift • Elegant Ribbon Packaging & Express Worldwide Shipping",
        "Twinkling Festive Lights & Warm Winter Luxury"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Holiday Gift Edition",
      heroHeadline: "Warm Holiday Luxury & Timeless Craftsmanship",
      heroSubheadline: "Wrap your loved ones in handcrafted leather comfort and velvet warmth this holiday season."
    }
  },
  lohri: {
    id: "lohri",
    name: "Lohri Harvest Heritage",
    mood: "Rustic, Traditional Punjabi Heritage",
    isDark: true,
    badgeLabel: "Punjabi Heritage",
    tokens: {
      "--color-bg": "#1C0D07",
      "--color-surface": "#2A160D",
      "--color-surface-hover": "#381F13",
      "--color-text": "#FFF5EF",
      "--color-text-muted": "#FED7AA",
      "--color-accent": "#EA580C",
      "--color-jewel": "#8A1538",
      "--color-border": "rgba(234, 88, 12, 0.35)",
      "--color-shadow": "rgba(0, 0, 0, 0.6)"
    },
    decorations: {
      particleType: "embers",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Lohri Harvest Heritage Drop • Authentic Phulkari Folk Motifs & Burnt Amber Soles",
        "Warm Bonfire Celebration • Traditional Punjabi Mela Footwear Showcase",
        "Pure Leather & Hand-Spun Silk Threadwork"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Punjabi Heritage",
      heroHeadline: "Celebrate Lohri with Warm Punjabi Folk Artistry",
      heroSubheadline: "Authentic bonfire warmth, traditional phulkari threadwork, and rich harvest heritage."
    }
  },
  baisakhi: {
    id: "baisakhi",
    name: "Baisakhi Spring Harvest",
    mood: "Fresh, Traditional & Joyful Mustard Gold",
    isDark: false,
    badgeLabel: "Spring Harvest",
    tokens: {
      "--color-bg": "#FFFDF7",
      "--color-surface": "#FFFFFF",
      "--color-surface-hover": "#FEF9E7",
      "--color-text": "#1F1A17",
      "--color-text-muted": "#78350F",
      "--color-accent": "#D97706",
      "--color-jewel": "#15803D",
      "--color-border": "rgba(217, 119, 6, 0.25)",
      "--color-shadow": "rgba(217, 119, 6, 0.08)"
    },
    decorations: {
      particleType: "wheat",
      particlesEnabled: true,
      announcementEnabled: true,
      announcementMessages: [
        "Baisakhi Harvest Collection Live • Golden Wheat & Spring Flora Motifs",
        "Fresh Harvest Celebration • Vibrant Punjabi Folk Crafts & Comfortable Cushioning",
        "Free Baisakhi Heritage Care Kit Included"
      ],
      heroTreatment: "festive",
      ornamentDividersEnabled: true,
      cardBadge: "Spring Harvest",
      heroHeadline: "Celebrate Baisakhi with Golden Harvest Radiance",
      heroSubheadline: "Mustard gold tones, wheat motifs, and joyful spring craftsmanship for your festivities."
    }
  }
};

export function getThemePreset(themeId: string): ThemePreset {
  return themePresets[themeId] || themePresets.default;
}
