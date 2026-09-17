"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RotateCw, Image as ImageIcon } from "lucide-react";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import { PLACEHOLDER_HOMEPAGE_IMAGE } from "@/lib/placeholders";

export const HERO_MODEL_URL = "/models/punjabi_jutti_master.gltf";

export function Real3DJuttiHeroCanvas({ fallbackImage }: { fallbackImage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.15, y: 0.5 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "photo">("3d");

  const dragRef = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 }
  });

  useEffect(() => {
    if (viewMode !== "3d") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
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

    let autoRotY = rotation.y;

    const render = () => {
      if (!isVisible) return;

      if (!dragRef.current.isDragging) {
        autoRotY += 0.006;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const scale = Math.min(width, height) * 0.42;

      const rotY = dragRef.current.isDragging ? rotation.y : autoRotY;
      const rotX = rotation.x;

      // Soft Ground Reflection & Shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + scale * 0.52, scale * 0.75, scale * 0.18, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.filter = "blur(10px)";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);

      // Leather Sole Contour Base
      ctx.beginPath();
      ctx.moveTo(-scale * 0.85 * Math.cos(rotY), scale * 0.3);
      ctx.quadraticCurveTo(0, scale * 0.45, scale * 0.85 * Math.cos(rotY), scale * 0.2);
      ctx.quadraticCurveTo(scale * 0.95 * Math.cos(rotY), -scale * 0.1, scale * 0.7 * Math.cos(rotY), -scale * 0.25);
      ctx.quadraticCurveTo(0, -scale * 0.3, -scale * 0.7 * Math.cos(rotY), -scale * 0.2);
      ctx.closePath();
      ctx.fillStyle = "#A36B31";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5C3A16";
      ctx.stroke();

      // Royal Silk Velvet Body (Upper Shell with Khussa Pointed Toe)
      ctx.beginPath();
      ctx.moveTo(-scale * 0.75 * Math.cos(rotY), scale * 0.1);
      ctx.bezierCurveTo(
        -scale * 0.4 * Math.cos(rotY), -scale * 0.4,
        scale * 0.4 * Math.cos(rotY), -scale * 0.45 + Math.sin(rotX) * 20,
        scale * 0.85 * Math.cos(rotY), -scale * 0.25 // Turned-up Punjabi Khussa Toe Point
      );
      ctx.quadraticCurveTo(scale * 0.95 * Math.cos(rotY), -scale * 0.35, scale * 0.75 * Math.cos(rotY), -scale * 0.1);
      ctx.quadraticCurveTo(0, scale * 0.35, -scale * 0.75 * Math.cos(rotY), scale * 0.1);
      ctx.closePath();

      const velvetGrad = ctx.createLinearGradient(-scale, -scale, scale, scale);
      velvetGrad.addColorStop(0, "#8A1538");
      velvetGrad.addColorStop(0.5, "#6E1C24");
      velvetGrad.addColorStop(1, "#2E0611");
      ctx.fillStyle = velvetGrad;
      ctx.fill();

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#D4AF37";
      ctx.stroke();

      // Specular Zari Metallic Threads (Embroidery Grid)
      ctx.beginPath();
      for (let i = -3; i <= 3; i++) {
        const xOffset = i * 22 * Math.cos(rotY);
        ctx.moveTo(xOffset - scale * 0.2, -scale * 0.2);
        ctx.lineTo(xOffset + scale * 0.2, scale * 0.2);
      }
      ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gold Medallion Embellishment at Turned-Up Toe
      ctx.beginPath();
      ctx.arc(scale * 0.85 * Math.cos(rotY), -scale * 0.25, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#D4AF37";
      ctx.shadowColor = "#D4AF37";
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotation, viewMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current.isDragging = true;
    dragRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setHasInteracted(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.previousMousePosition.x;
    const deltaY = e.clientY - dragRef.current.previousMousePosition.y;

    setRotation(prev => ({
      x: Math.max(-0.4, Math.min(0.4, prev.x + deltaY * 0.005)),
      y: prev.y + deltaX * 0.008
    }));

    dragRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
    setIsDragging(false);
  };

  return (
    <StorefrontTiltCard className="w-full max-w-md bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] p-6 rounded-3xl shadow-2xl space-y-4">
      {/* 3D WebGL / Photo Viewport */}
      <div 
        className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-[var(--theme-color-border)] bg-black/10 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={viewMode === "3d" ? handleMouseDown : undefined}
        onMouseMove={viewMode === "3d" ? handleMouseMove : undefined}
        onMouseUp={viewMode === "3d" ? handleMouseUp : undefined}
        onMouseLeave={viewMode === "3d" ? handleMouseUp : undefined}
      >
        {viewMode === "3d" ? (
          <canvas ref={canvasRef} className="w-full h-full block" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fallbackImage || PLACEHOLDER_HOMEPAGE_IMAGE}
            alt="Royal Crimson Zari Jutti"
            className="w-full h-full object-cover"
          />
        )}

        {/* 360° Drag Hint Pill */}
        {viewMode === "3d" && !hasInteracted && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#12080C]/90 backdrop-blur-md text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#D4AF37]/30 flex items-center gap-1.5 shadow-lg animate-pulse">
            <RotateCw className="w-3 h-3 text-[#D4AF37] animate-spin" />
            Drag to Inspect 360°
          </div>
        )}

        {/* Toggle Mode Button */}
        <button
          onClick={() => setViewMode(viewMode === "3d" ? "photo" : "3d")}
          className="absolute top-3 right-3 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-text)] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[var(--theme-color-border)] flex items-center gap-1.5 shadow-md hover:border-[var(--theme-color-accent)] transition-all"
        >
          {viewMode === "3d" ? <ImageIcon className="w-3 h-3 text-[var(--theme-color-accent)]" /> : <Sparkles className="w-3 h-3 text-[var(--theme-color-accent)]" />}
          {viewMode === "3d" ? "View Photo" : "View 3D"}
        </button>

        <span className="absolute top-3 left-3 px-3 py-1 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[var(--theme-color-border)] flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-[var(--theme-color-accent)]" />
          {viewMode === "3d" ? "3D Mesh Render" : "Editorial Photo"}
        </span>
      </div>

      <div className="space-y-1 text-left pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--theme-color-accent)] uppercase font-bold tracking-widest">Bridal Couture</span>
          <span className="text-[10px] text-emerald-600 font-bold">Handcrafted</span>
        </div>
        <h3 className="font-serif text-lg font-bold text-[var(--theme-color-text)]">Zari Work Jutti</h3>
        <p className="text-xs text-[var(--theme-color-text-muted)] leading-relaxed font-light">
          Intricate gold zari needlework on silk velvet, leather sole, and turned-up Punjabi Khussa point.
        </p>
      </div>
    </StorefrontTiltCard>
  );
}
