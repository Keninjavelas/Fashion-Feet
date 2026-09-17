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

  // 2. Seed demo customer user
  const customerPasswordHash = await hashPassword('Customer@2026');
  await prisma.user.upsert({
    where: { email: 'customer@fashionfeet.local' },
    update: {
      name: 'Simran Kaur',
      password: customerPasswordHash,
      active: true,
    },
    create: {
      email: 'customer@fashionfeet.local',
      name: 'Simran Kaur',
      password: customerPasswordHash,
      role: 'CUSTOMER',
      active: true,
    },
  });
  console.log("✅ Customer User seeded: customer@fashionfeet.local (Argon2id).");

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
      announcement: "✨ Diwali Celebration Showcase Open in Boutique Salons",
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
      offerDescription: "Authentic double-cushioned velvet juttis for winter celebrations.",
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

  // 5. Check if products exist, otherwise seed authentic Juttis
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const juttiImages = [
      "https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=800&auto=format&fit=crop"
    ];

    const products = [
      {
        title: "Royal Crimson Zari Jutti",
        sku: "FF-W-WED-001",
        price: 2499,
        discount: 16.6,
        description: "Step into regal elegance with the Royal Crimson Jutti. Handcrafted by master artisans, this piece features intricate zari embroidery on premium silk velvet.",
        category: "Wedding",
        gender: "Women",
        featured: true,
        imageUrl: juttiImages[0]
      },
      {
        title: "Midnight Velvet Mojari",
        sku: "FF-M-FES-002",
        price: 3199,
        discount: 0,
        description: "A sleek, dark velvet finish with gold dabka threadwork bringing a modern touch to the traditional Punjabi silhouette.",
        category: "Festive",
        gender: "Men",
        featured: true,
        imageUrl: juttiImages[1]
      },
      {
        title: "Golden Sunrise Bridal Jutti",
        sku: "FF-W-WED-003",
        price: 2899,
        discount: 10,
        description: "Bright and vibrant gold threadwork, handcrafted for daytime wedding ceremonies and festive occasions.",
        category: "Wedding",
        gender: "Women",
        featured: true,
        imageUrl: juttiImages[2]
      },
      {
        title: "Classic Noir Leather Jutti",
        sku: "FF-M-CAS-004",
        price: 2199,
        discount: 0,
        description: "The essential black genuine leather jutti with supple chrome-free leather and double velvet arch support.",
        category: "Casual",
        gender: "Men",
        featured: true,
        imageUrl: juttiImages[3]
      },
      {
        title: "Pearl Embellished Bridal Mojari",
        sku: "FF-W-WED-005",
        price: 3499,
        discount: 0,
        description: "Intricate pearl and dabka needlework on a soft cream silk velvet base for royal Anand Karaj ceremonies.",
        category: "Wedding",
        gender: "Women",
        featured: true,
        imageUrl: juttiImages[4]
      },
      {
        title: "Festive Sparkle Silver Jutti",
        sku: "FF-W-FES-006",
        price: 2799,
        discount: 15,
        description: "Embellished with pure silver sequin work and soft velvet arch cushioning, perfect for celebrations.",
        category: "Festive",
        gender: "Women",
        featured: true,
        imageUrl: juttiImages[5]
      }
    ];

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
    console.log(`✅ ${products.length} authentic Punjabi Jutti products seeded.`);
  }

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
