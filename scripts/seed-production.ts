import fs from "fs";
import path from "path";

// Load .env.production.local before any Prisma imports
const envPath = path.resolve(__dirname, "../.env.production.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function runProductionSeed() {
  console.log("🌟 Seeding Production Neon PostgreSQL database...");
  const rawDatabaseUrl = process.env.DATABASE_URL;
  console.log("Database host:", rawDatabaseUrl ? new URL(rawDatabaseUrl).host : "not set");

  const { populateAllCatalogueProducts } = await import("./seed-catalogue-products");
  const { syncFestivalCalendarToDatabase } = await import("../src/lib/festivalCalendarService");
  const { prisma } = await import("../src/lib/prisma");

  // 1. Populate all 85 catalogue products
  console.log("\n📦 1. Populating 85 authentic products into Neon PostgreSQL...");
  const productResult = await populateAllCatalogueProducts();
  console.log(`✅ Products complete: ${productResult.created} created, ${productResult.updated} updated (total ${productResult.total}).`);

  // 2. Sync internet festive calendar (11-day windows)
  console.log("\n📅 2. Syncing 11-day festive calendar windows into Neon PostgreSQL...");
  const festivalResult = await syncFestivalCalendarToDatabase(2026);
  console.log(`✅ Festivals complete: ${festivalResult.count} festive themes scheduled.`);

  // 3. Final verification counts
  const [totalProducts, totalMedia, totalCollections, totalCategories, totalFestivals] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.mediaAsset.count(),
    prisma.collection.count(),
    prisma.category.count(),
    prisma.festival.count(),
  ]);

  console.log("\n🎉 PRODUCTION NEON POSTGRESQL SEED VERIFIED:");
  console.log({
    publishedProducts: totalProducts,
    mediaAssets: totalMedia,
    collections: totalCollections,
    categories: totalCategories,
    festivals: totalFestivals,
  });

  await prisma.$disconnect();
}

runProductionSeed().catch((err) => {
  console.error("❌ Production seed failed:", err);
  process.exit(1);
});

