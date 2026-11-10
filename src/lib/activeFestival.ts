import { prisma } from "@/lib/prisma";
import { getCalendarFestivalForDate } from "@/lib/festivalCalendarService";

/** Resolve the active campaign without changing data during a public read. */
export async function getActiveFestival() {
  try {
    const now = new Date();

    // 1. Manual Super Admin override check
    const manualActive = await prisma.festival.findFirst({
      where: { enabled: true },
      include: { mediaAsset: true },
    });

    if (manualActive && (!manualActive.autoDisable || manualActive.endDate >= now)) {
      return manualActive;
    }

    // 2. Scheduled 11-day window in database (5 days before to 5 days after event)
    const scheduledActive = await prisma.festival.findFirst({
      where: {
        status: "SCHEDULED",
        autoActivate: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "desc" },
      include: { mediaAsset: true },
    });

    if (scheduledActive) {
      return scheduledActive;
    }

    // 3. Automated calendar-week resolver: checks internet/verified calendar for current date
    const autoFestival = await getCalendarFestivalForDate(now);
    if (autoFestival) {
      const dbCampaign = await prisma.festival.findFirst({
        where: { theme: autoFestival.theme },
        include: { mediaAsset: true },
      });
      if (dbCampaign) {
        return dbCampaign;
      }
    }

    // Return null when outside any 11-day festival window (storefront renders normal default Atelier)
    return null;
  } catch (error) {
    console.error("Error resolving active festival:", error);
    return null;
  }
}
