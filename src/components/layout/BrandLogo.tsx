import Image from "next/image";
import { BRAND_LOGO_SRC } from "@/lib/branding";

export function BrandLogo({ className = "", sizes = "240px", eager = false }: { className?: string; sizes?: string; eager?: boolean }) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt="Fashion Feet official logo: red footprints and Happy Feet Happy You"
      width={957}
      height={707}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={className}
    />
  );
}
