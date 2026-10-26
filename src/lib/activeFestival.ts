import { prisma } from "@/lib/prisma";

/** Resolve the active campaign without changing data during a public read. */
export async function getActiveFestival() {
  try {
    const now = new Date();
    const manualActive = await prisma.festival.findFirst({
      where: { enabled: true },
      include: { mediaAsset: true },
    });

    if (manualActive && (!manualActive.autoDisable || manualActive.endDate >= now)) {
      return manualActive;
    }

    return await prisma.festival.findFirst({
      where: {
        status: "SCHEDULED",
        autoActivate: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: "desc" },
      include: { mediaAsset: true },
    });
  } catch (error) {
    console.error("Error resolving active festival:", error);
    return null;
  }
}
