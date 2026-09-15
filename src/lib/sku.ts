import { prisma } from "@/lib/prisma";

export async function generateProductSku(gender?: string | null, category?: string | null): Promise<string> {
  const gCode = (gender || "Men").toUpperCase().startsWith("M") ? "M" : (gender || "").toUpperCase().startsWith("W") ? "W" : "U";
  const catCode = (category || "GEN").replaceAll(/[^A-Z]/gi, "").substring(0, 3).toUpperCase() || "GEN";
  const prefix = `FF-${gCode}-${catCode}`;

  // Query existing SKUs matching prefix
  const existingProducts = await prisma.product.findMany({
    where: {
      sku: { startsWith: prefix }
    },
    select: { sku: true }
  }).catch(() => []);

  let maxNum = 0;
  existingProducts.forEach((p) => {
    if (p.sku) {
      const parts = p.sku.split("-");
      const last = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(last) && last > maxNum) {
        maxNum = last;
      }
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(4, "0");
  return `${prefix}-${nextNum}`;
}
