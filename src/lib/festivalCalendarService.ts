import { prisma } from "@/lib/prisma";
import { SeasonalThemeKey, SEASONAL_ATMOSPHERES } from "@/lib/seasonalConstants";

export interface FestivalCalendarEvent {
  theme: SeasonalThemeKey;
  name: string;
  eventDate: string; // YYYY-MM-DD
  startDate: Date;   // 5 days before (00:00:00)
  endDate: Date;     // 5 days after (23:59:59.999)
  source: "internet_api" | "verified_calendar";
  description: string;
}

// Verified astronomical / panchang & cultural calendar lookup across 2024–2030
// Used as authoritative fallbacks if external API is unreachable or missing specific Punjabi festivals (Lohri/Baisakhi)
const MULTI_YEAR_CALENDAR: Record<number, Partial<Record<SeasonalThemeKey, string>>> = {
  2024: {
    lohri: "2024-01-13",
    holi: "2024-03-25",
    eid: "2024-04-10",
    baisakhi: "2024-04-13",
    diwali: "2024-10-31",
    christmas: "2024-12-25",
  },
  2025: {
    lohri: "2025-01-13",
    holi: "2025-03-14",
    eid: "2025-03-30",
    baisakhi: "2025-04-13",
    diwali: "2025-10-20",
    christmas: "2025-12-25",
  },
  2026: {
    lohri: "2026-01-13",
    holi: "2026-03-04",
    eid: "2026-03-21",
    baisakhi: "2026-04-14",
    diwali: "2026-11-08",
    christmas: "2026-12-25",
  },
  2027: {
    lohri: "2027-01-13",
    eid: "2027-03-10",
    holi: "2027-03-22",
    baisakhi: "2027-04-14",
    diwali: "2027-10-29",
    christmas: "2027-12-25",
  },
  2028: {
    lohri: "2028-01-13",
    eid: "2028-02-27",
    holi: "2028-03-11",
    baisakhi: "2028-04-13",
    diwali: "2028-10-17",
    christmas: "2028-12-25",
  },
  2029: {
    lohri: "2029-01-13",
    eid: "2029-02-15",
    holi: "2029-02-28",
    baisakhi: "2029-04-14",
    diwali: "2029-11-05",
    christmas: "2029-12-25",
  },
  2030: {
    lohri: "2030-01-13",
    eid: "2030-02-05",
    holi: "2030-03-20",
    baisakhi: "2030-04-13",
    diwali: "2030-10-26",
    christmas: "2030-12-25",
  },
};

/**
 * Calculates an exact 11-day active window around a festival event date.
 * Exactly 5 days prior to the event, the event day itself, and 5 days post-event (5 + 1 + 5 = 11 days).
 */
export function calculate11DayWindow(eventDateStr: string): { startDate: Date; endDate: Date; totalDays: number } {
  const [y, m, d] = eventDateStr.split("-").map(Number);
  
  // Start date: 5 days before, 00:00:00 local time
  const startDate = new Date(y, m - 1, d - 5, 0, 0, 0, 0);
  
  // End date: 5 days after, 23:59:59.999 local time
  const endDate = new Date(y, m - 1, d + 5, 23, 59, 59, 999);
  
  return {
    startDate,
    endDate,
    totalDays: 11,
  };
}

/**
 * Fetches Indian cultural festival dates for a given year & optional month from the internet,
 * enriched with authoritative cultural panchang fallbacks.
 */
export async function fetchInternetFestivalDates(
  year: number = new Date().getFullYear(),
  month?: number // 1 - 12 (optional filter)
): Promise<FestivalCalendarEvent[]> {
  const datesFound: Partial<Record<SeasonalThemeKey, { date: string; source: "internet_api" | "verified_calendar" }>> = {};

  // 1. Attempt internet fetch from open national holidays endpoint
  try {
    const urls = [
      `https://cdn.jsdelivr.net/gh/ganeshsp1/hindu-festivals-api/data/${year}/national.json`,
      `https://cdn.jsdelivr.net/gh/ganeshsp1/hindu-festivals-api/data/latest.json`,
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const raw = await res.json();
          const items = Array.isArray(raw) ? raw : (raw?.national || []);

          for (const item of items) {
            const name = (item.name || "").toLowerCase();
            const dateStr = item.date;
            if (!dateStr || !dateStr.startsWith(String(year))) continue;

            if (!datesFound.diwali && (name.includes("diwali") || name.includes("deepavali"))) {
              datesFound.diwali = { date: dateStr, source: "internet_api" };
            }
            if (!datesFound.holi && name.includes("holi") && !name.includes("holika")) {
              datesFound.holi = { date: dateStr, source: "internet_api" };
            }
            if (!datesFound.eid && (name.includes("eid- ul- fitr") || name.includes("eid-ul-fitr") || name.includes("id-ul-fitr"))) {
              datesFound.eid = { date: dateStr, source: "internet_api" };
            }
            if (!datesFound.christmas && name.includes("christmas")) {
              datesFound.christmas = { date: dateStr, source: "internet_api" };
            }
            if (!datesFound.lohri && name.includes("lohri")) {
              datesFound.lohri = { date: dateStr, source: "internet_api" };
            }
            if (!datesFound.baisakhi && (name.includes("baisakhi") || name.includes("vaisakhi"))) {
              datesFound.baisakhi = { date: dateStr, source: "internet_api" };
            }
          }
          if (Object.keys(datesFound).length >= 3) break;
        }
      } catch {
        // Continue to fallback
      }
    }
  } catch (err) {
    console.warn("Internet calendar fetch error, using verified multi-year calendar:", err);
  }

  // 2. Supplement any missing festivals with verified multi-year calendar
  const fallbackYear = MULTI_YEAR_CALENDAR[year] || {
    lohri: `${year}-01-13`,
    baisakhi: `${year}-04-14`,
    christmas: `${year}-12-25`,
  };

  const themes: SeasonalThemeKey[] = ["diwali", "holi", "eid", "lohri", "baisakhi", "christmas"];

  for (const theme of themes) {
    if (!datesFound[theme] && fallbackYear[theme]) {
      datesFound[theme] = {
        date: fallbackYear[theme]!,
        source: "verified_calendar",
      };
    }
  }

  // 3. Assemble complete 11-day active window events
  const events: FestivalCalendarEvent[] = [];

  for (const theme of themes) {
    const entry = datesFound[theme];
    if (!entry) continue;

    const [y, m] = entry.date.split("-").map(Number);
    // If filtering by specific month (1-12), skip if doesn't match
    if (month && m !== month) {
      continue;
    }

    const canonical = SEASONAL_ATMOSPHERES[theme];
    const { startDate, endDate } = calculate11DayWindow(entry.date);

    events.push({
      theme,
      name: canonical.label,
      eventDate: entry.date,
      startDate,
      endDate,
      source: entry.source,
      description: `${canonical.label} — 11-day festive atmosphere active from 5 days prior through 5 days post-festival.`,
    });
  }

  return events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

