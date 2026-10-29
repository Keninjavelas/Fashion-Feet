"use client";

/** A calm card wrapper retained for existing callers while the old cursor tilt is retired. */
export function StorefrontTiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return <div className={`relative overflow-hidden ${className}`}>{children}</div>;
}
