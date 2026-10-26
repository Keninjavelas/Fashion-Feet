import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FaqManagerClient } from "@/components/admin/FaqManagerClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQs | Fashion Feet Admin" };

export default async function AdminFaqPage() {
  if (!(await getAuthenticatedAdmin())) redirect("/admin/login");

  const faqs = await prisma.faq.findMany({
    orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      isPinned: true,
      displayOrder: true,
    },
  });

  return <AdminShell><FaqManagerClient initialFaqs={faqs} /></AdminShell>;
}
