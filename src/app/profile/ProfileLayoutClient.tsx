"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { User, Heart, Ruler, Clock, Bell, Settings, LogOut, Sliders } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Overview", href: "/profile", icon: User },
  { name: "My Favorites", href: "/profile/favorites", icon: Heart },
  { name: "My Size", href: "/profile/size", icon: Ruler },
  { name: "Recently Viewed", href: "/profile/recent", icon: Clock },
  { name: "Preferences", href: "/profile/preferences", icon: Sliders },
  { name: "Notifications", href: "/profile/notifications", icon: Bell },
  { name: "Settings", href: "/profile/settings", icon: Settings },
];

export function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[var(--color-brand-50)] flex items-center justify-center pt-32">
        <div className="w-12 h-12 border-4 border-[var(--color-brand-200)] border-t-[var(--color-accent-gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[var(--color-brand-50)] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Mobile Nav - Horizontal Scroll */}
        <div className="md:hidden mb-8 -mx-4 px-4 overflow-x-auto pb-4 hide-scrollbar border-b border-black/5">
          <div className="flex space-x-6 min-w-max">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center space-x-2 pb-2 ${isActive ? 'text-[var(--color-brand-900)] border-b-2 border-[var(--color-accent-gold)]' : 'text-gray-500'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide uppercase">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-8 border border-black/5 shadow-2xl shadow-[var(--color-brand-900)]/5 sticky top-32 rounded-2xl">
              <div className="text-center mb-8 pb-8 border-b border-black/5">
                <div className="w-20 h-20 mx-auto bg-[var(--color-brand-100)] rounded-full flex items-center justify-center mb-4 text-[var(--color-brand-900)] font-serif text-3xl font-bold">
                  {userInitial}
                </div>
                <h2 className="font-serif text-xl text-[var(--color-brand-900)] font-bold">{session?.user?.name || "User"}</h2>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
              
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                        isActive 
                          ? 'bg-[var(--color-brand-900)] text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-brand-900)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-black/5">
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center space-x-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-rose-600 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="tracking-wide">Log Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>

        </div>
      </div>
    </div>
  );
}
