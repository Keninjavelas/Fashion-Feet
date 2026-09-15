"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const current = (window.scrollY / totalHeight) * 100;
      setScrollProgress(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[2.5px] z-50 pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#C5A059] via-[#8A1538] to-[#C5A059] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
