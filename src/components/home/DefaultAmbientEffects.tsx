"use client";

import { useEffect, useRef } from "react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function DefaultAmbientEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeFestival } = useFestival();
  const isDefaultTheme = activeFestival === "default" || activeFestival === "none";

  useEffect(() => {
    if (!isDefaultTheme) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            cancelAnimationFrame(animationFrameId);
            render();
          } else {
            cancelAnimationFrame(animationFrameId);
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    // Subtle golden ambient floating dust
    const dustParticles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.2 + 0.05,
      speedX: Math.random() * 0.1 - 0.05,
      opacity: Math.random() * 0.3 + 0.1
    }));

    const render = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Render ultra-subtle golden ambient dust
      dustParticles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDefaultTheme]);

  if (!isDefaultTheme) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full opacity-60"
    />
  );
}
