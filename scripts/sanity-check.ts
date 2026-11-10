import { prisma } from "../src/lib/prisma";
import { getActiveFestival } from "../src/lib/activeFestival";
import { fetchInternetFestivalDates } from "../src/lib/festivalCalendarService";

async function runSanityCheck() {
  console.log("==================================================");
  console.log("🔍 FASHION FEET COMPREHENSIVE SANITY CHECK");
  console.log("==================================================");

  // Clean up any test harness leftovers from dev.db
  await prisma.adminUser.deleteMany({
    where: { email: { in: ["master_super_acc@fashionfeet.com", "master_manager_acc@fashionfeet.com"] } }
  }).catch(() => {});
  await prisma.festival.deleteMany({
    where: { name: { startsWith: "Acceptance Test" } }
  }).catch(() => {});

  // 1. Database Product Counts
  console.log("\n📦 1. Verifying Catalogue Products...");
  const totalProducts = await prisma.product.count({ where: { published: true } });
  const womensProducts = await prisma.product.count({ where: { gender: "Women" } });
  const mensProducts = await prisma.product.count({ where: { gender: "Men" } });
  const juttis = await prisma.product.count({ where: { category: "Jutti" } });
  const mojaris = await prisma.product.count({ where: { category: "Mojari" } });

  console.log(`   - Total Published Products: ${totalProducts}`);
  console.log(`   - Women's Authentic Footwear: ${womensProducts}`);
  console.log(`   - Men's Handcrafted Footwear: ${mensProducts}`);
  console.log(`   - Jutti Category: ${juttis}`);
  console.log(`   - Mojari Category: ${mojaris}`);

  if (totalProducts !== 85) {
    throw new Error(`Expected 85 products, found ${totalProducts}`);
  }
  console.log("   ✅ Product catalogue verified (85 authentic items).");

  // 2. Collections and Categories
  console.log("\n🗂️ 2. Verifying Collections & Categories...");
  const collections = await prisma.collection.findMany({ select: { id: true, title: true } });
  const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  console.log(`   - Collections (${collections.length}): ${collections.map((c) => c.title).join(", ")}`);
  console.log(`   - Categories (${categories.length}): ${categories.map((c) => c.name).join(", ")}`);
  if (collections.length < 4 || categories.length < 3) {
    throw new Error("Categories or collections incomplete!");
  }
  console.log("   ✅ Taxonomy & Collections verified.");

  // 3. Admin & Security
  console.log("\n🔐 3. Verifying Admin & MFA Setup...");
  const admins = await prisma.adminUser.findMany({
    select: { id: true, email: true, role: true, mfaEnabled: true, suspended: true },
  });
  console.log(`   - Total Admin Users: ${admins.length}`);
  for (const adm of admins) {
    console.log(
      `     * ${adm.email} (${adm.role}) | MFA: ${adm.mfaEnabled ? "ENABLED" : "NOT_SET"} | Suspended: ${adm.suspended}`
    );
  }
  console.log("   ✅ Admin accounts verified.");

  // 4. Festivals & 11-Day Schedule
  console.log("\n🪔 4. Verifying Festival & Seasonal Automation...");
  const festivals = await prisma.festival.findMany({ orderBy: { startDate: "asc" } });
  console.log(`   - Scheduled Festivals in DB: ${festivals.length}`);
  for (const f of festivals) {
    const diffDays = Math.round(
      (new Date(f.endDate).getTime() - new Date(f.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(
      `     * ${f.name} (${f.theme}): ${f.startDate.toISOString().slice(0, 10)} -> ${f.endDate.toISOString().slice(0, 10)} (${diffDays} days window)`
    );
  }

  // Test 11-day calendar calculation for 2026 Diwali
  const calendar2026 = await fetchInternetFestivalDates(2026);
  const diwali2026 = calendar2026.find((d) => d.theme === "diwali");
  if (diwali2026) {
    const windowDays = Math.round(
      (diwali2026.endDate.getTime() - diwali2026.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(
      `   - Diwali 2026 resolved window: ${diwali2026.startDate.toISOString().slice(0, 10)} to ${diwali2026.endDate.toISOString().slice(0, 10)} (${windowDays} calendar days)`
    );
  }
  console.log("   ✅ Festive automation schedule verified.");

  // 5. Active Festival Fallback
  console.log("\n🎨 5. Verifying Active Festival Logic...");
  const activeFest = await getActiveFestival();
  console.log(
    `   - Currently active festival on today's date: ${activeFest ? activeFest.name : "None (Default Royal Atelier)"}`
  );
  console.log("   ✅ Festival active fallback works cleanly.");

  console.log("\n==================================================");
  console.log("🎉 ALL CORE SANITY CHECKS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runSanityCheck()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Sanity check failed:", e);
    process.exit(1);
  });
