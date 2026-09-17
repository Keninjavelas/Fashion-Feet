/**
 * Display formatting helpers.
 *
 * Currency assumption: the product contract carries bare numbers with no
 * currency code, and the storefront prices in Indian rupees (₹). This app
 * therefore renders ₹ with Indian digit grouping (1,23,456). If the catalogue
 * ever becomes multi-currency, the contract needs a currency field — do not
 * paper over it here.
 */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  const hasFraction = absolute % 1 > 0.004;
  const mantissa = hasFraction ? absolute.toFixed(2) : String(Math.round(absolute));
  const [whole = '0', fraction] = mantissa.split('.');
  const grouped = groupIndianDigits(whole);
  return `${sign}₹${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
}

/** 1234567 -> "12,34,567" (lakh/crore grouping, as used by the storefront). */
function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Returns null for anything unparseable so callers can hide the element. */
export function formatDate(iso: string | null | undefined): string | null {
  if (typeof iso !== 'string' || iso.trim().length === 0) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export interface StoreStatusPresentation {
  label: string;
  tone: 'positive' | 'neutral' | 'muted';
}

/**
 * Store statuses are OPEN | COMING_SOON | TEMPORARILY_CLOSED. An unrecognised
 * value is shown verbatim rather than blanked, so a new server status is visible
 * instead of silently invisible.
 */
export function storeStatusPresentation(status: string): StoreStatusPresentation {
  switch (status) {
    case 'OPEN':
      return { label: 'Open now', tone: 'positive' };
    case 'COMING_SOON':
      return { label: 'Coming soon', tone: 'neutral' };
    case 'TEMPORARILY_CLOSED':
      return { label: 'Temporarily closed', tone: 'muted' };
    default:
      return { label: status.replace(/_/g, ' ').toLowerCase(), tone: 'muted' };
  }
}

/** "Mojari" / "wedding" -> "Mojari" — for data that arrives lowercase. */
export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
