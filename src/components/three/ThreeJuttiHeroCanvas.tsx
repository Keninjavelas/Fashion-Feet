"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Rotate3d,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Lightbulb,
  Eye,
} from "lucide-react";
import {
  FOOTWEAR_DESIGN_TOKENS,
  ProceduralPunjabiJutti,
  createStudioScene,
  type AccentSwatchName,
  type StudioSceneOptions,
} from "./ProceduralPunjabiJutti";
import * as THREE from "three";

export interface ThreeJuttiHeroCanvasProps {
  accent?: AccentSwatchName | number;
  aspectRatio?: number;
  compact?: boolean;
  lockAutoRotate?: boolean;
  className?: string;
  showControls?: boolean;
}

type LightingPreset = "studio" | "warm-gold" | "royal-crimson" | "cool-white";
type ViewPreset = "front" | "three-quarter" | "side" | "top" | "sole";

const LIGHTING_PRESETS: Record<
  LightingPreset,
  {
    name: string;
    ambient: [number, number];
    key: [number, number, [number, number, number]];
    rim: [number, number, [number, number, number]];
    fill: [number, number, number, [number, number, number]];
    clearColor?: number;
    exposure: number;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  studio: {
    name: "Studio",
    ambient: [FOOTWEAR_DESIGN_TOKENS.goldZari, 0.35],
    key: [0xffffff, 0.95, [3, 5, 2]],
    rim: [FOOTWEAR_DESIGN_TOKENS.goldZariSoft, 0.7, [-4, 2, -3]],
    fill: [FOOTWEAR_DESIGN_TOKENS.velvetCrimson, 0.42, 15, [0, 1.5, 2]],
    exposure: 1.05,
    icon: Sun,
  },
  "warm-gold": {
    name: "Warm Gold",
    ambient: [0xffd700, 0.55],
    key: [0xfff2b2, 1.1, [2.5, 4.5, 3]],
    rim: [0xff8c42, 0.85, [-3.5, 2.5, -2.5]],
    fill: [0xd4af37, 0.6, 18, [0.5, 2, 2.5]],
    clearColor: 0x1a0f06,
    exposure: 1.12,
    icon: Sparkles,
  },
  "royal-crimson": {
    name: "Royal Crimson",
    ambient: [0x4a0c1b, 0.6],
    key: [0xffffff, 0.85, [4, 3.5, 1.5]],
    rim: [0xff6b9d, 0.75, [-3, 3, -2]],
    fill: [0x8a1538, 0.75, 16, [-0.5, 1.8, 3]],
    clearColor: 0x0f0508,
    exposure: 1.02,
    icon: Lightbulb,
  },
  "cool-white": {
    name: "Cool White",
    ambient: [0xe0e7ff, 0.4],
    key: [0xffffff, 1.15, [3.5, 5.5, 2.5]],
    rim: [0xc7d2fe, 0.8, [-3.5, 2, -3]],
    fill: [0x6366f1, 0.35, 14, [0, 1.6, 2]],
    clearColor: 0x0b0d12,
    exposure: 1.08,
    icon: Eye,
  },
};

const VIEW_PRESETS: Record<
  ViewPreset,
  { label: string; cameraPos: [number, number, number]; lookAt: [number, number, number]; shoeRot: [number, number, number] }
> = {
  front: {
    label: "Front",
    cameraPos: [0, 0.38, 4.2],
    lookAt: [0, 0.08, 0],
    shoeRot: [0, 0, 0],
  },
  "three-quarter": {
    label: "3/4",
    cameraPos: [2.2, 0.55, 3.8],
    lookAt: [0, 0.1, 0],
    shoeRot: [0, -0.55, 0],
  },
  side: {
    label: "Side",
    cameraPos: [3.9, 0.35, 0.8],
    lookAt: [0, 0.08, 0],
    shoeRot: [0, -Math.PI / 2, 0],
  },
  top: {
    label: "Top",
    cameraPos: [0, 4.1, 1.5],
    lookAt: [0, 0, 0.2],
    shoeRot: [-0.15, 0.35, 0],
  },
  sole: {
    label: "Sole",
    cameraPos: [0.8, -2.2, 3.0],
    lookAt: [0, -0.15, 0],
    shoeRot: [0.95, -0.3, 0],
  },
};

