import { prisma } from "@/lib/prisma";
import { StorefrontSection, DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_PAGE_CONFIGS } from "@/lib/storefrontConfigTypes";

export type { StorefrontSection };
export { DEFAULT_HOMEPAGE_SECTIONS, DEFAULT_PAGE_CONFIGS };

export async function getPublishedStorefrontConfig(page: string): Promise<StorefrontSection[]> {
  try {
    const published = await prisma.storefrontConfig.findUnique({
      where: { page_status: { page, status: "PUBLISHED" } }
    });

    if (published?.sections) {
      return JSON.parse(published.sections);
    }
  } catch (error) {
    console.error(`Error resolving published config for page ${page}:`, error);
  }

  return DEFAULT_PAGE_CONFIGS[page] || DEFAULT_HOMEPAGE_SECTIONS;
}

export async function getDraftStorefrontConfig(page: string): Promise<{ sections: StorefrontSection[]; publishedAt?: Date | null; lastEditedBy?: string | null; version?: number }> {
  try {
    const draft = await prisma.storefrontConfig.findUnique({
      where: { page_status: { page, status: "DRAFT" } },
      include: { lastEditedBy: { select: { name: true } } }
    });

    if (draft?.sections) {
      return {
        sections: JSON.parse(draft.sections),
        publishedAt: draft.publishedAt,
        lastEditedBy: draft.lastEditedBy?.name || null,
        version: draft.version
      };
    }
  } catch (error) {
    console.error(`Error resolving draft config for page ${page}:`, error);
  }

  const defaults = DEFAULT_PAGE_CONFIGS[page] || DEFAULT_HOMEPAGE_SECTIONS;
  return { sections: defaults, publishedAt: null, lastEditedBy: null, version: 1 };
}

export async function saveDraftStorefrontConfig(page: string, sections: StorefrontSection[], adminId?: string) {
  const sectionsJson = JSON.stringify(sections);

  const draft = await prisma.storefrontConfig.upsert({
    where: { page_status: { page, status: "DRAFT" } },
    update: {
      sections: sectionsJson,
      lastEditedById: adminId || null,
      updatedAt: new Date()
    },
    create: {
      page,
      status: "DRAFT",
      sections: sectionsJson,
      lastEditedById: adminId || null
    }
  });

  return draft;
}

export async function publishStorefrontConfig(page: string, adminId?: string, changelogNote?: string) {
  const draft = await prisma.storefrontConfig.findUnique({
    where: { page_status: { page, status: "DRAFT" } }
  });

  const sectionsToPublish = draft?.sections || JSON.stringify(DEFAULT_PAGE_CONFIGS[page] || DEFAULT_HOMEPAGE_SECTIONS);
  const now = new Date();

  // Atomically upsert PUBLISHED version
  const published = await prisma.storefrontConfig.upsert({
    where: { page_status: { page, status: "PUBLISHED" } },
    update: {
      sections: sectionsToPublish,
      publishedAt: now,
      lastEditedById: adminId || null,
      version: { increment: 1 }
    },
    create: {
      page,
      status: "PUBLISHED",
      sections: sectionsToPublish,
      publishedAt: now,
      lastEditedById: adminId || null,
      version: 1
    }
  });

  // Archive historical snapshot for one-click rollback
  await prisma.storefrontConfigHistory.create({
    data: {
      page,
      version: published.version,
      sections: sectionsToPublish,
      publishedById: adminId || null,
      publishedAt: now,
      changelogNote: changelogNote || `Promoted to live version v${published.version}`
    }
  }).catch((err) => console.error("Error archiving config history snapshot:", err));

  return published;
}

export async function getStorefrontVersionHistory(page: string) {
  try {
    return await prisma.storefrontConfigHistory.findMany({
      where: { page },
      orderBy: { version: "desc" },
      include: {
        publishedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      take: 30
    });
  } catch (error) {
    console.error("Error retrieving storefront version history:", error);
    return [];
  }
}

export async function rollbackStorefrontVersion(page: string, targetVersion: number, adminId?: string) {
  const snapshot = await prisma.storefrontConfigHistory.findFirst({
    where: { page, version: targetVersion }
  });

  if (!snapshot) {
    throw new Error(`Snapshot for version v${targetVersion} of page '${page}' not found.`);
  }

  const now = new Date();

  // Atomically promote snapshot to current live version
  const restored = await prisma.storefrontConfig.upsert({
    where: { page_status: { page, status: "PUBLISHED" } },
    update: {
      sections: snapshot.sections,
      publishedAt: now,
      lastEditedById: adminId || null,
      version: { increment: 1 }
    },
    create: {
      page,
      status: "PUBLISHED",
      sections: snapshot.sections,
      publishedAt: now,
      lastEditedById: adminId || null,
      version: 1
    }
  });

  // Sync draft sandbox to restored version
  await prisma.storefrontConfig.upsert({
    where: { page_status: { page, status: "DRAFT" } },
    update: {
      sections: snapshot.sections,
      lastEditedById: adminId || null,
      updatedAt: now
    },
    create: {
      page,
      status: "DRAFT",
      sections: snapshot.sections,
      lastEditedById: adminId || null
    }
  });

  // Archive new history snapshot representing the rollback
  await prisma.storefrontConfigHistory.create({
    data: {
      page,
      version: restored.version,
      sections: snapshot.sections,
      publishedById: adminId || null,
      publishedAt: now,
      changelogNote: `Rollback to historic snapshot v${targetVersion}`
    }
  });

  return restored;
}
