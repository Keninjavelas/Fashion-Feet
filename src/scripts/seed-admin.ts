import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/adminAuth";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters before seeding.");
  }

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log("Existing administrator left unchanged; seeding never resets credentials or MFA.");
    return;
  }

  await prisma.adminUser.create({
    data: {
      email,
      name: "Super Admin",
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
      mfaEnabled: false,
    },
  });

  console.log("Initial Super Admin created. Enrol MFA before using the dashboard.");
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
