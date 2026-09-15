import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/adminAuth";

async function seedAdmin() {
  const email = "admin@fashionfeet.com";
  const password = "SuperAdminPassword2026!";
  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      mfaEnabled: false,
    },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      mfaEnabled: false,
    }
  });

  console.log(`✅ Admin user seeded cleanly: ${admin.email} (Role: ${admin.role})`);
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
