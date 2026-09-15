"use client";

import { useState, useRef } from "react";

export function StorefrontTiltCard({
  children,
  className = "",
  glowColor = "rgba(197, 160, 89, 0.2)"
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.3
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      data-cursor="inspect"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform.includes("scale3d(1, 1, 1)")
          ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
          : "transform 80ms ease-out"
      }}
      className={`relative overflow-hidden will-change-transform surface-card ${className}`}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-inherit z-20"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glowColor}, transparent 65%)`,
          opacity: glarePosition.opacity
        }}
      />
    </div>
  );
}
