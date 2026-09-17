import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/password';

async function main() {
  console.log("🌱 Starting Fashion Feet database seeding...");

  // 1. Seed or update Super Admin user in AdminUser table
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@fashionfeet.local').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || 'FashionFeet@2026').trim();
  const adminPasswordHash = await hashPassword(adminPassword);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      passwordHash: adminPasswordHash,
      suspended: false,
    },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      suspended: false,
    },
  });
  console.log(`✅ AdminUser seeded: ${admin.email} (${admin.role}) with Argon2id hash.`);

  // 2. Demo customer account
  //
  // INTENTIONALLY NOT SEEDED. This block used to create a fake customer
  // (customer@fashionfeet.local / "Simran Kaur") with a known password. A
  // fabricated person with a published default credential is not test data worth
  // keeping: it appeared in the customer table and in every database backup.
  // Real customer accounts are created through the normal sign-up flow.
  console.log("ℹ️  No demo customer account is seeded (removed as fabricated test data).");

  // 3. Physical boutique store locations
  //
  // INTENTIONALLY EMPTY. This block used to seed three FABRICATED placeholder stores:
  // invented street addresses, phone numbers in real national formats, and
  // @fashionfeet.com mailboxes that are not ours. They were not inert data — the
  // public /stores page lists every store whose status is "OPEN", and the
  // unauthenticated GET /api/v1/stores served them too, so the site was publishing
  // fabricated contact details for a business with no published premises.
  //
  // They were DELETED rather than renamed or hidden behind a DRAFT status, because
  // this project's standing rule is no invented content and a draft would still ship
  // the fabrication in the repository. Do not re-add placeholder stores here: real
  // locations go in through the admin console, or get captured first with
  // intake/stores-template.md.
  //
  // An empty Store table is a valid, correctly-handled state — /stores renders its
  // "Stores Coming Soon" panel and the API returns an empty array.
  //
  // The removed records remain recoverable from git history (see commit b2c2f79).
  const stores: Array<{
    code: string;
    name: string;
    type: string;
    status: string;
    city: string;
    state: string;
    street: string;
    pinCode: string;
    phone: string;
    email: string;
    openingHours: string;
    description: string;
    displayOrder: number;
  }> = [];

  for (const s of stores) {
    await prisma.store.upsert({
      where: { code: s.code },
      update: s,
      create: s
    });
  }
  console.log(`✅ ${stores.length} physical boutique stores seeded.`);

  // 4. Seed Canonical 7 Festive Atmospheres
  const festivals = [
    {
      theme: "diwali",
      name: "Diwali Festival of Lights",
      startDate: new Date("2026-10-25T00:00:00Z"),
      endDate: new Date("2026-11-10T23:59:59Z"),
      accentColor: "#D4AF37",
      animation: "floating-diyas",
      effectIntensity: "BALANCED",
      badgeText: "Festival of Lights",
      offerHeading: "Diwali Festive Atelier Showcase",
      offerDescription: "Complimentary custom gold-monogram embroidery on all bridal & festive pairs.",
      announcement: "✨ Diwali Celebration Showcase Now Live",
      ctaText: "Explore Festive Collection"
    },
    {
      theme: "lohri",
      name: "Lohri Bonfire Festivities",
      startDate: new Date("2027-01-05T00:00:00Z"),
      endDate: new Date("2027-01-16T23:59:59Z"),
      accentColor: "#FF8C00",
      animation: "golden-sparks",
      effectIntensity: "BALANCED",
      badgeText: "Lohri Warmth",
      offerHeading: "Lohri Bonfire Collection",
      offerDescription: "Hand-stitched velvet juttis for winter celebrations.",
      announcement: "🔥 Lohri Festive Collection Now Available in Atelier",
      ctaText: "Explore Lohri Mojaris"
    },
    {
      theme: "baisakhi",
      name: "Baisakhi Harvest Splendor",
      startDate: new Date("2027-04-05T00:00:00Z"),
      endDate: new Date("2027-04-18T23:59:59Z"),
      accentColor: "#E5A910",
      animation: "harvest-petals",
      effectIntensity: "BALANCED",
      badgeText: "Baisakhi Splendor",
      offerHeading: "Baisakhi Harvest Collection",
      offerDescription: "Bright mustard silk and traditional phulkari threadwork juttis.",
      announcement: "🌾 Celebrate Baisakhi with Handcrafted Heritage Footwear",
      ctaText: "Explore Baisakhi Juttis"
    }
  ];

  for (const f of festivals) {
    const existing = await prisma.festival.findFirst({ where: { theme: f.theme } });
    if (!existing) {
      await prisma.festival.create({
        data: {
          ...f,
          enabled: false,
          status: "DRAFT",
          autoActivate: true,
          autoDisable: true
        }
      });
    }
  }
  console.log("✅ Canonical seasonal festivals initialized.");

  // 5. Product catalogue
  //
  // INTENTIONALLY EMPTY. This block used to seed a fabricated catalogue: six
  // invented products with made-up names, SKUs, prices and material descriptions
  // ("Royal Crimson Zari Jutti", "Midnight Velvet Mojari", "Golden Sunrise Bridal
  // Jutti", "Classic Noir Leather Jutti", "Pearl Embellished Bridal Mojari",
  // "Festive Sparkle Silver Jutti"), illustrated with unrelated stock Unsplash
  // photography. Those rows were published to the storefront, the sitemap and the
  // public GET /api/v1/products, and they described goods that do not exist at
  // those prices in those materials.
  //
  // They were REMOVED rather than replaced with a different invented set, because
  // this project's standing rule is no invented content. Real products need real
  // photography, real SKUs and real prices and belong in the admin console.
  //
  // An empty catalogue is a valid, correctly-handled state: /shop and the product
  // API return empty results and the homepage omits its product rows. The removed
  // records remain recoverable from git history (see commit b2c2f79).
  const products: Array<{
    title: string;
    sku: string;
    price: number;
    discount: number;
    description: string;
    category: string;
    gender: string;
    featured: boolean;
    imageUrl: string;
  }> = [];

  for (const p of products) {
    await prisma.product.create({
      data: {
        title: p.title,
        sku: p.sku,
        price: p.price,
        discount: p.discount,
        description: p.description,
        category: p.category,
        gender: p.gender,
        featured: p.featured,
        published: true,
        status: "PUBLISHED",
        images: {
          create: [{ url: p.imageUrl }]
        }
      }
    });
  }
  console.log(`ℹ️  ${products.length} products seeded (catalogue intentionally empty).`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
