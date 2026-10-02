"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Layers, Scissors, ShieldCheck, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import * as THREE from "three";
import { StorefrontTiltCard } from "../storefront/StorefrontTiltCard";
import {
  ProceduralPunjabiJutti,
  createStudioScene,
  type AccentSwatchName
} from "@/components/three/ProceduralPunjabiJutti";

type CraftBeatAccent = "crimson" | "ivory" | "emerald" | "sapphire";
type CraftBeat = {
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  accent: CraftBeatAccent;
  rotationY: number;
  cameraDistance: number;
  cameraHeight: number;
  sequinBoost: number;
  upperScaleZ: number;
  zariOpacity: number;
  badgeChip: string;
};

const craftBeats: CraftBeat[] = [
  {
    step: "01",
    title: "Raw Vegetable-Tanned Leather",
    subtitle: "Anatomical Sole Foundation",
    desc: "Every pair begins with premium vegetable-tanned leather from heritage tanneries. Molded to adapt naturally to your foot's unique contours over years of wear.",
    icon: ShieldCheck,
    tag: "Beat 1: Tanning & Moulding",
    accent: "ivory",
    rotationY: 0.6,
    cameraDistance: 5.2,
    cameraHeight: 0.2,
    sequinBoost: 0.0,
    upperScaleZ: 0.78,
    zariOpacity: 0.08,
    badgeChip: "Sole Focus"
  },
  {
    step: "02",
    title: "Double Velvet Arch Cushioning",
    subtitle: "Ergonomic Arch Soles",
    desc: "Layered beneath rich silk velvet, our dual-density memory arch insert is shaped for royal comfort even through 12-hour wedding rituals.",
    icon: Layers,
    tag: "Beat 2: Ergonomic Arch",
    accent: "sapphire",
    rotationY: 0.05,
    cameraDistance: 4.1,
    cameraHeight: 0.35,
    sequinBoost: 0.2,
    upperScaleZ: 1.0,
    zariOpacity: 0.22,
    badgeChip: "Arch Inset"
  },
  {
    step: "03",
    title: "Artisanal Zari & Dabka Embroidery",
    subtitle: "Needlework by Punjabi Artisans",
    desc: "Stitched thread-by-thread using metallic gold zari yarn, cut-dana beads, and hand-sequined dabka work — each pair requires 28+ hours of hand embroidery.",
    icon: Scissors,
    tag: "Beat 3: Hand Embroidery",
    accent: "emerald",
    rotationY: -0.45,
    cameraDistance: 3.55,
    cameraHeight: 0.55,
    sequinBoost: 1.0,
    upperScaleZ: 1.0,
    zariOpacity: 1.0,
    badgeChip: "Zari Live"
  },
  {
    step: "04",
    title: "Heritage Fitting & Beeswax Polish",
    subtitle: "Custom Boutique Finishing",
    desc: "Finished with natural beeswax conditioning, boutique-level buckle detailing, and hand-checked for perfection before being wrapped in luxury heritage presentation boxes.",
    icon: Award,
    tag: "Beat 4: Final Inspection",
    accent: "crimson",
    rotationY: -1.1,
    cameraDistance: 4.6,
    cameraHeight: 0.3,
    sequinBoost: 1.0,
    upperScaleZ: 1.0,
    zariOpacity: 1.0,
    badgeChip: "Ready"
  }
];

const ACCENT_HEX: Record<CraftBeatAccent, number> = {
  ivory: 0xf5ead1,
  sapphire: 0x1e3a8a,
  emerald: 0x0f766e,
  crimson: 0x8a1538
};

