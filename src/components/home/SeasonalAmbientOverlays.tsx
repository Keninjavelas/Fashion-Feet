"use client";

import { useFestival } from "@/components/providers/FestivalProvider";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Snowflake, Flame } from "lucide-react";

export function SeasonalAmbientOverlays() {
  const { activeFestival, preset } = useFestival();

  if (!preset.decorations.particlesEnabled) return null;

  const particleType = preset.decorations.particleType;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* DIWALI: Floating Diyas & Golden Particles */}
      {particleType === "diyas" && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`diya-${i}`}
              initial={{ y: "100vh", opacity: 0, x: `${(i * 8.5) % 100}vw` }}
              animate={{
                y: "-10vh",
                opacity: [0, 0.8, 0.8, 0],
                x: [`${(i * 8.5) % 100}vw`, `${((i * 8.5) % 100) + 5}vw`]
              }}
              transition={{
                duration: 10 + (i % 5) * 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              className="absolute flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-[#D4AF37] blur-xs animate-pulse" />
                <Sparkles className="w-5 h-5 text-[#D4AF37] absolute -top-2 -left-0.5 drop-shadow-[0_0_8px_#D4AF37]" />
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* HOLI: Soft Gulal Color Particles */}
      {particleType === "gulal" && (
        <>
          {[...Array(15)].map((_, i) => {
            const colors = ["#FF758F", "#2A9D8F", "#F4A261", "#1D3557"];
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={`gulal-${i}`}
                initial={{ y: "-5vh", opacity: 0, x: `${(i * 7) % 100}vw`, scale: 0.5 }}
                animate={{
                  y: "105vh",
                  opacity: [0, 0.6, 0.6, 0],
                  x: [`${(i * 7) % 100}vw`, `${((i * 7) % 100) - (i % 2 === 0 ? 8 : -8)}vw`],
                  scale: [0.5, 1.2, 0.8]
                }}
                transition={{
                  duration: 12 + (i % 4) * 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "linear"
                }}
                className="absolute w-3 h-3 rounded-full blur-xs"
                style={{ backgroundColor: color }}
              />
            );
          })}
        </>
      )}

      {/* EID: Emerald & Golden Crescent Lantern Lights */}
      {particleType === "lanterns" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`eid-${i}`}
              initial={{ opacity: 0.2, y: 0 }}
              animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -10, 0] }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              className="absolute text-[#D4AF37]"
              style={{ top: `${(i * 12) + 5}%`, right: `${(i * 11) % 90}%` }}
            >
              <Moon className="w-5 h-5 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] opacity-40" />
            </motion.div>
          ))}
        </>
      )}

      {/* CHRISTMAS: Snowfall & Twinkling Lights */}
      {particleType === "snowfall" && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              initial={{ y: "-10vh", opacity: 0, x: `${(i * 5) % 100}vw` }}
              animate={{
                y: "105vh",
                opacity: [0, 0.9, 0.9, 0],
                x: [`${(i * 5) % 100}vw`, `${((i * 5) % 100) + (i % 2 === 0 ? 4 : -4)}vw`]
              }}
              transition={{
                duration: 8 + (i % 6) * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "linear"
              }}
              className="absolute text-white/80"
            >
              <Snowflake className="w-4 h-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </motion.div>
          ))}
        </>
      )}

      {/* LOHRI: Bonfire Ember Particles */}
      {particleType === "embers" && (
        <>
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              initial={{ y: "100vh", opacity: 0, x: `${(i * 6) % 100}vw` }}
              animate={{
                y: "-5vh",
                opacity: [0, 1, 1, 0],
                x: [`${(i * 6) % 100}vw`, `${((i * 6) % 100) + (i % 2 === 0 ? 6 : -6)}vw`],
                scale: [0.6, 1.3, 0.4]
              }}
              transition={{
                duration: 9 + (i % 4) * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute flex items-center justify-center text-[#EA580C]"
            >
              <Flame className="w-4 h-4 text-[#EA580C] drop-shadow-[0_0_10px_#EA580C]" />
            </motion.div>
          ))}
        </>
      )}

      {/* BAISAKHI: Floating Wheat & Sunlight Beams */}
      {particleType === "wheat" && (
        <>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`wheat-${i}`}
              initial={{ y: "-5vh", opacity: 0, x: `${(i * 8) % 100}vw` }}
              animate={{
                y: "105vh",
                opacity: [0, 0.8, 0.8, 0],
                x: [`${(i * 8) % 100}vw`, `${((i * 8) % 100) + 8}vw`],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 11 + (i % 4) * 2.5,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
              className="absolute text-[#D97706]/70"
            >
              <Sun className="w-4 h-4 drop-shadow-[0_0_6px_#D97706]" />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
