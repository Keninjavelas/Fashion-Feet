import { prisma } from "../src/lib/prisma";
import { findCatalogue } from "../src/lib/catalogues";
import menWhatsappPhotos from "../src/data/men-whatsapp-gallery.json";

interface RawProductInput {
  title: string;
  sku: string;
  category: "Jutti" | "Mojari" | "Sandals";
  gender: "Women" | "Men";
  catalogueSlug: string; // "daily-wear", "festive", "ceremonial", "rajwadi", "functional", "office-wear"
  price: number;
  promoPrice?: number;
  discount?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFestivalExclusive?: boolean;
  imageUrl: string;
  description: string;
  craftsmanship?: string;
}

export async function populateAllCatalogueProducts() {
  console.log("🚀 Starting catalogue product population...");

  // 1. Ensure core categories exist
  const categoriesToEnsure = [
    { name: "Jutti", slug: "jutti", displayOrder: 1 },
    { name: "Mojari", slug: "mojari", displayOrder: 2 },
    { name: "Sandals", slug: "sandals", displayOrder: 3 },
  ];

  for (const cat of categoriesToEnsure) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, active: true },
      create: { name: cat.name, slug: cat.slug, active: true, displayOrder: cat.displayOrder },
    });
  }

  // 2. Ensure core collections exist
  const collectionsToEnsure = [
    {
      title: "Royal Ceremonial Atelier",
      description: "Exquisite hand-zari & mirrorwork Punjabi juttis crafted for weddings and auspicious occasions.",
      displayOrder: 1,
    },
    {
      title: "Festive Sparkle Edition",
      description: "Vibrant phulkari, beaded medallions, and resham threads celebrating cultural festivities.",
      displayOrder: 2,
    },
    {
      title: "Everyday Heritage Luxury",
      description: "Supple genuine leather and breathable handcrafted comfort for daily elegance.",
      displayOrder: 3,
    },
    {
      title: "Executive & Hand-Woven Men's Mojaris",
      description: "Sophisticated braided leather, subtle embossing, and tailored silhouettes for the modern gentleman.",
      displayOrder: 4,
    },
  ];

  const dbCollections: Record<string, string> = {};
  for (const col of collectionsToEnsure) {
    const existing = await prisma.collection.findFirst({ where: { title: col.title } });
    if (existing) {
      dbCollections[col.title] = existing.id;
    } else {
      const created = await prisma.collection.create({
        data: {
          title: col.title,
          description: col.description,
          displayOrder: col.displayOrder,
          status: "PUBLISHED",
          visible: true,
        },
      });
      dbCollections[col.title] = created.id;
    }
  }

  // 3. Assemble all Women's Designs
  const products: RawProductInput[] = [];

  // 3a. Women Daily Wear (7 designs)
  const womenDailyWear = [
    { num: 1, name: "Chestnut Lattice", price: 1499 },
    { num: 2, name: "Copper Sunray", price: 1599 },
    { num: 3, name: "Sienna Bloom", price: 1499 },
    { num: 4, name: "Russet Rays", price: 1599 },
    { num: 5, name: "Cinnamon Floral", price: 1499 },
    { num: 6, name: "Amber Mosaic", price: 1699 },
    { num: 7, name: "Golden Meadow", price: 1599 },
  ];
  for (const item of womenDailyWear) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Punjabi Jutti`,
      sku: `FF-W-DW-${pNum}`,
      category: "Jutti",
      gender: "Women",
      catalogueSlug: "daily-wear",
      price: item.price,
      featured: item.num === 1 || item.num === 7,
      isNewArrival: item.num <= 3,
      isBestSeller: item.num === 1,
      imageUrl: `/catalogue/women/studio/daily-wear/${pNum}.png`,
      description: `The ${item.name} jutti combines rich warm tones with artisanal needlework. Built with a genuine double-cushioned leather sole for effortless all-day comfort.`,
      craftsmanship: "Pure leather sole with hand-stitched lattice embroidery and pinch-free curved heel support.",
    });
  }

  // 3b. Women Festive (8 designs)
  const womenFestive = [
    { num: 1, name: "Rose Lattice", price: 2199 },
    { num: 2, name: "Rainbow Medallion", price: 2499 },
    { num: 3, name: "Carnival Geometry", price: 2399 },
    { num: 4, name: "Fuchsia Sparkle", price: 2599 },
    { num: 5, name: "Spring Blossoms", price: 2299 },
    { num: 6, name: "Crimson Eclipse", price: 2499 },
    { num: 8, name: "Festival Threads", price: 2399 },
    { num: 9, name: "Fuchsia Mosaic", price: 2699 },
  ];
  for (const item of womenFestive) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Festive Jutti`,
      sku: `FF-W-FEST-${pNum}`,
      category: "Jutti",
      gender: "Women",
      catalogueSlug: "festive",
      price: item.price,
      discount: item.num === 4 ? 10 : 0,
      featured: item.num === 2 || item.num === 4,
      isNewArrival: true,
      isBestSeller: item.num === 2,
      isFestivalExclusive: true,
      imageUrl: `/catalogue/women/studio/festive-v2/${pNum}.png`,
      description: `Celebratory elegance defined by shimmering sequins and resham threadwork. The ${item.name} is designed to complement lehengas, shararas, and festive Punjabi suits.`,
      craftsmanship: "Intricate hand-beaded medallions on velvet base with vegetable-tanned leather sole.",
    });
  }

  // 3c. Women Ceremonial (5 designs)
  const womenCeremonial = [
    { num: 1, name: "Rose Lattice Bridal", folder: "ceremonial-v3", price: 2999 },
    { num: 2, name: "Gilded Rays", folder: "ceremonial-v2", price: 3299 },
    { num: 3, name: "Midnight Spark", folder: "ceremonial-v2", price: 3199 },
    { num: 4, name: "Blush Filigree", folder: "ceremonial-v2", price: 3499 },
    { num: 5, name: "Golden Constellation", folder: "ceremonial-v3", price: 3399 },
  ];
  for (const item of womenCeremonial) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Royal Jutti`,
      sku: `FF-W-CER-${pNum}`,
      category: "Jutti",
      gender: "Women",
      catalogueSlug: "ceremonial",
      price: item.price,
      featured: item.num === 2 || item.num === 4,
      isNewArrival: false,
      isBestSeller: item.num === 4,
      isFestivalExclusive: true,
      imageUrl: `/catalogue/women/studio/${item.folder}/${pNum}.png`,
      description: `Curated for bridal and ceremonial splendor. The ${item.name} features heavy gold dabka, pearls, and zari needlework perfected by multi-generational Punjabi artisans.`,
      craftsmanship: "Authentic 24k gold-finish tilla embroidery with memory foam insole and treated leather sole.",
    });
  }

  // 3d. Women Rajwadi (7 designs)
  const womenRajwadi = [
    { num: 1, name: "Sunflower Beads", price: 1899 },
    { num: 2, name: "Marigold Medallions", price: 2199 },
    { num: 3, name: "Carved Floral Duo", price: 2299 },
    { num: 4, name: "Silver Ribbon", price: 1999 },
    { num: 5, name: "Colourful Medallions", price: 2199 },
    { num: 6, name: "Shell Blossoms", price: 2399 },
    { num: 7, name: "Bright Mosaic", price: 2099 },
  ];
  for (const item of womenRajwadi) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Rajwadi Sandal`,
      sku: `FF-W-RAJ-${pNum}`,
      category: "Sandals",
      gender: "Women",
      catalogueSlug: "rajwadi",
      price: item.price,
      featured: item.num === 2 || item.num === 6,
      isNewArrival: true,
      imageUrl: `/catalogue/women/studio/rajwadi/${pNum}.png`,
      description: `Authentic handcrafted Rajwadi toe-loop sandal adorned with decorative beadwork and floral medallions. Pairs naturally with ethnic and fusion ensembles.`,
      craftsmanship: "Hand-embossed toe-loop structure with padded leather footbed and durable stitching.",
    });
  }

  // 4. Assemble all Men's Designs

  // 4a. Men Functional Studio (5 designs)
  const menFunctional = [
    { num: 1, name: "Midnight Vine", price: 1799 },
    { num: 2, name: "Crimson Roses", price: 1899 },
    { num: 3, name: "Navy Starflower", price: 1799 },
    { num: 4, name: "Emerald Leaves", price: 1899 },
    { num: 5, name: "Midnight Pearls", price: 1999 },
  ];
  for (const item of menFunctional) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Men's Jutti`,
      sku: `FF-M-FUNC-${pNum}`,
      category: "Jutti",
      gender: "Men",
      catalogueSlug: "functional",
      price: item.price,
      featured: item.num === 1 || item.num === 5,
      isNewArrival: true,
      isBestSeller: item.num === 1,
      imageUrl: `/catalogue/men/studio/functional/${pNum}.png`,
      description: `Striking embroidered men's jutti with traditional thread motifs on dark velvet uppers. Crafted for celebratory gatherings, sangeets, and festivals.`,
      craftsmanship: "Authentic pointed-toe silhouette with cushioned heel tab and reinforced pure leather sole.",
    });
  }

  // 4b. Men Office Wear Studio (3 designs)
  const menOfficeWear = [
    { num: 1, name: "Midnight Weave", price: 2199 },
    { num: 2, name: "Chestnut Braid", price: 2299 },
    { num: 3, name: "Tan Floral Emboss", price: 2399 },
  ];
  for (const item of menOfficeWear) {
    const pNum = String(item.num).padStart(2, "0");
    products.push({
      title: `${item.name} Executive Mojari`,
      sku: `FF-M-OFF-${pNum}`,
      category: "Mojari",
      gender: "Men",
      catalogueSlug: "office-wear",
      price: item.price,
      featured: true,
      isBestSeller: item.num === 2,
      imageUrl: `/catalogue/men/studio/office-wear/${pNum}.png`,
      description: `Understated sophistication with hand-woven leather detailing. Built specifically for formal occasions, weddings, and executive ethnic attire.`,
      craftsmanship: "Hand-braided premium calf leather with smooth inner lining and durable leather outsole.",
    });
  }

  // 4c. Men WhatsApp Gallery (50 designs)
  for (let i = 0; i < menWhatsappPhotos.length; i++) {
    const photo = menWhatsappPhotos[i];
    const pNum = String(i + 1).padStart(2, "0");
    const categoryName = photo.category === "daily-wear" ? "Jutti"
      : photo.category === "festive" ? "Jutti"
      : photo.category === "functional" ? "Sandals"
      : "Mojari";

    const basePrice = photo.category === "festive" ? 2499
      : photo.category === "office-wear" ? 2199
      : photo.category === "functional" ? 1899
      : 1599;

    products.push({
      title: `${photo.name} Men's ${categoryName}`,
      sku: `FF-M-WA-${pNum}`,
      category: categoryName,
      gender: "Men",
      catalogueSlug: photo.category,
      price: basePrice,
      featured: i === 3 || i === 25 || i === 34,
      isNewArrival: i < 15,
      isBestSeller: i === 3,
      imageUrl: `/catalogue/men/whatsapp-2026-11-07/${pNum}.jpeg`,
      description: `Handcrafted ${photo.name} men's footwear from our Punjab atelier. Features authentic needlework and balanced ergonomics for traditional styling.`,
      craftsmanship: "100% genuine handcrafted leather footwear designed and made in Punjab.",
    });
  }

  console.log(`📦 Prepared ${products.length} catalogue products. Committing to database...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of products) {
    const catalogue = findCatalogue(item.catalogueSlug);
    const occasion = catalogue?.name || "Daily Wear";

    // 1. Ensure MediaAsset exists so image is recognized as managed
    const existingMedia = await prisma.mediaAsset.findFirst({
      where: { url: item.imageUrl },
    });

    if (!existingMedia) {
      await prisma.mediaAsset.create({
        data: {
          name: item.title,
          filename: item.imageUrl.split("/").pop() || "product.png",
          url: item.imageUrl,
          folder: item.gender === "Women" ? "catalogue-women" : "catalogue-men",
          status: "PUBLISHED",
          altText: item.title,
        },
      });
    }

    // 2. Resolve Collection association
    let collectionId: string | null = null;
    if (item.catalogueSlug === "ceremonial") {
      collectionId = dbCollections["Royal Ceremonial Atelier"] || null;
    } else if (item.catalogueSlug === "festive") {
      collectionId = dbCollections["Festive Sparkle Edition"] || null;
    } else if (item.catalogueSlug === "office-wear") {
      collectionId = dbCollections["Executive & Hand-Woven Men's Mojaris"] || null;
    } else {
      collectionId = dbCollections["Everyday Heritage Luxury"] || null;
    }

    // 3. Upsert Product by SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku: item.sku },
      include: { images: true },
    });

    const sizesStr = item.gender === "Women" ? "36, 37, 38, 39, 40, 41" : "7, 8, 9, 10, 11, 12";

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          title: item.title,
          price: item.price,
          discount: item.discount || 0,
          description: item.description,
          craftsmanship: item.craftsmanship,
          category: item.category,
          gender: item.gender,
          occasion,
          sizes: sizesStr,
          material: "Genuine Hand-Tanned Leather, Silk & Velvet",
          care: "Wipe gently with a soft dry cloth. Store with paper stuffing in a dry, ventilated box.",
          sizeGuide: "True to traditional Indian sizing. If between sizes, choose one size up for initial break-in comfort.",
          collectionId,
          featured: item.featured ?? false,
          isNewArrival: item.isNewArrival ?? false,
          isBestSeller: item.isBestSeller ?? false,
          isFestivalExclusive: item.isFestivalExclusive ?? false,
          published: true,
          status: "PUBLISHED",
          archived: false,
          hidden: false,
        },
      });

      // Ensure primary image exists
      const hasImage = existingProduct.images.some((img) => img.url === item.imageUrl);
      if (!hasImage) {
        await prisma.productImage.create({
          data: {
            productId: existingProduct.id,
            url: item.imageUrl,
          },
        });
      }
      updatedCount++;
    } else {
      await prisma.product.create({
        data: {
          title: item.title,
          sku: item.sku,
          price: item.price,
          discount: item.discount || 0,
          description: item.description,
          craftsmanship: item.craftsmanship,
          category: item.category,
          gender: item.gender,
          occasion,
          sizes: sizesStr,
          material: "Genuine Hand-Tanned Leather, Silk & Velvet",
          care: "Wipe gently with a soft dry cloth. Store with paper stuffing in a dry, ventilated box.",
          sizeGuide: "True to traditional Indian sizing. If between sizes, choose one size up for initial break-in comfort.",
          collectionId,
          featured: item.featured ?? false,
          isNewArrival: item.isNewArrival ?? false,
          isBestSeller: item.isBestSeller ?? false,
          isFestivalExclusive: item.isFestivalExclusive ?? false,
          published: true,
          status: "PUBLISHED",
          archived: false,
          hidden: false,
          images: {
            create: [{ url: item.imageUrl }],
          },
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Finished catalogue population: ${createdCount} created, ${updatedCount} updated.`);
  return { total: products.length, created: createdCount, updated: updatedCount };
}

if (require.main === module) {
  populateAllCatalogueProducts()
    .then((res) => {
      console.log("Result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to populate catalogue products:", err);
      process.exit(1);
    });
}

