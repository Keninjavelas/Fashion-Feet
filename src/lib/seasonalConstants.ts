export type SeasonalThemeKey =
  | "default"
  | "diwali"
  | "holi"
  | "eid"
  | "christmas"
  | "lohri"
  | "baisakhi";

export interface SeasonalAtmosphereConfig {
  key: SeasonalThemeKey;
  label: string;
  badgeText: string;
  bgClass: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  particleType?: "gold_flakes" | "diyas" | "colors" | "crescent" | "snow" | "fire" | "harvest";
  themeTokens: {
    primaryBg: string;
    surfaceBg: string;
    accentGold: string;
    borderAccent: string;
  };
}

export const SEASONAL_ATMOSPHERES: Record<SeasonalThemeKey, SeasonalAtmosphereConfig> = {
  default: {
    key: "default",
    label: "Default Atmosphere",
    badgeText: "Patiala Heritage Atelier",
    bgClass: "bg-[#12080C] text-[#F6F2EB] border-[#D4AF37]",
    textColor: "#F6F2EB",
    borderColor: "#D4AF37",
    accentColor: "#8A1538",
    particleType: "gold_flakes",
    themeTokens: {
      primaryBg: "#12080C",
      surfaceBg: "rgba(255, 255, 255, 0.05)",
      accentGold: "#D4AF37",
      borderAccent: "rgba(212, 175, 55, 0.3)",
    },
  },
  diwali: {
    key: "diwali",
    label: "Diwali Festival",
    badgeText: "✨ Festival of Lights Collection",
    bgClass: "bg-[#1A0B0E] text-[#FDF8EF] border-[#D4AF37]",
    textColor: "#FDF8EF",
    borderColor: "#D4AF37",
    accentColor: "#E5A93C",
    particleType: "diyas",
    themeTokens: {
      primaryBg: "#1A0B0E",
      surfaceBg: "rgba(229, 169, 60, 0.1)",
      accentGold: "#F3C06B",
      borderAccent: "rgba(229, 169, 60, 0.4)",
    },
  },
  holi: {
    key: "holi",
    label: "Holi Festival",
    badgeText: "🌈 Festival of Colors Collection",
    bgClass: "bg-[#140817] text-[#FFF6FA] border-[#EC4899]",
    textColor: "#FFF6FA",
    borderColor: "#EC4899",
    accentColor: "#F43F5E",
    particleType: "colors",
    themeTokens: {
      primaryBg: "#140817",
      surfaceBg: "rgba(236, 72, 153, 0.1)",
      accentGold: "#F472B6",
      borderAccent: "rgba(236, 72, 153, 0.4)",
    },
  },
  eid: {
    key: "eid",
    label: "Eid Celebration",
    badgeText: "🌙 Crescent & Silk Collection",
    bgClass: "bg-[#091A14] text-[#F0FDF4] border-[#10B981]",
    textColor: "#F0FDF4",
    borderColor: "#10B981",
    accentColor: "#059669",
    particleType: "crescent",
    themeTokens: {
      primaryBg: "#091A14",
      surfaceBg: "rgba(16, 185, 129, 0.1)",
      accentGold: "#34D399",
      borderAccent: "rgba(16, 185, 129, 0.4)",
    },
  },
  christmas: {
    key: "christmas",
    label: "Christmas Winter",
    badgeText: "❄️ Winter Velvet Gala",
    bgClass: "bg-[#0F172A] text-[#F8FAFC] border-[#E11D48]",
    textColor: "#F8FAFC",
    borderColor: "#E11D48",
    accentColor: "#DC2626",
    particleType: "snow",
    themeTokens: {
      primaryBg: "#0F172A",
      surfaceBg: "rgba(225, 29, 72, 0.1)",
      accentGold: "#FB7185",
      borderAccent: "rgba(225, 29, 72, 0.4)",
    },
  },
  lohri: {
    key: "lohri",
    label: "Lohri Bonfire",
    badgeText: "🔥 Punjabi Bonfire Harvest",
    bgClass: "bg-[#180A04] text-[#FFF7ED] border-[#F97316]",
    textColor: "#FFF7ED",
    borderColor: "#F97316",
    accentColor: "#EA580C",
    particleType: "fire",
    themeTokens: {
      primaryBg: "#180A04",
      surfaceBg: "rgba(249, 115, 22, 0.1)",
      accentGold: "#FB923C",
      borderAccent: "rgba(249, 115, 22, 0.4)",
    },
  },
  baisakhi: {
    key: "baisakhi",
    label: "Baisakhi Harvest",
    badgeText: "🌾 Royal Wheat & Silk Harvest",
    bgClass: "bg-[#1C1005] text-[#FFFBEB] border-[#F59E0B]",
    textColor: "#FFFBEB",
    borderColor: "#F59E0B",
    accentColor: "#D97706",
    particleType: "harvest",
    themeTokens: {
      primaryBg: "#1C1005",
      surfaceBg: "rgba(245, 158, 11, 0.1)",
      accentGold: "#FBBF24",
      borderAccent: "rgba(245, 158, 11, 0.4)",
    },
  },
};

export const SUPPORTED_SEASONAL_KEYS: SeasonalThemeKey[] = [
  "default",
  "diwali",
  "holi",
  "eid",
  "christmas",
  "lohri",
  "baisakhi",
];

export function getSeasonalAtmosphere(themeKey?: string | null): SeasonalAtmosphereConfig {
  const normalized = (themeKey || "").toLowerCase() as SeasonalThemeKey;
  return SEASONAL_ATMOSPHERES[normalized] || SEASONAL_ATMOSPHERES.default;
}
