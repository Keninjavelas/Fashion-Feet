"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

export interface AnatomicalFootCanvasProps {
  footLengthCm: number;
  gender: "women" | "men";
  ukSize: number;
  className?: string;
  aspectRatio?: number;
}

/**
 * Procedural anatomical 3D foot model — constructed from shape extrusion +
 * ellipsoid toe/heel/ankle meshes. The entire model is scaled proportionally
 * by footLengthCm so the size finder feels "live" and directly coupled to
 * the slider. Gender subtly changes the instep height and heel prominence.
 */
function buildAnatomicalFoot(gender: "women" | "men") {
  const group = new THREE.Group();
  group.name = "anatomical-foot";

  const instepHeight = gender === "women" ? 0.36 : 0.42;
  const heelProminence = gender === "women" ? 0.16 : 0.2;

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xe8c9a5),
    roughness: 0.78,
    metalness: 0.02,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.2,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color(0xf5e0c4),
  });

  const boneMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd9b489),
    roughness: 0.85,
    metalness: 0.0,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  // ---- SOLE SILHOUETTE EXTRUSION (main body of the foot) ----
  const soleShape = new THREE.Shape();
  const L = 1.25;
  // Toe tip rounded
  soleShape.moveTo(0, +L * 0.92);
  soleShape.bezierCurveTo(+0.55, +L * 1.02, +0.62, +L * 0.55, +0.5, 0);
  soleShape.quadraticCurveTo(+0.42, -L * 0.48, +0.18, -L * 0.88);
  soleShape.bezierCurveTo(+0.05, -L * 0.98, -0.05, -L * 0.98, -0.18, -L * 0.88);
  soleShape.quadraticCurveTo(-0.42, -L * 0.48, -0.5, 0);
  soleShape.bezierCurveTo(-0.62, +L * 0.55, -0.55, +L * 1.02, 0, +L * 0.92);

  const soleGeom = new THREE.ExtrudeGeometry(soleShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 5,
    curveSegments: 42,
  });
  soleGeom.center();
  soleGeom.rotateX(-Math.PI / 2);
  soleGeom.translate(0, 0.12, 0);

  // Loft an instep bulge using sinusoidal scale transform on y
  const posAttr = soleGeom.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i);
    const y = posAttr.getY(i);
    const x = posAttr.getX(i);
    // Mid-foot (around z=0) -> high instep, toe and heel -> lower
    const archCurve =
      Math.sin(((z + L * 0.7) / (L * 1.4)) * Math.PI * 0.85) ** 1.6;
    const widthTaper = 1 - Math.abs(x) * 0.35;
    const bulge = archCurve * instepHeight * widthTaper;
    posAttr.setY(i, y + bulge * 0.9);
  }
  soleGeom.computeVertexNormals();

  const soleMesh = new THREE.Mesh(soleGeom, skinMaterial);
  soleMesh.name = "foot-body";
  group.add(soleMesh);

  // ---- HEEL ELLIPSOID ----
  const heelGeom = new THREE.SphereGeometry(0.32, 28, 22);
  heelGeom.scale(1.1, heelProminence + 0.8, 1.0);
  const heelMesh = new THREE.Mesh(heelGeom, skinMaterial);
  heelMesh.position.set(0, 0.08, -L * 0.76);
  group.add(heelMesh);

  // ---- 5 TOE PHALANGES ----
  const toeSizes = [0.2, 0.16, 0.14, 0.12, 0.1];
  const toeXs = [0, 0.18, 0.32, 0.42, 0.48];
  for (let t = 0; t < 5; t++) {
    const radius = toeSizes[t];
    const tGeom = new THREE.SphereGeometry(radius, 22, 18);
    tGeom.scale(1.35, 0.95, 1.2);
    const toe = new THREE.Mesh(tGeom, skinMaterial);
    const zFront = L * (0.82 - t * 0.035);
    toe.position.set(toeXs[t] - 0.24 - t * 0.02, 0.12 + radius * 0.4 + t * 0.005, zFront);
    group.add(toe);
  }

  // ---- ANKLE / LEG STUMP CYLINDER ----
  const ankleGeom = new THREE.CylinderGeometry(0.28, 0.34, 0.45, 28, 1, true);
  const ankle = new THREE.Mesh(ankleGeom, skinMaterial);
  ankle.position.set(0, 0.5, -L * 0.58);
  group.add(ankle);

  // ---- SUBTLE ARCH SKELETON HIGHLIGHT (visible translucency) ----
  const archBarGeom = new THREE.CylinderGeometry(0.04, 0.06, L * 1.3, 14);
  archBarGeom.rotateX(Math.PI / 2);
  const archBar = new THREE.Mesh(archBarGeom, boneMaterial);
  archBar.position.set(0, 0.18, -L * 0.1);
  group.add(archBar);

  // Heel bone marker
  const heelBone = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    boneMaterial
  );
  heelBone.position.set(0, 0.12, -L * 0.78);
  group.add(heelBone);

  // Centre the model vertically on y=0 so it sits on the floor plane
  const box = new THREE.Box3().setFromObject(group);
  group.position.y = -box.min.y;
  return group;
}

