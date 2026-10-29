import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FestivalProvider } from "@/components/providers/FestivalProvider";
import { AnnouncementMarqueeBar } from "@/components/layout/AnnouncementMarqueeBar";
import { getSiteSettingsMap } from "@/lib/siteSettings";
import { getPublishedStorefrontConfig } from "@/lib/storefrontConfig";
import { getActiveFestival } from "@/lib/activeFestival";
import { connection } from "next/server";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";

export async function StorefrontLayout({ 
  children,
  activeFestivalTheme,
}: { 
  children: React.ReactNode;
  activeFestivalTheme?: any;
}) {
  // The admin runs in a separate Next.js deployment. Its revalidatePath calls
  // cannot invalidate this deployment, so public pages read shared data anew
  // for each request instead of being frozen into the build output.
  await connection();
  const [siteSettings, activeFestival, footerSections] = await Promise.all([
    getSiteSettingsMap(),
    getActiveFestival(),
    getPublishedStorefrontConfig("footer")
  ]);

  const siteName = siteSettings["general.siteName"] || "Fashion Feet";

  // Determine active theme preset (defaulting to clean light evergreen "default")
  const festivalTheme = activeFestivalTheme || activeFestival?.theme || "default";

  return (
    <FestivalProvider initialFestival={festivalTheme}>
      <div data-theme={festivalTheme} className="min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300 relative">
        <AnnouncementMarqueeBar />
        <Navbar siteName={siteName} />
        <main id="main-content" className="min-h-screen relative z-10">
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
        </main>
        <Footer siteName={siteName} section={footerSections.find((section) => section.type === "GLOBAL_FOOTER")} />
      </div>
    </FestivalProvider>
  );
}
