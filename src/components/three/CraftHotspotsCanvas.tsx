"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";
import {
  FOOTWEAR_DESIGN_TOKENS,
  ProceduralPunjabiJutti,
  createStudioScene,
  type AccentSwatchName,
} from "./ProceduralPunjabiJutti";

export interface CraftHotspot {
  id: number;
  /** Local 3D position inside the shoe group (before group transform). */
  local3DPos: [number, number, number];
  title: string;
  description: string;
  accent: AccentSwatchName;
  icon: React.ComponentType<{ className?: string }>;
}

export interface CraftHotspotsCanvasProps {
  accent?: AccentSwatchName;
  aspectRatio?: number;
  className?: string;
}

const HOTSPOTS: CraftHotspot[] = [
  {
    id: 1,
    local3DPos: [0, 0.28, 0.3],
    title: "Hand Zari & Dabka Sequin Work",
    description:
      "Stitched thread-by-thread by master Punjabi artisans with metallic gold zari yarn. Each pair requires 28+ hours of hand embroidery.",
    accent: "crimson",
    icon: Sparkles,
  },
  {
    id: 2,
    local3DPos: [0.02, 0.18, -0.02],
    title: "Double-Padded Velvet Cushioning",
    description:
      "Layered beneath rich silk velvet, our dual-density memory arch insert is shaped for royal comfort even through 12-hour wedding rituals.",
    accent: "emerald",
    icon: Layers,
  },
  {
    id: 3,
    local3DPos: [0, -0.01, 0.0],
    title: "Genuine Vegetable-Tanned Leather Sole",
    description:
      "Flexible, breathable vegetable-tanned leather sole that molds naturally to your foot's unique contours over years of wear.",
    accent: "sapphire",
    icon: ShieldCheck,
  },
  {
    id: 4,
    local3DPos: [0.0, 0.3, 0.0],
    title: "Jasmine-Petal Toe Cap with Clearcoat",
    description:
      "Glossy jasmine-petal toe panel with hand-finished beeswax clearcoat for a boutique-quality sheen that catches light beautifully.",
    accent: "rose",
    icon: CheckCircle2,
  },
];

