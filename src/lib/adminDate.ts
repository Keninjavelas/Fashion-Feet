const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function indiaClock(value: string | Date) {
  const instant = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instant.getTime())) return null;
  return new Date(instant.getTime() + INDIA_OFFSET_MS);
}

export function formatAdminDate(value: string | Date): string {
  const date = indiaClock(value);
  if (!date) return "—";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatAdminTime(value: string | Date): string {
  const date = indiaClock(value);
  if (!date) return "—";
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hour % 12 || 12}:${minute} ${hour < 12 ? "am" : "pm"} IST`;
}

export function formatAdminDateTime(value: string | Date): string {
  const date = formatAdminDate(value);
  if (date === "—") return date;
  return `${date}, ${formatAdminTime(value)}`;
}
