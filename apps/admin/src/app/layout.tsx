import type { Metadata } from "next";
import "@/app/globals.css";
import "./admin-theme.css";

export const metadata: Metadata = {
  title: "Fashion Feet Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="admin-app">{children}</body>
    </html>
  );
}
