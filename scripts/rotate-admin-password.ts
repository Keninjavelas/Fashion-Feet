import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

async function main() {
  if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) {
    throw new Error("Password rotation requires the production PostgreSQL database.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16) {
    throw new Error("Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters.");
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || admin.role !== "SUPER_ADMIN" || admin.suspended) {
    throw new Error("Active Super Admin account not found.");
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.adminSession.deleteMany({ where: { adminId: admin.id } }),
  ]);
  console.log("Super Admin password rotated and existing sessions revoked.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Password rotation failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
