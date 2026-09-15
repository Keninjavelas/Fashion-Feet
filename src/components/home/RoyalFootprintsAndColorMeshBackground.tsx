"use client";

import { useEffect, useState } from "react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function RoyalFootprintsAndColorMeshBackground() {
  const [scrollY, setScrollY] = useState(0);
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "lohri" || activeFestival === "baisakhi";

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 16 walking steps down the left side margin gutter
  const totalSteps = 16;
  const currentStepIndex = Math.max(3, Math.min(totalSteps, Math.floor((scrollY + 200) / 200)));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Multi-Color Ambient Mesh Glow Orbs */}
      <div 
        className={`absolute top-[-5%] left-[-5%] w-[650px] h-[650px] rounded-full blur-[130px] transition-all duration-1000 opacity-40 animate-pulse ${
          isDiwali ? "bg-[#8A1538]" : "bg-[#C5A059]/30"
        }`}
      />
      <div 
        className={`absolute bottom-[-5%] right-[-5%] w-[650px] h-[650px] rounded-full blur-[130px] transition-all duration-1000 opacity-30 animate-pulse ${
          isDiwali ? "bg-[#D4AF37]" : "bg-[#8A1538]/20"
        }`}
      />

      {/* Prominent Royal Maroon Walking Footprints Trail (z-30, positioned in left side gutter) */}
      <div className="absolute inset-y-0 left-4 sm:left-8 md:left-12 lg:left-16 w-24 flex flex-col justify-between py-24">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isLeftFoot = idx % 2 === 0;
          const isRevealed = idx <= currentStepIndex;
          const topPercent = (idx / (totalSteps - 1)) * 88 + 5;

          // Walking gait offsets inside side margin gutter
          const xOffset = isLeftFoot ? -12 : 12;
          const rotation = isLeftFoot ? -8 : 8;

          return (
            <div
              key={idx}
              className={`absolute transition-all duration-500 transform ${
                isRevealed 
                  ? "opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-50 translate-y-4"
              }`}
              style={{
                top: `${topPercent}%`,
                transform: `translateX(${xOffset}px) rotate(${rotation}deg)`
              }}
            >
              <div className="flex flex-col items-center drop-shadow-lg">
                {/* Royal Crimson Maroon Jutti Sole Silhouette */}
                <div className="w-10 h-16 bg-[#8A1538] rounded-t-full rounded-b-2xl border-2 border-[#D4AF37] flex flex-col items-center justify-between p-1 relative shadow-xl">
                  <div className="w-full h-full border border-dashed border-[#D4AF37]/90 rounded-t-full rounded-b-xl flex flex-col items-center justify-center bg-gradient-to-b from-[#8A1538] via-[#6E1C24] to-[#3A0815]">
                    <span className="text-[9px] text-[#D4AF37] font-serif font-bold">✨</span>
                  </div>
                  <div className={`absolute top-0 w-2 h-2 rounded-full bg-[#D4AF37] shadow ${isLeftFoot ? "left-0.5" : "right-0.5"}`} />
                </div>

                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#8A1538] dark:text-[#D4AF37] mt-0.5 drop-shadow-md">
                  {isLeftFoot ? "Step L" : "Step R"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
