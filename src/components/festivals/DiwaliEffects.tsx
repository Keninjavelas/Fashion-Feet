"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DiwaliEffects() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate random spark particles
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden mix-blend-screen">
      {/* Global golden glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-yellow-500/5 to-transparent pointer-events-none" />
      
      {/* Floating Spark Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_8px_#fbbf24]"
          style={{ left: `${p.x}%` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: -1000, 
            opacity: [0, 1, 0],
            x: p.x % 2 === 0 ? [0, 20, -20, 0] : [0, -20, 20, 0] 
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Decorative Border Glow */}
      <div className="absolute inset-0 border-4 border-yellow-500/20 shadow-[inset_0_0_50px_rgba(234,179,8,0.2)] pointer-events-none" />
    </div>
  );
}