export function CraftsmanshipScrollStory() {
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const currentBeat = craftBeats[activeBeatIndex];
  const IconComponent = currentBeat.icon;

  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beatIndexRef = useRef(activeBeatIndex);
  useEffect(() => {
    beatIndexRef.current = activeBeatIndex;
  }, [activeBeatIndex]);

  const activeAccentName: AccentSwatchName = useMemo(
    () => currentBeat.accent as AccentSwatchName,
    [currentBeat.accent]
  );

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { scene, camera, renderer } = createStudioScene(canvas, {
      clearColor: 0xfbf3dc,
      floorVisible: true,
      floorOpacity: 0.28,
      fov: 38,
      cameraDistance: currentBeat.cameraDistance,
      cameraHeight: currentBeat.cameraHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      exposure: 1.08
    });

    const shoe = new ProceduralPunjabiJutti();
    scene.add(shoe);

    let rafId = 0;
    let isIntersecting = false;
    let bob = 0;
    let lastFrameAt = performance.now();
    const initialRect = wrap.getBoundingClientRect();
    const initialW = Math.max(1, initialRect.width || 640);
    const initialH = Math.max(1, initialRect.height || initialW);
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

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const targetBeatParams = () => craftBeats[beatIndexRef.current];

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - lastFrameAt) / 1000);
      lastFrameAt = now;
      if (isIntersecting) {
        const target = targetBeatParams();
        const accentHex = ACCENT_HEX[target.accent];
        try {
          shoe.setBodyAccentColor(accentHex);
        } catch {
          /* noop */
        }
        shoe.rotation.y = lerp(shoe.rotation.y, target.rotationY, Math.min(1, dt * 2.6));
        shoe.scale.z = lerp(shoe.scale.z, target.upperScaleZ, Math.min(1, dt * 3.2));
        bob += dt * 1.3;
        shoe.position.y = lerp(shoe.position.y, -0.12 + Math.sin(bob * 1.8) * 0.02, Math.min(1, dt * 6));
        camera.position.z = lerp(camera.position.z, target.cameraDistance, Math.min(1, dt * 1.8));
        camera.position.y = lerp(camera.position.y, target.cameraHeight, Math.min(1, dt * 1.8));
        camera.lookAt(0, 0.05, 0);

        const zari = scene.children.find((c: any) => c.name === "zari-lattice") as THREE.Object3D | undefined;
        if (zari) {
          zari.traverse((obj: any) => {
            if (obj.isMesh || obj.isLineSegments) {
              const mat = obj.material as THREE.Material | THREE.Material[] | undefined;
              if (Array.isArray(mat)) {
                for (const m of mat) {
                  if ('opacity' in m) {
                    (m as any).opacity = lerp((m as any).opacity, target.zariOpacity, Math.min(1, dt * 3.5));
                    (m as any).transparent = true;
                  }
                }
              } else if (mat && 'opacity' in mat) {
                (mat as any).opacity = lerp((mat as any).opacity, target.zariOpacity, Math.min(1, dt * 3.5));
                (mat as any).transparent = true;
              }
            }
          });
        }

        const sequins = scene.children.find((c: any) => c.name === "sequins") as THREE.InstancedMesh | undefined;
        if (sequins) {
          const mat = sequins.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) {
            for (const m of mat) {
              if ('opacity' in m) {
                (m as any).opacity = lerp((m as any).opacity, target.sequinBoost, Math.min(1, dt * 3.2));
                (m as any).transparent = true;
              }
            }
          } else if (mat && 'opacity' in mat) {
            (mat as any).opacity = lerp((mat as any).opacity, target.sequinBoost, Math.min(1, dt * 3.2));
            (mat as any).transparent = true;
          }
        }

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="py-24 bg-[var(--theme-color-bg)] text-[var(--theme-color-text)] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--theme-color-surface)] text-[var(--theme-color-accent)] text-xs uppercase tracking-widest font-semibold border border-[var(--theme-color-border)] rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-[var(--theme-color-accent)]" />
            <span>Signature Craftsmanship Story</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--theme-color-text)]">
            How a Royal Jutti is Born
          </h2>

          <p className="text-[var(--theme-color-text-muted)] text-sm md:text-base leading-relaxed font-light">
            Step through 4 authentic beats of handcrafted Punjabi footwear creation — the 3D scene on the right shifts camera, colour, and embroidery intensity with every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div role="radiogroup" aria-label="Craftsmanship story beat" className="space-y-4">
              {craftBeats.map((beat, idx) => (
                <button
                  key={beat.step}
                  role="radio"
                  aria-checked={activeBeatIndex === idx}
                  onClick={() => setActiveBeatIndex(idx)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-color-bg)] ${
                    activeBeatIndex === idx
                      ? "bg-[var(--theme-color-surface)] border-[var(--theme-color-accent)] shadow-xl scale-[1.02]"
                      : "bg-[var(--theme-color-surface)]/60 border-[var(--theme-color-border)] hover:border-[var(--theme-color-accent)]/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-serif text-xl font-bold ${activeBeatIndex === idx ? "text-[var(--theme-color-accent)]" : "text-[var(--theme-color-text-muted)]"}`}>
                      {beat.step}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--theme-color-accent)] block">
                        {beat.tag}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[var(--theme-color-text)]">
                        {beat.title}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeBeatIndex === idx ? "bg-[var(--theme-color-jewel)] text-white" : "bg-[var(--theme-color-bg)] text-[var(--theme-color-text-muted)]"}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <StorefrontTiltCard className="bg-[var(--theme-color-surface)] border border-[var(--theme-color-border)] rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6">
              <div
                ref={canvasWrapRef}
                role="img"
                aria-label={`Craftsmanship stage ${currentBeat.step}: ${currentBeat.title}. Interactive 3D Punjabi Jutti preview evolves accent, camera, and embroidery as you change stages.`}
                className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-[var(--theme-color-border)] shadow-inner group focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:ring-offset-2 focus-within:ring-offset-[var(--theme-color-surface)]"
                tabIndex={0}
              >
                <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full select-none" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.58)_100%)]" />
                <div aria-hidden className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/60 bg-white/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8a6a1a] shadow-sm backdrop-blur">
                  <span className="block h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Craft Stage · {currentBeat.step}
                </div>
                <div aria-hidden className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#D4AF37]/40 bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a6a1a] shadow-sm backdrop-blur">
                  {currentBeat.badgeChip}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{currentBeat.subtitle}</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold">{currentBeat.title}</h3>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[var(--theme-color-accent)]">
                  <IconComponent className="w-4 h-4 text-[var(--theme-color-jewel)]" />
                  <span>{currentBeat.tag}</span>
                </div>
                <p className="text-sm md:text-base text-[var(--theme-color-text-muted)] leading-relaxed font-light">
                  {currentBeat.desc}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-color-jewel)] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all border border-[var(--theme-color-border)] shadow-md"
                  >
                    Explore Heritage Artistry <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-sm"
                    style={{
                      backgroundColor: `#${ACCENT_HEX[currentBeat.accent].toString(16).padStart(6, "0")}`,
                      color: currentBeat.accent === "ivory" ? "#3b2f0a" : "#fff",
                      borderColor: "rgba(212,175,55,0.5)"
                    }}
                  >
                    Live accent · {activeAccentName}
                  </span>
                </div>
              </div>
            </StorefrontTiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

