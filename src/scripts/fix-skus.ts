import { prisma } from "../lib/prisma";

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Fixing SKUs for ${products.length} existing products...`);
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = p.gender?.toUpperCase().startsWith("M") ? "FF-M" : p.gender?.toUpperCase().startsWith("W") ? "FF-W" : "FF-U";
    const catPrefix = (p.category || "CAS").substring(0, 3).toUpperCase();
    const newSku = `${prefix}-${catPrefix}-${(i + 1).toString().padStart(4, "0")}`;
    
    await prisma.product.update({
      where: { id: p.id },
      data: { sku: newSku }
    });
    console.log(`Product ${p.id} -> ${newSku}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
