import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnimationReadyProvider } from "@/components/providers/AnimationReadyProvider";
import { JudyWidget } from "@/components/judy/JudyWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://fashionfeet.com"),
  title: {
    default: "Fashion Feet | Royal Punjabi Juttis & Bespoke Atelier",
    template: "%s | Fashion Feet"
  },
  description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
  keywords: ["Punjabi Jutti", "Bespoke Mojari", "Bridal Juttis", "Indian Handcrafted Footwear", "Handcrafted Jutti", "Luxury Footwear India"],
  authors: [{ name: "Fashion Feet Atelier" }],
  openGraph: {
    title: "Fashion Feet | Royal Punjabi Juttis & Bespoke Atelier",
    description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
    url: "https://fashionfeet.com",
    siteName: "Fashion Feet",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion Feet | Royal Punjabi Juttis & Bespoke Atelier",
    description: "Handcrafted Punjabi Juttis, bridal mojaris, and bespoke ceremonial footwear crafted by master artisans.",
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
