import Link from "next/link";
import { ArrowRight, Ruler } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function SizePage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { size: true } })
    : null;

  return (
    <div className="max-w-3xl space-y-8 text-[var(--theme-color-text)]">
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--theme-color-accent)]"><Ruler className="h-4 w-4" /> Your measurement</p>
        <h1 className="font-serif text-4xl">My Size</h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--theme-color-text-muted)]">Keep your own measurement handy when asking about a particular design. It does not confirm a product size or guarantee fit.</p>
      </div>
      <div className="border border-[var(--theme-color-border)] bg-[var(--theme-color-surface)] p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--theme-color-text-muted)]">Saved information</p>
        <p className="mt-4 font-serif text-3xl">{user?.size || "No measurement saved"}</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--theme-color-text-muted)]">Earlier saved sizes may be in US sizing. We have removed the unverified automatic conversions; please confirm sizing for each pair before ordering.</p>
        <Link href="/size-guide" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-[var(--theme-color-jewel)] px-6 text-sm font-semibold text-white">{user?.size ? "Update measurement" : "Measure your feet"} <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
