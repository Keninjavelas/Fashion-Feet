import Link from "next/link";
import { Ruler, Info, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SizeSelector } from "./SizeSelector";

export default async function SizePage() {
  const session = await auth();
  const dbUser = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
    : null;
    
  const hasSavedSize = !!dbUser?.size;
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-brand-900)] mb-2">My Size</h1>
        <p className="text-gray-600">Your saved measurements for the perfect fit.</p>
      </div>

      <div className="bg-white border border-black/5 p-8 shadow-sm relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
          <Ruler className="w-96 h-96 transform rotate-45" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-black/5">
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Your Saved Size</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-serif text-[var(--color-brand-900)]">{dbUser?.size}</span>
              </div>
            </div>
            
            <SizeSelector currentSize={dbUser?.size || ""} />
          </div>
          
          {hasSavedSize ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-medium text-gray-900 mb-6 uppercase tracking-widest text-sm">Equivalent Sizes</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[var(--color-brand-50)] p-4 border border-[var(--color-brand-100)]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">US</p>
                    <p className="font-serif text-xl text-[var(--color-brand-900)]">10</p>
                  </div>
                  <div className="bg-[var(--color-brand-50)] p-4 border border-[var(--color-brand-100)]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">EU</p>
                    <p className="font-serif text-xl text-[var(--color-brand-900)]">43</p>
                  </div>
                  <div className="bg-[var(--color-brand-50)] p-4 border border-[var(--color-brand-100)]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">India</p>
                    <p className="font-serif text-xl text-[var(--color-brand-900)]">9</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-6 uppercase tracking-widest text-sm">Estimated Foot Length</h3>
                <div className="flex items-center gap-4 bg-[var(--color-brand-50)] p-6 border border-[var(--color-brand-100)]">
                  <div className="flex-1">
                    <p className="font-serif text-3xl text-[var(--color-brand-900)] mb-1">27.5 <span className="text-xl">cm</span></p>
                    <p className="text-sm text-gray-500">Based on standard sizing</p>
                  </div>
                  <Ruler className="w-8 h-8 text-[var(--color-accent-gold)] opacity-50" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] mb-8">
              <Ruler className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="font-serif text-xl text-[var(--color-brand-900)] mb-2">No size saved</h3>
              <p className="text-gray-500 mb-6">Find your perfect fit and save it for a seamless shopping experience.</p>
              <Link href="/size-guide" className="inline-block px-6 py-3 bg-[var(--color-brand-900)] text-white text-sm font-medium uppercase tracking-widest hover:bg-[var(--color-accent-gold)] transition-colors">
                Find My Size
              </Link>
            </div>
          )}
          
          <div className="mt-12 flex items-start gap-3 text-sm text-gray-500 bg-blue-50/50 p-4 rounded-md border border-blue-100">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p>Handmade Juttis can fit differently than standard sneakers. We maintain separate Men's and Women's sizing models for our specific craftsmen's lasts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
