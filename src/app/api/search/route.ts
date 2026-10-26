import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] });
    }

    // Fetch published products
    const allProducts = await prisma.product.findMany({
      where: {
        archived: false,
        published: true,
        hidden: false
      },
      include: {
        images: {
          take: 1,
        },
      },
    });

    const lowerQuery = query.toLowerCase();
    
    // In-memory case-insensitive multi-field filter
    const filteredProducts = allProducts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.gender && p.gender.toLowerCase().includes(lowerQuery)) ||
      (p.colors && p.colors.toLowerCase().includes(lowerQuery)) ||
      (p.material && p.material.toLowerCase().includes(lowerQuery)) ||
      (p.occasion && p.occasion.toLowerCase().includes(lowerQuery)) ||
      p.id.toLowerCase().includes(lowerQuery)
    );

    // Take top 8 results
    const results = filteredProducts.slice(0, 8);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
