import type { Appearance } from '../api/types';

/**
 * The visual tokens of the app.
 *
 * The server publishes a small set of appearance values (`appearance.*` site
 * settings) that merchandisers edit. Those values are arbitrary strings typed by
 * a human, so every one of them is validated here before it reaches a style:
 * a bad colour would otherwise render invisible text on an unreadable card.
 *
 * Brand defaults below match the storefront palette in the web app, so the
 * native app still looks like Fashion Feet when /api/v1/site is unreachable.
 */

export interface Theme {
  /** Brand colour used for buttons, active chips and accents. */
  primary: string;
  /** Readable foreground for text/icons placed on `primary`. */
  onPrimary: string;
  /** Secondary metallic accent. */
  gold: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  danger: string;
  /** Corner radius for cards, from `appearance.cardRadius`. */
  cardRadius: number;
  /** Corner radius for buttons, derived from `appearance.buttonStyle`. */
  buttonRadius: number;
  /**
   * The raw `appearance.typography` token, surfaced for completeness. It is NOT
   * applied as a font: React Native can only use font families bundled at build
   * time, so a runtime string cannot be honoured. Documented in the README.
   */
  typographyToken: string | null;
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

const DEFAULT_PRIMARY = '#7A1F3D';
const DEFAULT_GOLD = '#D4AF37';
const DEFAULT_BACKGROUND = '#FBF7F2';
const DEFAULT_SURFACE = '#FFFFFF';
const DEFAULT_TEXT = '#241A1E';
const DEFAULT_MUTED = '#6F6259';
const DEFAULT_BORDER = '#E7DED3';
const DEFAULT_DANGER = '#B3261E';
const DEFAULT_CARD_RADIUS = 16;

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function readColor(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return HEX_COLOR.test(trimmed) ? trimmed : fallback;
}

function readRadius(value: string | null | undefined, fallback: number, max: number): number {
  if (typeof value !== 'string') return fallback;
  const match = /^\s*(\d+(?:\.\d+)?)/.exec(value);
  if (!match || match[1] === undefined) return fallback;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 0), max);
}

function readButtonRadius(value: string | null | undefined): number {
  if (typeof value !== 'string') return 999;
  const needle = value.trim().toLowerCase();
  if (needle.includes('sharp') || needle.includes('square')) return 4;
  if (needle.includes('soft') || needle.includes('round') || needle.includes('pill')) return 999;
  return readRadius(needle, 999, 999);
}

/**
 * Picks black or white for text on the brand colour using the WCAG relative
 * luminance formula, so a light primaryColor cannot produce invisible labels.
 */
function readOnPrimary(primary: string): string {
  const expanded =
    primary.length === 4
      ? `#${primary[1] ?? ''}${primary[1] ?? ''}${primary[2] ?? ''}${primary[2] ?? ''}${primary[3] ?? ''}${primary[3] ?? ''}`
      : primary;
  const r = Number.parseInt(expanded.slice(1, 3), 16) / 255;
  const g = Number.parseInt(expanded.slice(3, 5), 16) / 255;
  const b = Number.parseInt(expanded.slice(5, 7), 16) / 255;
  const channel = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  return luminance > 0.45 ? '#1A1215' : '#FFFFFF';
}

export function buildTheme(appearance: Appearance | null): Theme {
  const primary = readColor(appearance?.primaryColor, DEFAULT_PRIMARY);
  return {
    primary,
    onPrimary: readOnPrimary(primary),
    gold: readColor(appearance?.accentGold, DEFAULT_GOLD),
    background: DEFAULT_BACKGROUND,
    surface: DEFAULT_SURFACE,
    surfaceMuted: '#F3EDE5',
    border: DEFAULT_BORDER,
    text: DEFAULT_TEXT,
    textMuted: DEFAULT_MUTED,
    danger: DEFAULT_DANGER,
    cardRadius: readRadius(appearance?.cardRadius, DEFAULT_CARD_RADIUS, 32),
    buttonRadius: readButtonRadius(appearance?.buttonStyle),
    typographyToken: appearance?.typography ?? null,
  };
}
