"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FOOTWEAR_DESIGN_TOKENS,
  ProceduralPunjabiJutti,
  createStudioScene,
  type AccentSwatchName
} from "./ProceduralPunjabiJutti";

export interface ThreeJuttiCompactCardProps {
  accent?: AccentSwatchName;
  aspectRatio?: number;
  className?: string;
  interactive?: "idle-rotate" | "hover-tilt" | "hover-rotate" | "none";
  tiltStrength?: number;
  spinSpeed?: number;
  label?: string;
}

export function ThreeJuttiCompactCard({
  accent = "crimson",
  aspectRatio = 1,
  className,
  interactive = "hover-rotate",
  tiltStrength = 0.5,
  spinSpeed = 0.01,
  label = "Handcrafted Punjabi Jutti"
}: ThreeJuttiCompactCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeAccentRef = useRef<AccentSwatchName>(accent);

  const stateRef = useRef({
    mounted: false,
    rafId: 0 as number | 0,
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    shoe: null as ProceduralPunjabiJutti | null,
    resizeObserver: null as ResizeObserver | null,
    isHovered: false,
    isIntersecting: false,
    rotationY: 0,
    targetRotationY: 0,
    tiltX: 0,
    tiltZ: 0,
    baseY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    bob: 0,
    lastFrameAt: 0
  });

  const [, forceTick] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const accentHex = useMemo(
    () => FOOTWEAR_DESIGN_TOKENS.accentSwatches[accent] ?? 0x8a1538,
    [accent]
  );

  useEffect(() => {
    const accentChanged = activeAccentRef.current !== accent;
    activeAccentRef.current = accent;
    const shoe = stateRef.current.shoe;
    if (accentChanged && shoe && typeof shoe.setBodyAccentColor === "function") {
      try {
        shoe.setBodyAccentColor(accentHex);
      } catch {
        /* noop */
      }
    }
  }, [accent, accentHex]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const { scene, camera, renderer } = createStudioScene(canvas, {
        clearColor: 0xfdfbf4,
        floorVisible: false,
        fov: 38,
        cameraDistance: 4.4,
        dpr: Math.min(window.devicePixelRatio || 1, 1.75)
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      const rect = root.getBoundingClientRect();
      const initialW = Math.max(1, rect.width || 240);
      const initialH = Math.max(1, rect.height || initialW / aspectRatio);
      renderer.setSize(initialW, initialH, false);
      camera.aspect = initialW / initialH;
      camera.updateProjectionMatrix();

      const shoe = new ProceduralPunjabiJutti();
      try {
        shoe.setBodyAccentColor(accentHex);
      } catch {
        /* noop */
      }
      shoe.scale.setScalar(1.0);
      shoe.position.y = -0.15;
      shoe.rotation.y = -0.35;
      scene.add(shoe);

      const st = stateRef.current;
      st.renderer = renderer;
      st.scene = scene;
      st.camera = camera;
      st.shoe = shoe;
      st.rotationY = shoe.rotation.y;
      st.targetRotationY = shoe.rotation.y;
      st.baseY = shoe.position.y;
      st.mounted = true;
      st.lastFrameAt = performance.now();

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (!width || !height) continue;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      });
      resizeObserver.observe(root);
      st.resizeObserver = resizeObserver;

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            st.isIntersecting = entry.isIntersecting;
          }
        },
        { root: null, threshold: 0.08, rootMargin: "80px 0px 80px 0px" }
      );
      intersectionObserver.observe(root);

      let frameCount = 0;
      const tick = (now: number) => {
        const dt = Math.min(0.064, (now - st.lastFrameAt) / 1000);
        st.lastFrameAt = now;
        if (st.mounted && st.isIntersecting && st.shoe && st.renderer && st.scene && st.camera) {
          if (interactive === "hover-rotate") {
            if (st.isHovered) {
              st.targetRotationY += spinSpeed * 0.9;
            } else {
              st.targetRotationY += spinSpeed * 0.18;
            }
          } else if (interactive === "idle-rotate") {
            st.targetRotationY += spinSpeed * 0.35;
          } else if (interactive === "hover-tilt") {
            st.targetRotationY += spinSpeed * 0.14;
          }

          st.rotationY += (st.targetRotationY - st.rotationY) * Math.min(1, dt * 8);
          st.shoe.rotation.y = st.rotationY;
          st.shoe.rotation.x = THREE.MathUtils.lerp(st.shoe.rotation.x, st.tiltX * tiltStrength, Math.min(1, dt * 10));
          st.shoe.rotation.z = THREE.MathUtils.lerp(st.shoe.rotation.z, st.tiltZ * tiltStrength, Math.min(1, dt * 10));

          st.bob += dt * (st.isHovered ? 2.6 : 1.3);
          const bob = Math.sin(st.bob * 2.2) * (st.isHovered ? 0.032 : 0.014);
          st.shoe.position.y = st.baseY + bob;

          if (frameCount % 12 === 0) {
            setRotationDeg(Math.round(((st.rotationY * 180) / Math.PI) % 360));
          }
          frameCount++;

          st.renderer.render(st.scene, st.camera);
        }
        st.rafId = requestAnimationFrame(tick);
      };
      st.rafId = requestAnimationFrame(tick);

      const handleMouseEnter = () => {
        stateRef.current.isHovered = true;
        forceTick((v) => v + 1);
      };
      const handleMouseLeave = () => {
        const s = stateRef.current;
        s.isHovered = false;
        s.tiltX = 0;
        s.tiltZ = 0;
        forceTick((v) => v + 1);
      };
      const handleMouseMove = (e: React.MouseEvent) => {
        const r = root.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        stateRef.current.tiltZ = -nx * 0.18;
        stateRef.current.tiltX = ny * 0.14;
      };
      root.addEventListener("mouseenter", handleMouseEnter);
      root.addEventListener("mouseleave", handleMouseLeave);
      root.addEventListener("mousemove", handleMouseMove as unknown as EventListener);

      return () => {
        cancelAnimationFrame(st.rafId);
        intersectionObserver.disconnect();
        resizeObserver?.disconnect();
        root.removeEventListener("mouseenter", handleMouseEnter);
        root.removeEventListener("mouseleave", handleMouseLeave);
        root.removeEventListener("mousemove", handleMouseMove as unknown as EventListener);

        try {
          shoe.dispose?.();
        } catch {
          /* noop */
        }
        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            (mesh.geometry as THREE.BufferGeometry | undefined)?.dispose?.();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => (m as THREE.Material).dispose?.());
            } else {
              (mesh.material as THREE.Material | undefined)?.dispose?.();
            }
          }
        });
        renderer.dispose();
        if (renderer.domElement) {
          const dom = renderer.domElement;
          dom.parentElement?.removeChild(dom);
        }
        st.mounted = false;
        st.renderer = null;
        st.scene = null;
        st.camera = null;
        st.shoe = null;
        st.resizeObserver = null;
        st.rafId = 0;
      };
    } catch (e) {
      // Silent graceful fallback to CSS silhouette if WebGL fails on any card
      // (avoids exploding a grid of 8+ cards on old integrated GPUs).
      forceTick((v) => v + 1);
      return () => {
        /* no cleanup */
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, tiltStrength, spinSpeed, aspectRatio]);

  const rotationDegrees = ((rotationDeg % 360) + 360) % 360;

  return (
    <div
      ref={containerRef}
      data-interactive-3d="card"
      className={[
        "relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#fff8e8_0%,#f7e9c6_100%)]",
        "border border-[var(--theme-color-border)]",
        "focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:ring-offset-2 focus-within:ring-offset-[var(--theme-color-bg)]",
        className ?? ""
      ].join(" ")}
      role="img"
      aria-label={`${label}. Rotation: ${rotationDegrees}°. Accent: ${accent}. Hover for interactive rotation.`}
      style={{ aspectRatio: `${aspectRatio} / 1` }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full select-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(212,175,55,0.28)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-white/80 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8a6a1a] shadow-sm backdrop-blur"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-[#D4AF37]" /> 3D Live
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 rounded-full border border-[#D4AF37]/40 bg-white/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a6a1a] shadow-sm backdrop-blur"
      >
        {accent}
      </div>
    </div>
  );
}
