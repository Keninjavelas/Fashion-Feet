"use client";

import { useEffect, useRef } from "react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function GoldFlakesAndStreamsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "lohri" || activeFestival === "baisakhi";

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // 40 clearly visible gold flakes & zari sparks
    const flakes = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.5,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: Math.random() * 0.3 - 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.6 + 0.3,
      color: Math.random() > 0.3 ? "#D4AF37" : "#C5A059"
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render 3 Flowing Gold Zari Ribbon Streams
      ctx.save();
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        const baseOpacity = isDiwali ? 0.22 : 0.14;
        ctx.strokeStyle = `rgba(212, 175, 55, ${baseOpacity + s * 0.04})`;
        ctx.lineWidth = 2 + s * 1;

        const amplitude = 35 + s * 15;
        const frequency = 0.0015 - s * 0.0003;
        const speed = time * (0.8 + s * 0.2);

        ctx.moveTo(0, height * (0.2 + s * 0.28));
        for (let x = 0; x <= width; x += 20) {
          const y =
            Math.sin(x * frequency + speed) * amplitude +
            Math.cos(x * 0.001 + speed * 0.5) * 20 +
            height * (0.25 + s * 0.28);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Render Floating & Shimmering Gold Flakes
      flakes.forEach(f => {
        f.y -= f.speedY;
        f.x += f.speedX + Math.sin(time + f.y * 0.01) * 0.2;
        f.rotation += f.rotationSpeed;

        if (f.y < -10) {
          f.y = height + 10;
          f.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        // Gold Flake Shimmer Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, f.size * 2.5);
        glow.addColorStop(0, `${f.color}CC`);
        glow.addColorStop(1, "rgba(212, 175, 55, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(-f.size * 2.5, -f.size * 2.5, f.size * 5, f.size * 5);

        // Diamond Mesh Shape
        ctx.beginPath();
        ctx.moveTo(0, -f.size * 1.5);
        ctx.lineTo(f.size, 0);
        ctx.lineTo(0, f.size * 1.5);
        ctx.lineTo(-f.size, 0);
        ctx.closePath();

        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDiwali]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-20 pointer-events-none w-full h-full"
    />
  );
}
