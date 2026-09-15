"use client";

import { useEffect, useRef } from "react";
import { useFestival } from "@/components/providers/FestivalProvider";

export function SwayingSilkHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeFestival } = useFestival();
  const isDiwali = activeFestival === "diwali" || activeFestival === "baisakhi" || activeFestival === "lohri";

  useEffect(() => {
    if (!isDiwali) return;

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

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: Math.random() * 0.2 - 0.1,
      opacity: Math.random() * 0.5 + 0.2
    }));

    let time = 0;

    const render = () => {
      if (!isVisible) return;

      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#12080C");
      grad.addColorStop(0.5, "#1A0A10");
      grad.addColorStop(1, "#0E0508");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(138, 21, 56, ${0.04 + i * 0.02})`;
        const offset = i * 200;
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 30) {
          const y =
            Math.sin(x * 0.002 + time + i) * 50 +
            Math.cos((x + offset) * 0.0015 + time * 0.8) * 35 +
            height * 0.4 +
            i * 40;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      const goldGlow = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.4, width * 0.6);
      goldGlow.addColorStop(0, "rgba(212, 175, 55, 0.12)");
      goldGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = goldGlow;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
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
  }, [isDiwali]);

  if (!isDiwali) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}