/**
 * Synchronizes the 11-day festival schedules directly into the database.
 * Sets autoActivate=true and autoDisable=true so each festival automatically triggers
 * 5 days before, stays active for 11 days in total, and cleanly reverts to normal ("default") afterward.
 */
export async function syncFestivalCalendarToDatabase(
  year: number = new Date().getFullYear(),
  month?: number
) {
  try {
    const events = await fetchInternetFestivalDates(year, month);
    const updated: any[] = [];

    for (const evt of events) {
      const canonical = SEASONAL_ATMOSPHERES[evt.theme];
      const animationType =
        canonical.particleType === "diyas" ? "floating-diyas" :
        canonical.particleType === "colors" ? "gulal-powder" :
        canonical.particleType === "crescent" ? "crescent-lanterns" :
        canonical.particleType === "snow" ? "snowfall" :
        canonical.particleType === "fire" ? "bonfire-embers" :
        canonical.particleType === "harvest" ? "wheat-chaff" : "floating-diyas";

      const dataPayload = {
        name: evt.name,
        theme: evt.theme,
        startDate: evt.startDate,
        endDate: evt.endDate,
        autoActivate: true,
        autoDisable: true,
        status: "SCHEDULED",
        accentColor: canonical.accentColor,
        badgeText: canonical.badgeText,
        animation: animationType,
        effectIntensity: "BALANCED",
        announcement: `${canonical.badgeText} — Handcrafted Boutique Consultation & In-Store Showroom`,
        announcementActive: true,
        offerHeading: `${canonical.label} Boutique Celebration`,
        offerDescription: `Special 11-day festive showcase (5 days prior to ${evt.eventDate} through 5 days post-celebration). Visit our atelier for bespoke jutti fittings.`,
        ctaText: "Explore Festive Showcase",
      };

      const existing = await prisma.festival.findFirst({
        where: { theme: evt.theme },
      });

      let record;
      if (existing) {
        record = await prisma.festival.update({
          where: { id: existing.id },
          data: {
            ...dataPayload,
            // Preserve custom hero banner / media asset if already configured by admin
            heroBanner: existing.heroBanner || undefined,
            mediaAssetId: existing.mediaAssetId || undefined,
          },
        });
      } else {
        record = await prisma.festival.create({
          data: dataPayload,
        });
      }
      updated.push({ ...record, eventDate: evt.eventDate, source: evt.source });
    }

    return { success: true, count: updated.length, synced: updated };
  } catch (error: any) {
    console.error("Error syncing festival calendar to database:", error);
    return { success: false, error: error.message || "Failed to sync festival calendar" };
  }
}

/**
 * Checks if the current calendar date/week falls within any festival's 11-day active window.
 * Returns the active theme if within the 11 days (5 days before to 5 days after), or null if normal.
 */
export async function getCalendarFestivalForDate(date: Date = new Date()): Promise<FestivalCalendarEvent | null> {
  const year = date.getFullYear();
  const events = await fetchInternetFestivalDates(year);

  for (const evt of events) {
    if (date >= evt.startDate && date <= evt.endDate) {
      return evt;
    }
  }

  // Also check adjacent year boundary (e.g. Lohri in early January checking previous or next year)
  if (date.getMonth() === 0) { // January
    const prevEvents = await fetchInternetFestivalDates(year - 1);
    for (const evt of prevEvents) {
      if (date >= evt.startDate && date <= evt.endDate) return evt;
    }
  } else if (date.getMonth() === 11) { // December
    const nextEvents = await fetchInternetFestivalDates(year + 1);
    for (const evt of nextEvents) {
      if (date >= evt.startDate && date <= evt.endDate) return evt;
    }
  }

  return null;
}

