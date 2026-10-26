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
        <div className="min-h-screen bg-[var(--color-brand-50)] pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute -left-64 -bottom-64 w-[500px] h-[500px] bg-[var(--color-brand-200)] rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -right-64 -top-64 w-[500px] h-[500px] bg-[var(--color-accent-gold)] rounded-full blur-3xl opacity-20"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto bg-white p-10 md:p-16 border border-black/5 shadow-2xl shadow-[var(--color-brand-900)]/5 text-center">
              <div className="w-16 h-16 mx-auto bg-[var(--color-brand-100)] rounded-full flex items-center justify-center mb-8 text-[var(--color-brand-900)]">
                <MapPin className="w-8 h-8 text-[var(--color-accent-gold)]" />
              </div>

              <p className="text-[var(--color-brand-900)] font-medium uppercase tracking-widest text-sm mb-4">Experience Showrooms</p>
              <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-brand-900)] mb-6 leading-tight">
                Fashion Feet is coming <br className="hidden md:block"/>closer to you.
              </h1>
              
              <p className="text-gray-600 text-lg mb-12">
                We are actively working on bringing the premium Fashion Feet experience to physical locations near you.
              </p>

              <div className="bg-[var(--color-brand-50)] p-8 border border-[var(--color-brand-100)] text-left">
                <h3 className="font-serif text-2xl text-[var(--color-brand-900)] mb-2 text-center">Stores Coming Soon</h3>
                <p className="text-gray-500 text-sm mb-6 text-center">Get notified the moment we open our first flagship experience center.</p>
                
                <form className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-1 border border-black/10 p-4 focus:outline-none focus:border-[var(--color-brand-900)] bg-white text-black"
                    required
                  />
                  <button 
                    type="button" 
                    className="px-8 py-4 bg-[var(--color-brand-900)] text-white font-medium uppercase tracking-widest text-sm hover:bg-[var(--color-accent-gold)] transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    Notify Me <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </form>
              </div>
            </div>
          </div>
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
              Visit our flagship heritage showrooms to experience handcrafted Punjabi Juttis, personalized size fitting, and bespoke embroidery consultations.
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
