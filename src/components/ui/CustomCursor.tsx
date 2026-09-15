"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [label, setLabel] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorTarget) {
        setIsHovering(true);
        setLabel(cursorTarget.getAttribute("data-cursor") || "View");
      } else {
        setIsHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-300 ${
          isHovering
            ? "w-16 h-16 bg-[#8A1538]/90 text-white shadow-2xl border border-[#C5A059] scale-110"
            : "w-4 h-4 bg-[#C5A059]/80 border border-white shadow"
        }`}
      >
        {isHovering && (
          <span className="text-[10px] font-bold uppercase tracking-widest animate-in fade-in duration-200">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
