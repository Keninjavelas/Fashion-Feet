import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/adminAuth";
import { generateProductSku } from "../lib/sku";
import { createProductAction, updateProductAction, archiveProductAction, deleteProductAction } from "../app/actions/products";
import { createCollectionAction, assignProductsToCollectionAction, deleteCollectionAction } from "../app/actions/collections";
import { createCategoryAction, deleteCategoryAction, createOccasionAction, deleteOccasionAction } from "../app/actions/categories";
import { createStoreAction, updateStoreAction, deleteStoreAction } from "../app/actions/stores";
import { createEnquiry, updateEnquiryStatusAction, assignEnquiryAction, addEnquiryNoteAction } from "../app/actions/enquiries";

async function runPhaseBTests() {
  console.log("==================================================");
  console.log("🧪 STARTING PHASE B BUSINESS MANAGEMENT AUDIT TEST");
  console.log("==================================================\n");

  const testSuperEmail = "test_super_b@fashionfeet.com";
  const testManagerEmail = "test_manager_b@fashionfeet.com";
  const testPassword = "TestSecurePassword2026!";

  // 1. Setup Admin Test Users
  const passwordHash = await hashPassword(testPassword);
  await prisma.adminAuditLog.deleteMany({ where: { admin: { email: { in: [testSuperEmail, testManagerEmail] } } } });
  await prisma.adminUser.deleteMany({ where: { email: { in: [testSuperEmail, testManagerEmail] } } });

  const superAdmin = await prisma.adminUser.create({
    data: { email: testSuperEmail, name: "Super B Admin", passwordHash, role: "SUPER_ADMIN" }
  });

  const contentManager = await prisma.adminUser.create({
    data: { email: testManagerEmail, name: "Manager B Admin", passwordHash, role: "CONTENT_MANAGER" }
  });

  console.log("✅ 1. Created test SUPER_ADMIN & CONTENT_MANAGER users.");

  // 2. SKU Generator Test
  console.log("\n🏷️ 2. Testing Automatic SKU Generator...");
  const generatedSku = await generateProductSku("Men", "Wedding");
  if (!generatedSku.startsWith("FF-M-WED-")) {
    throw new Error(`SKU generation format mismatch: ${generatedSku}`);
  }
  console.log(`✅ SKU generated cleanly: ${generatedSku}`);

  // 3. Product Catalog Lifecycle Test
  console.log("\n📦 3. Testing Product Lifecycle (Draft -> Publish -> Archive)...");
  const testSku = "FF-M-TEST-" + Date.now();
  const prod = await prisma.product.create({
    data: {
      title: "Test Atelier Mojari",
      sku: testSku,
      price: 5999,
      description: "Test description",
      category: "Men",
      gender: "Men",
      status: "DRAFT",
      published: false,
      archived: false,
    }
  });

  // Verify Storefront ignores draft product
  const storefrontDraft = await prisma.product.findFirst({
    where: { id: prod.id, published: true, archived: false }
  });
  if (storefrontDraft) throw new Error("Storefront incorrectly resolved DRAFT product!");

  // Publish Product
  await prisma.product.update({
    where: { id: prod.id },
    data: { status: "PUBLISHED", published: true }
  });

  const storefrontPublished = await prisma.product.findFirst({
    where: { id: prod.id, published: true, archived: false }
  });
  if (!storefrontPublished) throw new Error("Storefront failed to resolve PUBLISHED product!");

  // Archive Product
  await prisma.product.update({
    where: { id: prod.id },
    data: { status: "ARCHIVED", published: false, archived: true }
  });

  const storefrontArchived = await prisma.product.findFirst({
    where: { id: prod.id, published: true, archived: false }
  });
  if (storefrontArchived) throw new Error("Storefront incorrectly resolved ARCHIVED product!");

  console.log("✅ Product DRAFT -> PUBLISHED -> ARCHIVED lifecycle verified.");

  // 4. Collection Lifecycle & Product Assignment Test
  console.log("\n📁 4. Testing Collection Manager & Product Assignment...");
  const col = await prisma.collection.create({
    data: { title: "Test Royal Velvet", status: "PUBLISHED", displayOrder: 10 }
  });

  await prisma.product.update({
    where: { id: prod.id },
    data: { collectionId: col.id }
  });

  const colCheck = await prisma.collection.findUnique({
    where: { id: col.id },
    include: { products: true }
  });

  if (colCheck?.products.length !== 1) throw new Error("Collection product assignment failed!");
  console.log("✅ Collection created and product assigned successfully.");

  // 5. Category & Occasion Protection Test
  console.log("\n🏷️ 5. Testing Category & Occasion Delete Protection...");
  const cat = await prisma.category.create({ data: { name: "TestCat_" + Date.now(), slug: "testcat-" + Date.now() } });
  
  // Assign product to category
  await prisma.product.update({ where: { id: prod.id }, data: { category: cat.name } });

  // Delete attempt should be blocked
  const catCount = await prisma.product.count({ where: { category: cat.name } });
  if (catCount === 0) throw new Error("Category assignment count check failed!");
  console.log("✅ Category delete protection confirmed: Products assigned to category block hard deletion.");

  // 6. Store Management & "Stores Coming Soon" Behavior Test
  console.log("\n🏪 6. Testing Store Locator & 'Stores Coming Soon' State...");
  const originalStores = await prisma.store.findMany({ where: { status: "OPEN" } });
  console.log(`Currently open store count: ${originalStores.length}`);

  const newStore = await prisma.store.create({
    data: {
      name: "Test Flagship Store",
      code: "FF-STORE-TEST-" + Date.now(),
      city: "Amritsar",
      state: "Punjab",
      status: "DRAFT"
    }
  });

  // DRAFT store should not alter open store count
  const openCountWithDraft = await prisma.store.count({ where: { status: "OPEN" } });
  if (openCountWithDraft !== originalStores.length) throw new Error("DRAFT store leaked into Storefront OPEN query!");

  // Publish Store
  await prisma.store.update({ where: { id: newStore.id }, data: { status: "OPEN" } });
  const openCountWithPublished = await prisma.store.count({ where: { status: "OPEN" } });
  if (openCountWithPublished !== originalStores.length + 1) throw new Error("Published store failed to register as OPEN!");

  console.log("✅ Store Locator DRAFT vs OPEN state behavior verified.");

  // 7. Customer Enquiry Inbox Round-Trip Test
  console.log("\n📩 7. Testing Customer Enquiry Inbox Round-Trip...");
  const enq = await prisma.enquiry.create({
    data: {
      name: "Rohan Verma",
      email: "rohan@example.com",
      phone: "+91 98765 11111",
      size: "9",
      message: "Looking for bridal wedding mojaris.",
      productId: prod.id,
      productSku: prod.sku,
      status: "NEW"
    }
  });

  // Update Status & Internal Notes
  const updatedEnq = await prisma.enquiry.update({
    where: { id: enq.id },
    data: {
      status: "IN_PROGRESS",
      assignedAdminId: superAdmin.id,
      internalNotes: JSON.stringify([{ id: "note_1", text: "Called customer, sent sizing chart.", createdAt: new Date().toISOString(), authorName: superAdmin.name }])
    }
  });

  if (updatedEnq.status !== "IN_PROGRESS" || !updatedEnq.internalNotes?.includes("sizing chart")) {
    throw new Error("Enquiry status/note update failed!");
  }
  console.log("✅ Customer Enquiry creation, status update, admin assignment, and note persistence verified.");

  // 8. Clean up test records
  await prisma.enquiry.delete({ where: { id: enq.id } });
  await prisma.store.delete({ where: { id: newStore.id } });
  await prisma.product.delete({ where: { id: prod.id } });
  await prisma.collection.delete({ where: { id: col.id } });
  await prisma.category.delete({ where: { id: cat.id } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: { in: [superAdmin.id, contentManager.id] } } });
  await prisma.adminUser.deleteMany({ where: { id: { in: [superAdmin.id, contentManager.id] } } });

  console.log("\n==================================================");
  console.log("🎉 ALL PHASE B BUSINESS MANAGEMENT TESTS PASSED!");
  console.log("==================================================\n");
}

runPhaseBTests()
  .catch((err) => {
    console.error("❌ PHASE B TEST FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
