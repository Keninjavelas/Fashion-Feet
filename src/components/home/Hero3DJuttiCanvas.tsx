"use client";

import { useEffect, useRef, useState } from "react";
import { Rotate3d, Sparkles } from "lucide-react";

export function Hero3DJuttiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseX = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = 500);
    const height = (canvas.height = 360);

    let angle = rotationY;

    const render = () => {
      if (!isDragging) {
        angle += 0.01;
      } else {
        angle = rotationY;
      }

      ctx.clearRect(0, 0, width, height);

      // Center origin
      const cx = width / 2;
      const cy = height / 2 + 20;

      // 3D Lighting Radial Background Glow
      const glow = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, 180);
      glow.addColorStop(0, "rgba(212, 175, 55, 0.25)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Render 3D Curved Shoe Structure (Punjabi Jutti Curved Sole & Toe Contour)
      ctx.save();
      ctx.translate(cx, cy);

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Shadow projection on floor
      ctx.beginPath();
      ctx.ellipse(0, 70, 120 * Math.abs(cosA) + 40, 25, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Outer Sole (Leather Base)
      ctx.beginPath();
      ctx.moveTo(-110 * cosA, 40);
      ctx.bezierCurveTo(-60 * cosA, 55, 60 * cosA, 50, 120 * cosA, 30); // Pointed toe curve
      ctx.bezierCurveTo(90 * cosA, 10, 40 * cosA, 0, -100 * cosA, 20);
      ctx.closePath();
      ctx.fillStyle = "#2D1B18";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#D4AF37";
      ctx.stroke();

      // Upper Velvet / Crimson Body
      ctx.beginPath();
      ctx.moveTo(-90 * cosA, 25);
      ctx.bezierCurveTo(-40 * cosA, -35, 30 * cosA, -45, 110 * cosA, 15);
      ctx.bezierCurveTo(80 * cosA, 25, 20 * cosA, 40, -80 * cosA, 35);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(-100, -50, 100, 50);
      bodyGrad.addColorStop(0, "#8A1538"); // Royal Crimson velvet
      bodyGrad.addColorStop(0.5, "#4A0C1B");
      bodyGrad.addColorStop(1, "#1A050A");
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Zari Gold Thread Embroidery Lattice Lines (Handcrafted Stitching Projection)
      ctx.beginPath();
      for (let i = -60; i <= 80; i += 20) {
        ctx.moveTo((i - 20) * cosA, -10 + (i % 30));
        ctx.lineTo((i + 20) * cosA, 25 - (i % 20));
      }
      ctx.strokeStyle = "rgba(212, 175, 55, 0.75)"; // Metallic Gold zari
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gold Sequin / Dabka Mirror Accent Specular Highlights
      ctx.fillStyle = "#FFF2B2";
      for (let j = -40; j <= 60; j += 25) {
        const spotX = j * cosA;
        const spotY = Math.sin(j + angle) * 12 + 5;
        ctx.beginPath();
        ctx.arc(spotX, spotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotationY, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouseX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX.current;
    setRotationY(prev => prev + deltaX * 0.015);
    lastMouseX.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="relative w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-black/80 via-[#1C1412] to-black/90 border border-[#D4AF37]/30 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

      {/* 3D Controls Badge */}
      <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold border border-[#D4AF37]/30 shadow">
        <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '8s' }} />
        <span>360° Interactive 3D Inspection</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-white/70 text-[10px] uppercase font-bold tracking-widest border border-white/10 group-hover:text-[#D4AF37] transition-colors pointer-events-none">
        Drag mouse to rotate 3D Jutti
      </div>
    </div>
  );
}