function createFootScene(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth || 480;
  const height = canvas.clientHeight || 320;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(2.6, 1.4, 4.5);
  camera.lookAt(0, 0.35, 0);

  // Warm studio lighting
  scene.add(new THREE.AmbientLight(0xfff2d6, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(3, 4.5, 2.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf4c77a, 0.55);
  rim.position.set(-3, 2, -2.5);
  scene.add(rim);
  const fill = new THREE.PointLight(0xc58b5d, 0.35, 12);
  fill.position.set(0, 1, 2);
  scene.add(fill);

  // Soft floor ellipse shadow
  const floorGeom = new THREE.CircleGeometry(1.8, 56);
  const floorMat = new THREE.MeshBasicMaterial({
    color: 0x3a2a14,
    transparent: true,
    opacity: 0.2,
  });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.005;
  scene.add(floor);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return { renderer, scene, camera, resize, dispose: () => renderer.dispose() };
}

export function AnatomicalFootCanvas({
  footLengthCm,
  gender,
  ukSize,
  className,
  aspectRatio = 4 / 3,
}: AnatomicalFootCanvasProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const footRef = useRef<THREE.Group | null>(null);
  const scaleRef = useRef(1);

  // Map typical UK size -> realistic scale factor.
  // UK 6 women ≈ 24.5 cm = baseline scale 1.0.
  const baseScale = useMemo(() => {
    const baselineCm = gender === "women" ? 24.5 : 26.5;
    return footLengthCm / baselineCm;
  }, [footLengthCm, gender]);

  useEffect(() => {
    scaleRef.current = baseScale;
  }, [baseScale]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const { renderer, scene, camera, resize, dispose } = createFootScene(canvas);

    let genderSnapshot = gender;
    let foot: THREE.Group | null = null;
    const rebuildFoot = (g: "women" | "men") => {
      if (foot) {
        scene.remove(foot);
        try {
          foot.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            mesh.geometry?.dispose?.();
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat?.dispose();
          });
        } catch {
          /* noop */
        }
      }
      foot = buildAnatomicalFoot(g);
      foot.scale.setScalar(scaleRef.current);
      foot.rotation.y = -0.35;
      scene.add(foot);
      footRef.current = foot;
    };
    rebuildFoot(genderSnapshot);

    let rafId = 0;
    let isIntersecting = false;
    let isHovering = false;
    let lastFrameAt = performance.now();
    let bobT = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotY = -0.35;
    let rotX = 0;

    const initialRect = wrap.getBoundingClientRect();
    const initialW = Math.max(1, initialRect.width || 480);
    const initialH = Math.max(1, initialRect.height || initialW / aspectRatio);
    renderer.setSize(initialW, initialH, false);
    camera.aspect = initialW / initialH;
    camera.updateProjectionMatrix();

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) isIntersecting = e.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotY += dx * 0.012;
      rotX = Math.max(-0.6, Math.min(0.6, rotX + dy * 0.009));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
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
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);

    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - lastFrameAt) / 1000);
      lastFrameAt = now;
      if (isIntersecting && foot) {
        bobT += dt * (isHovering ? 1.9 : 1.1);
        // Gender swap detected? rebuild only when necessary
        if (genderSnapshot !== gender) {
          genderSnapshot = gender;
          rebuildFoot(genderSnapshot);
        }
        if (!isDragging) {
          rotY += 0.0035;
        }
        foot.rotation.y = THREE.MathUtils.lerp(foot.rotation.y, rotY, 0.12);
        foot.rotation.x = THREE.MathUtils.lerp(foot.rotation.x, rotX, 0.12);
        const s = THREE.MathUtils.lerp(foot.scale.x, scaleRef.current, 0.14);
        foot.scale.setScalar(s);
        const box = new THREE.Box3().setFromObject(foot);
        foot.position.y = -box.min.y + Math.sin(bobT * 1.5) * 0.02;
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      if (foot) {
        scene.remove(foot);
        try {
          foot.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            mesh.geometry?.dispose?.();
            const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat?.dispose();
          });
        } catch {
          /* noop */
        }
      }
      dispose();
      footRef.current = null;
    };
  }, [gender, aspectRatio]);

  return (
    <div
      ref={wrapRef}
      className={[
        "relative isolate overflow-hidden rounded-2xl border border-[var(--theme-color-border)] shadow-inner bg-[radial-gradient(ellipse_at_top,_#fff3db_0%,_#f2debb_55%,_#e5c793_100%)]",
        className ?? "",
      ].join(" ")}
      role="img"
      aria-label={`Anatomical 3D foot model for a ${gender} foot of ${footLengthCm} centimetres. Recommended UK size ${ukSize}. Drag to rotate. The model scales live with the foot-length slider.`}
      style={{ aspectRatio: String(aspectRatio) }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full select-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(138,106,26,0.22)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/70 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8a6a1a] shadow-sm backdrop-blur"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        Live 3D Fit Model
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 rounded-full border border-[#8a1538]/40 bg-white/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a1538] shadow-sm backdrop-blur"
      >
        UK {ukSize} · {footLengthCm}cm
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest"
      >
        Drag to rotate · Size scales with slider
      </div>
    </div>
  );
}
