import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FestivalProvider } from "@/components/providers/FestivalProvider";
import { AnnouncementMarqueeBar } from "@/components/layout/AnnouncementMarqueeBar";
import { getSiteSettingsMap } from "@/app/actions/settings";
import { getPublishedAsset } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import CustomCursor from "@/components/ui/CustomCursor";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { GoldFlakesAndStreamsBackground } from "@/components/home/GoldFlakesAndStreamsBackground";
import { SubtleLuxuryBackgroundEffects } from "@/components/home/SubtleLuxuryBackgroundEffects";
import { RoyalFootprintsAndColorMeshBackground } from "@/components/home/RoyalFootprintsAndColorMeshBackground";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";

export async function StorefrontLayout({ 
  children,
  activeFestivalTheme
}: { 
  children: React.ReactNode;
  activeFestivalTheme?: any;
}) {
  const [siteSettings, activeFestival, fallbackLogo] = await Promise.all([
    getSiteSettingsMap(),
    prisma.festival.findFirst({ where: { enabled: true } }).catch(() => null),
    getPublishedAsset("branding")
  ]);

  const siteLogo = siteSettings["branding.primaryLogo"] || fallbackLogo || "";
  const siteName = siteSettings["general.siteName"] || "Fashion Feet";

  // Determine active theme preset (defaulting to clean light evergreen "default")
  const festivalTheme = activeFestivalTheme || activeFestival?.theme || "default";

  return (
    <FestivalProvider initialFestival={festivalTheme}>
      <div data-theme={festivalTheme} className="min-h-screen bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] transition-colors duration-300 subtle-grain-bg relative">
        <ScrollProgressBar />
        <CustomCursor />
        <RoyalFootprintsAndColorMeshBackground />
        <SubtleLuxuryBackgroundEffects />
        <GoldFlakesAndStreamsBackground />
        <AnnouncementMarqueeBar />
        <Navbar siteLogo={siteLogo} siteName={siteName} />
        <main id="main-content" className="min-h-screen relative z-10">
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
        </main>
        <Footer siteLogo={siteLogo} siteName={siteName} />
      </div>
    </FestivalProvider>
  );
}
