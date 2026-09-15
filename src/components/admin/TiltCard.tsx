"use client";

import { useState, useRef } from "react";

export function TiltCard({
  children,
  className = "",
  glowColor = "rgba(212, 175, 55, 0.15)"
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

    const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;  // Max 6 deg

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform.includes("scale3d(1, 1, 1)")
          ? "transform 500ms cubic-bezier(0.03, 0.98, 0.52, 0.99)"
          : "transform 100ms ease-out"
      }}
      className={`relative overflow-hidden will-change-transform ${className}`}
    >
      {children}
      {/* Soft Radial Glare Effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-inherit"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glowColor}, transparent 60%)`,
          opacity: glarePosition.opacity
        }}
      />
    </div>
  );
}