export function CraftHotspotsCanvas({
  accent = "crimson",
  aspectRatio = 16 / 10,
  className,
}: CraftHotspotsCanvasProps) {
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const activeAccentRef = useRef<AccentSwatchName>(accent);

  const [activeHotspotId, setActiveHotspotId] = useState<number | null>(null);
  const [hotspotScreenPts, setHotspotScreenPts] = useState<
    Record<number, { x: number; y: number; visible: boolean }>
  >({});

  const activeHotspot = useMemo(
    () => HOTSPOTS.find((h) => h.id === activeHotspotId) ?? null,
    [activeHotspotId]
  );

  useEffect(() => {
    activeAccentRef.current = accent;
  }, [accent]);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!wrap || !canvas || !overlay) return;

    const { scene, camera, renderer } = createStudioScene(canvas, {
      clearColor: 0xfbf3dc,
      floorVisible: true,
      floorOpacity: 0.3,
      fov: 34,
      cameraDistance: 4.9,
      cameraHeight: 0.5,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      exposure: 1.08,
    });

    const shoe = new ProceduralPunjabiJutti({ scale: 2.6 });
    const accentHex = FOOTWEAR_DESIGN_TOKENS.accentSwatches[activeAccentRef.current];
    if (typeof accentHex === "number") {
      try {
        shoe.setBodyAccentColor(accentHex);
      } catch {
        /* noop */
      }
    }
    shoe.position.y = 0.04;
    shoe.rotation.y = 0.35;
    scene.add(shoe);

    let rafId = 0;
    let isIntersecting = false;
    let isHovering = false;
    let lastFrameAt = performance.now();
    let bobT = 0;
    const baseRot = 0.35;
    const tmpV = new THREE.Vector3();
    const hotspotWorldPts: Record<number, THREE.Vector3> = {};
    for (const h of HOTSPOTS) {
      hotspotWorldPts[h.id] = new THREE.Vector3(
        h.local3DPos[0],
        h.local3DPos[1],
        h.local3DPos[2]
      );
    }

    const rect = wrap.getBoundingClientRect();
    const initialW = Math.max(1, rect.width || 640);
    const initialH = Math.max(1, rect.height || initialW / aspectRatio);
    renderer.setSize(initialW, initialH, false);
    camera.aspect = initialW / initialH;
    camera.updateProjectionMatrix();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (!width || !height) continue;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(wrap);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isIntersecting = entry.isIntersecting;
        }
      },
      { root: null, threshold: 0.05 }
    );
    intersectionObserver.observe(wrap);

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotY = baseRot;
    let rotX = 0;
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotY += dx * 0.015;
      rotX = Math.max(-0.5, Math.min(0.5, rotX + dy * 0.012));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onEnter = () => {
      isHovering = true;
    };
    const onLeave = () => {
      isHovering = false;
      isDragging = false;
    };
    wrap.addEventListener("pointerdown", onPointerDown);
    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerup", onPointerUp);
    wrap.addEventListener("pointercancel", onPointerUp);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - lastFrameAt) / 1000);
      lastFrameAt = now;
      if (isIntersecting) {
        bobT += dt * (isHovering ? 1.9 : 1.25);
        if (!isDragging) {
          rotY += 0.004;
        }
        shoe.rotation.y = lerp(shoe.rotation.y, rotY, Math.min(1, dt * 10));
        shoe.rotation.x = lerp(shoe.rotation.x, rotX, Math.min(1, dt * 10));
        shoe.position.y = 0.04 + Math.sin(bobT * 1.8) * 0.012;
        renderer.render(scene, camera);

        // Project each hotspot local pos → normalized device coords → screen px
        const overlayRect = overlay.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const newPts: Record<number, { x: number; y: number; visible: boolean }> = {};
        for (const h of HOTSPOTS) {
          const local = hotspotWorldPts[h.id];
          tmpV.copy(local);
          shoe.updateMatrixWorld(true);
          tmpV.applyMatrix4(shoe.matrixWorld);
          tmpV.project(camera);
          const visible = tmpV.z < 1;
          const relX = (tmpV.x + 1) / 2;
          const relY = 1 - (tmpV.y + 1) / 2;
          const px =
            wrapRect.left - overlayRect.left + relX * wrapRect.width;
          const py =
            wrapRect.top - overlayRect.top + relY * wrapRect.height;
          newPts[h.id] = { x: px, y: py, visible };
        }
        setHotspotScreenPts((prev) => {
          // shallow-ish compare to skip identical frames
          for (const id of Object.keys(newPts).map(Number)) {
            const a = prev[id];
            const b = newPts[id];
            if (
              !a ||
              Math.abs(a.x - b.x) > 0.5 ||
              Math.abs(a.y - b.y) > 0.5 ||
              a.visible !== b.visible
            ) {
              return newPts;
            }
          }
          return prev;
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      wrap.removeEventListener("pointerdown", onPointerDown);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerup", onPointerUp);
      wrap.removeEventListener("pointercancel", onPointerUp);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
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
    };
  }, [aspectRatio]);

  return (
    <div
      ref={canvasWrapRef}
      className={[
        "relative isolate overflow-hidden rounded-2xl border border-[var(--theme-color-border)] shadow-xl",
        className ?? "",
      ].join(" ")}
      role="img"
      aria-label="Craftsmanship 3D dissection: interactive Punjabi Jutti with clickable hotspots on zari embroidery, velvet arch cushioning, leather sole, and glossy toe cap."
      style={{ aspectRatio: `${aspectRatio}` }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full select-none bg-[#fbf3dc]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent_0%,rgba(212,175,55,0.28)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8a6a1a] shadow-sm backdrop-blur"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
        Craft Anatomy · Live 3D
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 rounded-full border border-[#D4AF37]/40 bg-white/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a6a1a] shadow-sm backdrop-blur"
      >
        4 Hotspots
      </div>

      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {HOTSPOTS.map((h) => {
          const pt = hotspotScreenPts[h.id];
          if (!pt || !pt.visible) return null;
          const isActive = activeHotspotId === h.id;
          const accentHex =
            FOOTWEAR_DESIGN_TOKENS.accentSwatches[h.accent] ?? 0x8a1538;
          return (
            <button
              key={h.id}
              role="button"
              aria-haspopup="dialog"
              aria-expanded={isActive}
              aria-label={`${h.title} — click to open detail`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspotId(isActive ? null : h.id);
              }}
              style={{
                left: `${pt.x}px`,
                top: `${pt.y}px`,
                backgroundColor: `#${accentHex.toString(16).padStart(6, "0")}`,
              }}
              className={[
                "pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xl border-2 border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 transition-transform",
                isActive ? "scale-125 animate-pulse" : "hover:scale-110",
              ].join(" ")}
            >
              {h.id}
            </button>
          );
        })}

        <AnimatedHotspotCard hotspot={activeHotspot} onClose={() => setActiveHotspotId(null)} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest"
      >
        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
        Tap pins to explore craftsmanship layers
      </div>
    </div>
  );
}

function AnimatedHotspotCard({
  hotspot,
  onClose,
}: {
  hotspot: CraftHotspot | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  const Icon = hotspot?.icon ?? Sparkles;
  const accentHex = hotspot
    ? FOOTWEAR_DESIGN_TOKENS.accentSwatches[hotspot.accent] ?? 0x8a1538
    : 0x8a1538;
  return (
    <div
      className={[
        "pointer-events-none absolute inset-x-4 bottom-12 transition-all duration-300 ease-out",
        hotspot ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
    >
      {hotspot ? (
        <div
          className="pointer-events-auto rounded-2xl border border-white/20 bg-black/80 backdrop-blur-xl text-white p-5 shadow-2xl space-y-3"
          role="dialog"
          aria-label={`Craftsmanship hotspot: ${hotspot.title}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: `#${accentHex.toString(16).padStart(6, "0")}`,
                }}
              >
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  Craft Hotspot · {hotspot.id}
                </p>
                <h4 className="font-serif text-lg font-bold leading-snug">
                  {hotspot.title}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close hotspot card"
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              ✕
            </button>
          </div>
          <p className="text-[13px] text-white/80 leading-relaxed font-light">
            {hotspot.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
