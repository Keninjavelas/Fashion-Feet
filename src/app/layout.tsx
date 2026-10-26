import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnimationReadyProvider } from "@/components/providers/AnimationReadyProvider";
import { JudyWidget } from "@/components/judy/JudyWidget";
import { BRAND_LOGO_SRC, BRAND_TAGLINE } from "@/lib/branding";
import { STOREFRONT_ORIGIN } from "@/lib/contactDetails";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(STOREFRONT_ORIGIN),
  title: {
    default: `Fashion Feet | ${BRAND_TAGLINE}`,
    template: "%s | Fashion Feet"
  },
  description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
  icons: { icon: BRAND_LOGO_SRC, apple: BRAND_LOGO_SRC },
  keywords: ["Punjabi Jutti", "Bespoke Mojari", "Bridal Juttis", "Indian Handcrafted Footwear", "Handcrafted Jutti", "Luxury Footwear India"],
  authors: [{ name: "Fashion Feet Atelier" }],
  openGraph: {
    title: `Fashion Feet | ${BRAND_TAGLINE}`,
    description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
    url: STOREFRONT_ORIGIN,
    siteName: "Fashion Feet",
    locale: "en_IN",
    type: "website",
    images: [{ url: BRAND_LOGO_SRC, width: 957, height: 707, alt: "Fashion Feet official logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Fashion Feet | ${BRAND_TAGLINE}`,
    description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
    images: [BRAND_LOGO_SRC],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AnimationReadyProvider>
            {children}
            {/* Judy, the storefront assistant. Mounted once, rendered fixed, and
                hidden by the widget itself on /admin routes. */}
            <JudyWidget />
          </AnimationReadyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
