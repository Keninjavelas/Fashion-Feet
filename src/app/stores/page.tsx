import { prisma } from "@/lib/prisma";
import { MapPin, ArrowRight, Clock, Phone, Mail, ExternalLink, Sparkles, Building2 } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FindAStorePage() {
  const stores = await (prisma as any).store?.findMany({
    where: { status: { in: ["OPEN", "COMING_SOON", "TEMPORARILY_CLOSED"] } },
    orderBy: { displayOrder: "asc" }
  }).catch(() => []) || [];

  if (stores.length === 0) {
    return (
      <StorefrontLayout>
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 bg-[var(--theme-color-bg)] px-6 pb-24 pt-36 text-[var(--theme-color-text)] md:px-8 lg:grid-cols-2">
          <div><p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[var(--theme-color-accent)]">Experience Fashion Feet</p><h1 className="font-serif text-5xl leading-tight md:text-6xl">See the collection from wherever you are.</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--theme-color-text-muted)]">There are no confirmed Fashion Feet store locations listed at present. Explore the photographed designs online and contact us about a pair.</p><div className="mt-8 flex flex-wrap gap-4"><Link href="/women" className="inline-flex min-h-12 items-center gap-2 bg-[var(--theme-color-jewel)] px-6 text-sm font-semibold text-white">View designs <ArrowRight className="h-4 w-4" /></Link><Link href="/contact" className="inline-flex min-h-12 items-center border border-[var(--theme-color-border)] px-6 text-sm font-semibold">Contact us</Link></div></div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e6d6ce]"><Image src="/exhibitions/display-shelves.jpg" alt="Juttis displayed on shelves at a past Fashion Feet exhibition" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#FAF9F6] pt-28 pb-24">
        {/* Header Hero Banner */}
        <div className="bg-[var(--color-brand-900)] text-white py-16 px-4 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="text-[var(--color-accent-gold)] uppercase tracking-widest text-xs font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Experience Showrooms
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-white font-medium">Find A Fashion Feet Store</h1>
            <p className="text-white/70 text-sm max-w-xl mx-auto">
              Browse confirmed locations and their published opening information below.
            </p>
          </div>
        </div>

        {/* Stores Grid Container */}
        <div className="container mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store: any) => {
              let photoList: string[] = [];
              if (store.photos) {
                try {
                  const parsed = JSON.parse(store.photos);
                  if (Array.isArray(parsed)) photoList = parsed;
                } catch {
                  photoList = [];
                }
              }

              let serviceList: string[] = [];
              if (store.services) {
                try {
                  const parsed = JSON.parse(store.services);
                  if (Array.isArray(parsed)) serviceList = parsed;
                } catch {
                  serviceList = [];
                }
              }

              return (
                <div key={store.id} className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:shadow-xl transition-all">
                  <div className="relative h-56 bg-gray-100">
                    {photoList.length > 0 ? (
                      <Image src={photoList[0]} alt={store.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-brand-50)] text-gray-400">
                        <Building2 className="w-10 h-10 text-[var(--color-brand-900)]/30 mb-1" />
                        <span className="text-xs font-semibold text-gray-500">Fashion Feet Showroom</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-5 text-white">
                      <span className="px-3 py-1 bg-[var(--color-accent-gold)] text-[var(--color-brand-900)] text-[10px] font-bold uppercase tracking-widest rounded-full w-fit shadow">
                        {store.status === "OPEN" ? store.type.replace("_", " ") : store.status.replaceAll("_", " ")}
                      </span>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-white drop-shadow">{store.name}</h2>
                        <p className="text-white/80 text-xs flex items-center gap-1 font-medium mt-1">
                          <MapPin className="w-4 h-4 text-[var(--color-accent-gold)]" /> {store.city}, {store.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 text-xs text-gray-600">
                      {store.street && (
                        <p className="leading-relaxed">{store.street}, {store.city} - {store.pinCode}</p>
                      )}
                      {store.status === "OPEN" && store.openingHours && (
                        <p className="flex items-center gap-2 font-medium text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <Clock className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0" />
                          <span>{store.openingHours}</span>
                        </p>
                      )}
                      {store.status === "OPEN" && store.phone && (
                        <p className="flex items-center gap-2 font-medium text-gray-900">
                          <Phone className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0" />
                          <span>{store.phone}</span>
                        </p>
                      )}
                    </div>

                    {serviceList.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-black/5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Showroom Amenities</span>
                        <div className="flex flex-wrap gap-1.5">
                          {serviceList.map((srv: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-[var(--color-brand-50)] text-[var(--color-brand-900)] text-[10px] font-semibold rounded border border-[var(--color-brand-200)]">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {store.status === "OPEN" && store.googleMapsUrl && (
                      <div className="pt-3 border-t border-black/5">
                        <Link
                          href={store.googleMapsUrl}
                          target="_blank"
                          className="w-full py-3 bg-[var(--color-brand-900)] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors rounded-lg flex items-center justify-center gap-2 shadow"
                        >
                          Get Directions on Google Maps <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
