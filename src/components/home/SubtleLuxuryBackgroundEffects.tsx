"use client";

import { useEffect, useState } from "react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function SubtleLuxuryBackgroundEffects() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "lohri" || activeFestival === "baisakhi";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 1. Rich Breathing Velvet & Gold Radial Glow Orbs */}
      <div 
        className={`absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 animate-pulse ${
          isDiwali ? "bg-[#8A1538]/25" : "bg-[#C5A059]/20"
        }`}
      />
      <div 
        className={`absolute bottom-1/3 right-1/4 w-[550px] h-[550px] rounded-full blur-[90px] transition-all duration-1000 animate-pulse ${
          isDiwali ? "bg-[#D4AF37]/20" : "bg-[#8A1538]/12"
        }`}
      />

      {/* 2. Interactive Gold Cursor Spotlight Lens Follower */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full blur-[60px] transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${mousePos.x - 175}px, ${mousePos.y - 175}px)`,
          background: isDiwali 
            ? "radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, rgba(138, 21, 56, 0.1) 45%, transparent 70%)"
            : "radial-gradient(circle, rgba(197, 160, 89, 0.22) 0%, rgba(138, 21, 56, 0.08) 45%, transparent 70%)"
        }}
      />
    </div>
  );
}
