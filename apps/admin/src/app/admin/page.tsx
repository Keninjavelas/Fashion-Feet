import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity, ArrowRight, ArrowUpRight, Clock3, FolderTree, Image as ImageIcon,
  Inbox, LockKeyhole, Package, ShieldCheck, SlidersHorizontal, Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { AdminShell } from "@/components/admin/AdminShell";
import { BrandLogo } from "@/components/layout/BrandLogo";

export const metadata = {
  title: "Dashboard | Fashion Feet Admin",
  description: "Fashion Feet management workspace",
};

export default async function AdminDashboardPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  const [publishedProducts, draftProducts, collections, newEnquiries, publishedMedia, totalAdmins, mfaAdmins, recentAudits] = await Promise.all([
    prisma.product.count({ where: { status: "PUBLISHED", archived: false } }).catch(() => null),
    prisma.product.count({ where: { status: "DRAFT", archived: false } }).catch(() => null),
    prisma.collection.count({ where: { status: "PUBLISHED", visible: true } }).catch(() => null),
    prisma.enquiry.count({ where: { status: "NEW" } }).catch(() => null),
    prisma.mediaAsset.count({ where: { status: "PUBLISHED" } }).catch(() => null),
    prisma.adminUser.count({ where: { suspended: false } }).catch(() => null),
    prisma.adminUser.count({ where: { suspended: false, mfaEnabled: true } }).catch(() => null),
    admin.role === "SUPER_ADMIN"
      ? prisma.adminAuditLog.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, action: true, resourceType: true, createdAt: true, admin: { select: { name: true } } },
        }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const dataUnavailable = [publishedProducts, draftProducts, collections, newEnquiries, publishedMedia, totalAdmins, mfaAdmins].some((value) => value === null);
  const mfaCoverage = totalAdmins && mfaAdmins !== null ? Math.round((mfaAdmins / totalAdmins) * 100) : null;

  const stats = [
    { label: "Published products", value: publishedProducts, detail: `${draftProducts ?? "—"} drafts to review`, href: "/admin/products", icon: Package },
    { label: "Live collections", value: collections, detail: "Curated for the storefront", href: "/admin/collections", icon: FolderTree },
    { label: "New enquiries", value: newEnquiries, detail: "Waiting for a response", href: "/admin/enquiries", icon: Inbox },
    { label: "Media library", value: publishedMedia, detail: "Published assets", href: "/admin/media", icon: ImageIcon },
  ];

  const actions = [
    { title: "Shape the storefront", description: "Edit sections, imagery and page copy.", href: "/admin/editor", icon: SlidersHorizontal },
    { title: "Manage the catalogue", description: "Publish products and build collections.", href: "/admin/products", icon: Package },
    { title: "Prepare a season", description: "Schedule a festival experience.", href: "/admin/festivals", icon: Sparkles },
    { title: "Reply to customers", description: "Review new product and fitting enquiries.", href: "/admin/enquiries", icon: Inbox },
  ];

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-[28px] border border-[#5D3545] bg-[#260E1A] p-6 text-white shadow-[0_24px_60px_-38px_rgba(38,14,26,0.65)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-[#E8C684]/20 bg-[#8A1538]/30 blur-[1px]" />
          <div className="pointer-events-none absolute bottom-[-160px] right-32 h-72 w-72 rounded-full border border-[#E8C684]/10" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8C684]">
                <ShieldCheck className="h-4 w-4" /> Protected workspace
              </p>
              <h1 className="mt-4 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back, {admin.name}.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                A clear view of your catalogue, customer enquiries, and the stories you publish for Fashion Feet.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/admin/editor" className="inline-flex items-center gap-2 rounded-xl bg-[#E8C684] px-4 py-3 text-xs font-bold text-[#321820] hover:bg-white">
                  Open Storefront Studio <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/admin/products" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-xs font-bold text-white hover:bg-white/10">
                  Manage products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="hidden rounded-3xl border border-white/15 bg-white/8 p-5 text-center lg:block">
              <BrandLogo className="mx-auto h-auto w-36 rounded-2xl bg-white p-2" sizes="144px" eager />
              <p className="mt-4 font-serif text-lg text-[#F3DDAD]">Designer Punjabi Jutties</p>
            </div>
          </div>
        </section>

        {dataUnavailable && (
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Some dashboard counts are temporarily unavailable. Check System Health for details.
          </p>
        )}

        <section aria-label="At a glance" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="group min-w-0 rounded-2xl border border-[#EADFD5] bg-[#FFFCF8] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D7B7A9] hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-xl bg-[#F6E8E9] p-2 text-[#8A1538]"><Icon className="h-4 w-4" /></span>
                  <ArrowUpRight className="h-4 w-4 text-[#B9A4A5] group-hover:text-[#8A1538]" />
                </div>
                <p className="mt-4 font-serif text-3xl font-semibold leading-none text-[#321820] sm:text-4xl">{stat.value ?? "—"}</p>
                <p className="mt-2 text-xs font-bold text-[#442D36] sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-[11px] leading-snug text-[#8A7779]">{stat.detail}</p>
              </Link>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
          <section className="min-w-0 rounded-2xl border border-[#EADFD5] bg-[#FFFCF8] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9B6C70]">What would you like to do?</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#321820]">Your next move</h2>
              </div>
              <p className="text-xs text-[#897779]">Every change begins here.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="group flex min-w-0 items-start gap-3 rounded-2xl border border-[#EEE4DA] bg-white p-4 transition hover:border-[#D7B7A9] hover:bg-[#FFF8F2]">
                    <span className="shrink-0 rounded-xl bg-[#F8E9ED] p-2.5 text-[#8A1538]"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 font-semibold text-[#321820]">{action.title} <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" /></span>
                      <span className="mt-1 block text-xs leading-relaxed text-[#857477]">{action.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#EADFD5] bg-[#FFFCF8] p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9B6C70]">Account protection</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#321820]">Security at a glance</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span className="text-xs font-semibold">Your authenticator MFA is active</span>
              </div>
              {admin.role === "SUPER_ADMIN" && (
                <div className="flex items-center gap-3 rounded-xl bg-[#F6E8E9] px-4 py-3 text-[#6D203C]">
                  <LockKeyhole className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-semibold">{mfaCoverage === null ? "—" : `${mfaCoverage}%`} MFA coverage across {totalAdmins ?? "—"} active admins</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/admin/settings" className="inline-flex items-center gap-1 rounded-full border border-[#E3C8CB] px-3 py-2 text-xs font-semibold text-[#8A1538] hover:bg-[#F8E9ED]">Account settings <ArrowRight className="h-3.5 w-3.5" /></Link>
              {admin.role === "SUPER_ADMIN" && <Link href="/admin/system-health" className="inline-flex items-center gap-1 rounded-full border border-[#E3C8CB] px-3 py-2 text-xs font-semibold text-[#8A1538] hover:bg-[#F8E9ED]"><Activity className="h-3.5 w-3.5" /> System health</Link>}
            </div>
          </section>
        </div>

        {admin.role === "SUPER_ADMIN" && (
          <section className="rounded-2xl border border-[#EADFD5] bg-[#FFFCF8] p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9B6C70]">Accountability</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#321820]">Recent activity</h2>
              </div>
              <Link href="/admin/audit-log" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#8A1538] hover:underline">Full audit log <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            {recentAudits.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#F8F3EE] px-4 py-6 text-center text-sm text-[#857477]">No audit events recorded yet.</p>
            ) : (
              <div className="mt-5 divide-y divide-[#EEE4DA]">
                {recentAudits.map((entry) => (
                  <div key={entry.id} className="flex min-w-0 items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="rounded-lg bg-[#F6E8E9] p-2 text-[#8A1538]"><Clock3 className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-bold text-[#392731]">{entry.action.replaceAll("_", " ")}</p>
                      <p className="mt-0.5 text-[11px] text-[#8A7779]">{entry.admin?.name || "System"} · {entry.resourceType}</p>
                    </div>
                    <time className="shrink-0 text-right text-[10px] text-[#9C8A89]" dateTime={entry.createdAt.toISOString()}>
                      {entry.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AdminShell>
  );
}
