import Link from "next/link";
import { Heart, Ruler, Clock, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfileOverview() {
  const session = await auth();
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
    : null;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">
          Welcome back, {session?.user?.name ? session.user.name.split(" ")[0] : "Guest"}!
        </h1>
        <p className="text-gray-600">Here's your personal Fashion Feet space.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Favorites Card */}
        <div className="bg-white p-6 border border-black/5 shadow-sm group hover:border-[var(--color-accent-gold)] transition-colors">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-red-50 text-red-500 rounded-full">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-3xl font-serif text-[var(--color-brand-900)]">0</span>
          </div>
          <h3 className="font-medium text-lg text-gray-900 mb-1">Favorites</h3>
          <Link href="/profile/favorites" className="text-sm text-gray-500 hover:text-[var(--color-brand-900)] flex items-center group-hover:text-[var(--color-brand-900)] transition-colors">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Saved Size Card */}
        <div className="bg-white p-6 border border-black/5 shadow-sm group hover:border-[var(--color-accent-gold)] transition-colors">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-[var(--color-brand-100)] text-[var(--color-brand-900)] rounded-full">
              <Ruler className="w-6 h-6" />
            </div>
            <span className="text-3xl font-serif text-[var(--color-brand-900)]">{dbUser?.size || "--"}</span>
          </div>
          <h3 className="font-medium text-lg text-gray-900 mb-1">Saved Size</h3>
          <Link href="/profile/size" className="text-sm text-gray-500 hover:text-[var(--color-brand-900)] flex items-center group-hover:text-[var(--color-brand-900)] transition-colors">
            Update <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Recently Viewed Card */}
        <div className="bg-white p-6 border border-black/5 shadow-sm group hover:border-[var(--color-accent-gold)] transition-colors">
          <div className="flex justify-between items-start mb-12">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-3xl font-serif text-[var(--color-brand-900)]">0</span>
          </div>
          <h3 className="font-medium text-lg text-gray-900 mb-1">Recently Viewed</h3>
          <Link href="/profile/recent" className="text-sm text-gray-500 hover:text-[var(--color-brand-900)] flex items-center group-hover:text-[var(--color-brand-900)] transition-colors">
            View <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
      
      {/* Picked for You Section */}
      <div className="pt-8">
        <h2 className="font-serif text-2xl text-[var(--color-brand-900)] mb-6">Picked for You</h2>
        <div className="bg-white p-12 text-center border border-black/5 shadow-sm">
          <p className="text-gray-500 mb-4">Tell us your style preferences to see personalized recommendations.</p>
          <Link href="/profile/preferences" className="inline-block px-6 py-3 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors">
            Update Preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
