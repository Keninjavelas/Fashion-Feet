import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

async function main() {
  if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) {
    throw new Error("Bootstrap requires the production PostgreSQL DATABASE_URL.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 16) {
    throw new Error("Set a real ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters.");
  }

  const existing = await prisma.adminUser.count();
  if (existing !== 0) {
    throw new Error("Admin bootstrap is one-time only; administrator accounts already exist.");
  }

  await prisma.adminUser.create({
    data: {
      email,
      name: "Super Admin",
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
      suspended: false,
    },
  });
  console.log("Initial Super Admin created. Enroll TOTP MFA at the first login.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Admin bootstrap failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