export function ThreeJuttiHeroCanvas({
  accent,
  aspectRatio = 4 / 3,
  compact = false,
  lockAutoRotate = false,
  className,
  showControls = true,
}: ThreeJuttiHeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shoeRef = useRef<ProceduralPunjabiJutti | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    key: THREE.DirectionalLight;
    rim: THREE.DirectionalLight;
    fill: THREE.PointLight;
  } | null>(null);

  const [rotationY, setRotationY] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(!lockAutoRotate);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>("studio");
  const [viewPreset, setViewPreset] = useState<ViewPreset | null>(null);

  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);
  const rotationXRef = useRef(0);
  const targetCamPos = useRef<[number, number, number] | null>(null);
  const targetLookAt = useRef<[number, number, number] | null>(null);
  const targetShoeRot = useRef<[number, number, number] | null>(null);

  const rotationYRef = useRef(rotationY);
  const isDraggingRef = useRef(isDragging);
  const zoomRef = useRef(zoom);
  const autoRotateRef = useRef(autoRotate);
  const lightingPresetRef = useRef(lightingPreset);

  function applyLightingPreset(name: LightingPreset) {
    const lights = lightsRef.current;
    const renderer = rendererRef.current;
    if (!lights || !renderer) return;
    const preset = LIGHTING_PRESETS[name];
    lights.ambient.color.setHex(preset.ambient[0]);
    lights.ambient.intensity = preset.ambient[1];
    lights.key.color.setHex(preset.key[0]);
    lights.key.intensity = preset.key[1];
    lights.key.position.set(...preset.key[2]);
    lights.rim.color.setHex(preset.rim[0]);
    lights.rim.intensity = preset.rim[1];
    lights.rim.position.set(...preset.rim[2]);
    lights.fill.color.setHex(preset.fill[0]);
    lights.fill.intensity = preset.fill[1];
    lights.fill.distance = preset.fill[2];
    lights.fill.position.set(...preset.fill[3]);
    renderer.toneMappingExposure = preset.exposure;
    if (preset.clearColor !== undefined) {
      renderer.setClearColor(preset.clearColor, 1);
    }
  }

  useEffect(() => {
    rotationYRef.current = rotationY;
  }, [rotationY]);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  useEffect(() => {
    lightingPresetRef.current = lightingPreset;
    applyLightingPreset(lightingPreset);
  }, [lightingPreset]);

  useEffect(() => {
    if (viewPreset === null) return;
    const view = VIEW_PRESETS[viewPreset];
    targetCamPos.current = view.cameraPos;
    targetLookAt.current = view.lookAt;
    targetShoeRot.current = view.shoeRot;
    setRotationY(view.shoeRot[1]);
    const t = setTimeout(() => {
      targetCamPos.current = null;
      targetLookAt.current = null;
      targetShoeRot.current = null;
    }, 1400);
    return () => clearTimeout(t);
  }, [viewPreset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const studioOpts: StudioSceneOptions = {
      fov: 35,
      cameraDistance: 4.2,
      cameraHeight: 0.4,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      exposure: 1.05,
    };
    const { renderer, scene, camera, resize, dispose: disposeStudio } = createStudioScene(canvas, studioOpts);
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    const ambient = scene.children.find((c) => c instanceof THREE.AmbientLight) as THREE.AmbientLight | undefined;
    const dirLights = scene.children.filter((c) => c instanceof THREE.DirectionalLight) as THREE.DirectionalLight[];
    const key = dirLights[0];
    const rim = dirLights[1];
    const fill = scene.children.find((c) => c instanceof THREE.PointLight) as THREE.PointLight | undefined;
    if (ambient && key && rim && fill) {
      lightsRef.current = { ambient, key, rim, fill };
    }

    const shoe = new ProceduralPunjabiJutti({ scale: 2.6 });
    shoe.position.set(0, 0.04, 0);
    shoe.rotation.y = rotationYRef.current;
    scene.add(shoe);
    shoeRef.current = shoe;

    applyAccentToShoe(shoe, accent);

    let rafId = 0;
    let bobT = 0;
    const baseCamPos = new THREE.Vector3().copy(camera.position);
    const baseLookAt = new THREE.Vector3(0, 0.1, 0);
    const tmpLookAt = new THREE.Vector3();

    const loop = () => {
      const shoe = shoeRef.current;
      const cam = cameraRef.current;
      if (shoe && cam && sceneRef.current && rendererRef.current) {
        bobT += 1;
        if (!isDraggingRef.current && autoRotateRef.current && targetShoeRot.current === null) {
          shoe.rotation.y += 0.006;
          rotationYRef.current = shoe.rotation.y;
        } else {
          shoe.rotation.y = rotationYRef.current;
        }
        shoe.rotation.x = rotationXRef.current;
        if (targetShoeRot.current) {
          const [rx, ry, rz] = targetShoeRot.current;
          shoe.rotation.x = THREE.MathUtils.lerp(shoe.rotation.x, rx, 0.08);
          shoe.rotation.y = THREE.MathUtils.lerp(shoe.rotation.y, ry, 0.08);
          shoe.rotation.z = THREE.MathUtils.lerp(shoe.rotation.z, rz, 0.08);
        } else {
          shoe.rotation.z = THREE.MathUtils.lerp(shoe.rotation.z, 0, 0.08);
        }
        const baseBob = Math.sin(bobT / 56) * 0.012;
        const hoverBob = autoRotateRef.current ? 0 : Math.sin(bobT / 40) * 0.004;
        shoe.position.y = 0.04 + baseBob + hoverBob;

        const zoomFactor = 1 / zoomRef.current;
        const desiredPos = baseCamPos.clone().multiplyScalar(zoomFactor);
        if (targetCamPos.current) {
          cam.position.x = THREE.MathUtils.lerp(cam.position.x, targetCamPos.current[0], 0.08);
          cam.position.y = THREE.MathUtils.lerp(cam.position.y, targetCamPos.current[1], 0.08);
          cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetCamPos.current[2], 0.08);
        } else {
          cam.position.lerp(desiredPos, 0.12);
        }
        if (targetLookAt.current) {
          tmpLookAt.set(...targetLookAt.current);
          baseLookAt.lerp(tmpLookAt, 0.08);
        } else {
          baseLookAt.lerp(new THREE.Vector3(0, 0.1, 0), 0.12);
        }
        cam.lookAt(baseLookAt);
        rendererRef.current.render(sceneRef.current, cam);
      }
      rafId = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1.08 : 0.92;
      const next = Math.max(0.6, Math.min(1.9, zoomRef.current * delta));
      zoomRef.current = next;
      setZoom(next);
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("wheel", handleWheel);
      ro.disconnect();
      if (shoe) {
        scene.remove(shoe);
        shoe.dispose();
      }
      disposeStudio();
      shoeRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      lightsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const shoe = shoeRef.current;
    if (!shoe) return;
    applyAccentToShoe(shoe, accent);
  }, [accent]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setViewPreset(null);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastPointerX.current;
    const deltaY = e.clientY - lastPointerY.current;
    setRotationY((prev) => prev + deltaX * 0.015);
    rotationXRef.current = Math.max(-0.55, Math.min(0.55, rotationXRef.current + deltaY * 0.01));
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released on leave */
    }
  };

  const resetView = () => {
    setZoom(1);
    zoomRef.current = 1;
    setRotationY(0.5);
    rotationYRef.current = 0.5;
    rotationXRef.current = 0;
    setViewPreset(null);
    setAutoRotate(!lockAutoRotate);
    setLightingPreset("studio");
  };

  const degrees = Math.round(((rotationY * 180) / Math.PI) % 360);

  const renderControls = !compact && showControls;

  return (
    <div
      role="img"
      aria-label={`Interactive 3D preview of a Punjabi Jutti — royal crimson velvet with gold zari embroidery and leather sole. Rotation ${degrees} degrees. Zoom level ${Math.round(zoom * 100)}%. Lighting: ${LIGHTING_PRESETS[lightingPreset].name}. ${isDragging ? 'Being dragged.' : 'Tap and drag to rotate 360 degrees. Scroll or use + / - to zoom.'}`}
      className={[
        'relative w-full bg-gradient-to-br from-black/80 via-[#1C1412] to-black/90 border border-[#D4AF37]/30 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing group focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60',
        className ?? '',
      ].join(' ')}
      style={{ aspectRatio: String(aspectRatio), borderRadius: compact ? 20 : 24 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />

      {compact ? null : (
        <>
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold border border-[#D4AF37]/30 shadow z-10">
            <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '8s' }} />
            <span>360° Interactive 3D Inspection</span>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-white/70 text-[10px] uppercase font-bold tracking-widest border border-white/10 group-hover:text-[#D4AF37] transition-colors pointer-events-none inline-flex items-center gap-2 z-10">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" aria-hidden="true" />
            Drag to rotate · Scroll to zoom
          </div>
        </>
      )}

      {renderControls && (
        <>
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <div className="flex flex-col gap-1.5 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(1.9, zoom * 1.15);
                  setZoom(next);
                  zoomRef.current = next;
                }}
                aria-label="Zoom in on 3D model"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(0.6, zoom / 1.15);
                  setZoom(next);
                  zoomRef.current = next;
                }}
                aria-label="Zoom out from 3D model"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-px bg-white/10 my-0.5" />
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                aria-pressed={autoRotate}
                aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 ${
                  autoRotate ? "text-[#D4AF37] bg-[#D4AF37]/15" : "text-white/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                }`}
                title={autoRotate ? "Pause auto-rotate" : "Start auto-rotate"}
              >
                <Rotate3d className={`w-4 h-4 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset view, zoom and lighting"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-16 right-4 z-20 flex flex-col gap-1.5 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-1.5 shadow-lg">
            {(Object.keys(LIGHTING_PRESETS) as LightingPreset[]).map((name) => {
              const preset = LIGHTING_PRESETS[name];
              const Icon = preset.icon;
              const active = lightingPreset === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setLightingPreset(name)}
                  aria-pressed={active}
                  aria-label={`${preset.name} lighting preset`}
                  title={preset.name}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 ${
                    active ? "text-[#D4AF37] bg-[#D4AF37]/15 scale-105" : "text-white/55 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div role="group" aria-label="Preset camera angles" className="absolute bottom-16 left-4 z-20 flex flex-wrap gap-1.5 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-1.5 shadow-lg max-w-[60%]">
            {(Object.keys(VIEW_PRESETS) as ViewPreset[]).map((name) => {
              const view = VIEW_PRESETS[name];
              const active = viewPreset === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setViewPreset(name)}
                  aria-pressed={active}
                  aria-label={`Jump to ${view.label} camera view`}
                  className={`px-2.5 h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 ${
                    active
                      ? "text-black bg-[#D4AF37] shadow-md"
                      : "text-white/60 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function applyAccentToShoe(
  shoe: ProceduralPunjabiJutti,
  accent: AccentSwatchName | number | undefined
): void {
  if (typeof accent === "number") {
    shoe.setBodyAccentColor(accent);
  } else if (typeof accent === "string") {
    const hex = FOOTWEAR_DESIGN_TOKENS.accentSwatches[accent];
    if (typeof hex === "number") shoe.setBodyAccentColor(hex);
  }
}
