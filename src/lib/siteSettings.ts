import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSiteSettingsMap() {
  try {
    const settingsMap: Record<string, string> = {};

    if ((prisma as any).siteSetting) {
      const settings = await (prisma as any).siteSetting.findMany().catch(() => []);
      settings.forEach((s: any) => {
        settingsMap[s.key] = s.value;
      });
    }

    const companyContents = await prisma.companyContent.findMany({ where: { status: "PUBLISHED" } }).catch(() => []);
    companyContents.forEach((c: any) => {
      if (!settingsMap[c.key]) settingsMap[c.key] = c.content;
    });

    return settingsMap;
  } catch {
    return {};
  }
}
