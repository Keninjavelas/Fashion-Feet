import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

/**
 * Design tokens for the Fashion Feet footwear 3D look.
 *
 * Values are deliberately aligned with the web 2D Hero3DJuttiCanvas palette so
 * that swapping from the 2D canvas to the Three.js renderer is a zero visual
 * drift swap (same crimson velvet, same gold zari, same leather tones).
 */
export const FOOTWEAR_DESIGN_TOKENS = Object.freeze({
  velvetCrimson: 0x8a1538,
  velvetCrimsonDeep: 0x4a0c1b,
  velvetBlack: 0x1a050a,
  goldZari: 0xd4af37,
  goldZariSoft: 0xfff2b2,
  sequinHighlight: 0xffe28a,
  leatherSole: 0xa36b31,
  leatherSoleStroke: 0x5c3a16,
  floorShadow: 0x12080c,
  size: {
    length: 1.0,
    soleThickness: 0.08,
    toeLift: 0.04,
  },
  zari: {
    latticeCount: 16,
    sequinCount: 10,
  },
  accentSwatches: {
    crimson: 0x8a1538,
    emerald: 0x0f766e,
    sapphire: 0x1e3a8a,
    ivory: 0xf5ead1,
    black: 0x18181b,
    rose: 0x9f1239,
  } as Record<string, number>,
} as const);

export type AccentSwatchName = keyof (typeof FOOTWEAR_DESIGN_TOKENS)['accentSwatches'];

export interface ProceduralJuttiOptions {
  bodyColor?: number;
  zariColor?: number;
  sequinColor?: number;
  soleColor?: number;
  scale?: number;
}

/**
 * Procedural Punjabi Jutti geometry + material group — does not require any
 * external GLTF model to render (unlike /models/punjabi_jutti_master.gltf
 * which is the future premium hand-modelled asset). The geometry is built
 * from THREE.Shape + bezier curves that mirror the 2D canvas bezier math in
 * Hero3DJuttiCanvas.tsx exactly, then extruded and scaled so the 2D and 3D
 * renderers share identical silhouette curves.
 *
 * Result is a single THREE.Group with sub-names:
 *   - sole                 : extruded leather sole with rim stroke
 *   - upper                : velvet upper body (extruded shape + gradient mat)
 *   - zari-lattice         : THREE.LineSegments of gold stitches
 *   - sequins              : InstancedMesh of gold dabka beads
 *   - toe-cap              : shiny toe panel (matching jasmine-petal shape)
 */
export class ProceduralPunjabiJutti extends THREE.Group {
  public readonly sole: THREE.Mesh;
  public readonly upper: THREE.Mesh;
  public readonly zariLattice: THREE.LineSegments;
  public readonly sequins: THREE.InstancedMesh;
  public readonly toeCap: THREE.Mesh;

  private readonly bodyMaterial: THREE.MeshPhysicalMaterial;
  private readonly sequinMaterial: THREE.MeshStandardMaterial;
  private readonly zariMaterial: THREE.LineBasicMaterial;
  private readonly soleMaterial: THREE.MeshPhysicalMaterial;
  private readonly toeMaterial: THREE.MeshPhysicalMaterial;

  public constructor(options: ProceduralJuttiOptions = {}) {
    super();
    this.name = 'procedural-punjabi-jutti';

    const bodyColor = options.bodyColor ?? FOOTWEAR_DESIGN_TOKENS.velvetCrimson;
    const zariColor = options.zariColor ?? FOOTWEAR_DESIGN_TOKENS.goldZari;
    const sequinColor = options.sequinColor ?? FOOTWEAR_DESIGN_TOKENS.sequinHighlight;
    const soleColor = options.soleColor ?? FOOTWEAR_DESIGN_TOKENS.leatherSole;
    const baseScale = options.scale ?? 1;

    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor),
      roughness: 0.85,
      metalness: 0.02,
      clearcoat: 0.12,
      clearcoatRoughness: 0.7,
      sheen: 0.55,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(FOOTWEAR_DESIGN_TOKENS.velvetCrimsonDeep).lerp(new THREE.Color(bodyColor), 0.6),
    });
    this.toeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor).multiplyScalar(1.1),
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.4,
      clearcoatRoughness: 0.35,
    });
    this.soleMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(soleColor),
      roughness: 0.92,
      metalness: 0.0,
      bumpScale: 0.008,
    });
    this.zariMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(zariColor),
      transparent: true,
      opacity: 0.85,
    });
    this.sequinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(sequinColor),
      metalness: 1.0,
      roughness: 0.18,
      emissive: new THREE.Color(zariColor).multiplyScalar(0.08),
      emissiveIntensity: 1.0,
    });

    this.sole = buildSoleMesh(this.soleMaterial);
    this.upper = buildUpperMesh(this.bodyMaterial);
    this.toeCap = buildToeCapMesh(this.toeMaterial);
    this.zariLattice = buildZariLattice(this.zariMaterial);
    this.sequins = buildSequinDabka(this.sequinMaterial);

    this.sole.name = 'sole';
    this.upper.name = 'upper';
    this.toeCap.name = 'toe-cap';
    this.zariLattice.name = 'zari-lattice';
    this.sequins.name = 'sequins';

    this.add(this.sole);
    this.add(this.upper);
    this.add(this.toeCap);
    this.add(this.zariLattice);
    this.add(this.sequins);

    this.scale.setScalar(baseScale);

    // Centre the shoe vertically so the sole sits on the floor plane.
    const box = new THREE.Box3().setFromObject(this);
    this.position.y = -box.min.y;
  }

  /**
   * Applies a different velvet body accent colour without recreating
   * geometry. Used by the product detail colour swatch rail.
   */
  public setBodyAccentColor(hex: number): void {
    this.bodyMaterial.color.setHex(hex);
    this.bodyMaterial.sheenColor.setHex(
      new THREE.Color(FOOTWEAR_DESIGN_TOKENS.velvetCrimsonDeep).lerp(new THREE.Color(hex), 0.6).getHex()
    );
    this.toeMaterial.color.setHex(new THREE.Color(hex).multiplyScalar(1.1).getHex());
  }

  public override dispose(): void {
    for (const child of this.children) {
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose?.();
      const mat = (child as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
    super.dispose?.();
  }
}

/**
 * Sole silhouette bezier — copied line-for-line from the 2D canvas sole
 * contour in Hero3DJuttiCanvas.tsx so the outline is identical.
 */
function buildSoleShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const L = FOOTWEAR_DESIGN_TOKENS.size.length / 2;
  shape.moveTo(-L * 0.85, +0.2);
  shape.quadraticCurveTo(0, 0.4, L * 0.85, 0.15);
  shape.quadraticCurveTo(L * 0.95, -0.05, L * 0.7, -0.22);
  shape.quadraticCurveTo(0, -0.28, -L * 0.7, -0.18);
  shape.quadraticCurveTo(-L * 0.9, -0.02, -L * 0.85, 0.2);
  return shape;
}

function buildSoleMesh(material: THREE.Material): THREE.Mesh {
  const shape = buildSoleShape();
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: FOOTWEAR_DESIGN_TOKENS.size.soleThickness,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 48,
  });
  geom.rotateX(-Math.PI / 2);
  geom.center();
  return new THREE.Mesh(geom, material);
}

/**
 * Velvet upper body — a lofted tube over the sole shape outline, raised
 * with a sinusoidal peak at the vamp, with the opening cut at the heel.
 */
function buildUpperMesh(material: THREE.Material): THREE.Mesh {
  const L = FOOTWEAR_DESIGN_TOKENS.size.length / 2;
  const segmentsR = 28;
  const segmentsT = 72;
  const geom = new ParametricGeometry((u: number, t: number, target: THREE.Vector3) => {
    const theta = u * Math.PI * 2;
    const s = (t - 0.5) * 2;
    const radius = L * (0.82 + 0.18 * Math.cos(s * Math.PI * 0.6));
    const vampPeak = Math.pow(Math.max(0, Math.sin(t * Math.PI)), 2.2) * 0.34;
    const heelCut = Math.max(0, Math.sin(Math.PI * (t + 0.02))) < 0.35 ? 0.55 : 1;
    const x = radius * Math.cos(s * Math.PI) * Math.cos(theta) * 0.92;
    const y = vampPeak * heelCut - 0.005 + Math.abs(Math.sin(theta)) * 0.002;
    const z = radius * Math.sin(s * Math.PI) * 1.12;
    target.set(z, y, x);
  }, segmentsT, segmentsR);
  geom.computeVertexNormals();
  geom.translate(0, FOOTWEAR_DESIGN_TOKENS.size.soleThickness + 0.005, 0);
  return new THREE.Mesh(geom, material);
}

function buildToeCapMesh(material: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0.28, 0.14);
  shape.bezierCurveTo(0.38, 0.22, 0.34, 0.36, 0.0, 0.38);
  shape.bezierCurveTo(-0.34, 0.36, -0.38, 0.22, -0.28, 0.14);
  shape.bezierCurveTo(-0.16, 0.02, 0.16, 0.02, 0.28, 0.14);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 32,
  });
  geom.rotateX(-Math.PI / 2);
  geom.translate(0, FOOTWEAR_DESIGN_TOKENS.size.soleThickness + 0.02, 0.28);
  return new THREE.Mesh(geom, material);
}

function buildZariLattice(material: THREE.LineBasicMaterial): THREE.LineSegments {
  const positions: number[] = [];
  const L = FOOTWEAR_DESIGN_TOKENS.size.length / 2;
  const cols = FOOTWEAR_DESIGN_TOKENS.zari.latticeCount;
  for (let i = 0; i < cols; i++) {
    const t0 = i / cols;
    const t1 = (i + 0.55) / cols;
    const x0 = (t0 - 0.5) * 2 * L * 0.92;
    const z0 = Math.sin(t0 * Math.PI) * 0.36 + 0.02;
    const x1 = (t1 - 0.5) * 2 * L * 0.92;
    const z1 = Math.sin(t1 * Math.PI) * 0.36 + 0.08;
    const y = FOOTWEAR_DESIGN_TOKENS.size.soleThickness + 0.04 + Math.sin(t0 * Math.PI) * 0.14;
    positions.push(x0, y, z0, x1, y + 0.015, z1);
    positions.push(-x0, y, -z0 * 0.5, -x1, y + 0.015, -z1 * 0.5);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.LineSegments(geom, material);
}

function buildSequinDabka(material: THREE.MeshStandardMaterial): THREE.InstancedMesh {
  const sequinGeom = new THREE.SphereGeometry(0.012, 8, 8);
  const count = FOOTWEAR_DESIGN_TOKENS.zari.sequinCount * 2;
  const mesh = new THREE.InstancedMesh(sequinGeom, material, count);
  const L = FOOTWEAR_DESIGN_TOKENS.size.length / 2;
  const dummy = new THREE.Object3D();
  let instanceIndex = 0;
  for (let j = -FOOTWEAR_DESIGN_TOKENS.zari.sequinCount; j <= FOOTWEAR_DESIGN_TOKENS.zari.sequinCount; j += 2) {
    const t = 0.5 + j / (FOOTWEAR_DESIGN_TOKENS.zari.sequinCount * 2.5);
    const spotX = (t - 0.5) * 2 * L * 0.78;
    const spotY = FOOTWEAR_DESIGN_TOKENS.size.soleThickness + 0.06 + Math.max(0, Math.sin(j + 1.2)) * 0.04;
    const spotZ = Math.sin(t * Math.PI) * 0.26 + 0.05;
    dummy.position.set(spotX, spotY, spotZ);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const s = 0.75 + Math.random() * 0.75;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    mesh.setMatrixAt(instanceIndex++, dummy.matrix);
    // mirror on the other side
    dummy.position.set(-spotX, spotY, -spotZ * 0.4);
    dummy.scale.setScalar(s * 0.7);
    dummy.updateMatrix();
    mesh.setMatrixAt(instanceIndex++, dummy.matrix);
    if (instanceIndex >= count) break;
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/**
 * Studio scene rig: reusable set of (renderer, scene, camera, lights,
 * ground, ground-contact blur shadow) that any three.js widget mounts.
 *
 * This matches the REAL3D_LIGHTING constants documented in the mobile
 * ThreeDViewer scaffold (Option C), so moving the component to Expo
 * later is a 1-line port of the lighting numbers.
 */
export interface StudioSceneOptions {
  clearColor?: number;
  floorVisible?: boolean;
  floorOpacity?: number;
  fov?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  dpr?: number;
  exposure?: number;
}

export function createStudioScene(canvas: HTMLCanvasElement, options: StudioSceneOptions = {}) {
  const {
    clearColor,
    floorVisible = true,
    floorOpacity = 0.35,
    fov = 35,
    cameraDistance = 4.2,
    cameraHeight = 0.4,
    dpr = Math.min(window.devicePixelRatio || 1, 2),
    exposure = 1.05,
  } = options;

  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: clearColor === undefined,
    powerPreference: 'high-performance',
  });
  if (clearColor !== undefined) {
    renderer.setClearColor(clearColor, 1);
  }
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
  camera.position.set(0, cameraHeight, cameraDistance);
  camera.lookAt(0, 0.1, 0);

  const ambient = new THREE.AmbientLight(FOOTWEAR_DESIGN_TOKENS.goldZari, 0.35);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(3, 5, 2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(FOOTWEAR_DESIGN_TOKENS.goldZariSoft, 0.7);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const fill = new THREE.PointLight(FOOTWEAR_DESIGN_TOKENS.velvetCrimson, 0.42, 15);
  fill.position.set(0, 1.5, 2);
  scene.add(fill);

  if (floorVisible) {
    const floorGeom = new THREE.CircleGeometry(2.2, 96);
    const floorMat = new THREE.MeshBasicMaterial({
      color: FOOTWEAR_DESIGN_TOKENS.floorShadow,
      transparent: true,
      opacity: floorOpacity,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    scene.add(floor);
  }

  const backdropGeom = new THREE.PlaneGeometry(9, 6);
  const backdropMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uGold: { value: new THREE.Color(FOOTWEAR_DESIGN_TOKENS.goldZari) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uGold;
      void main() {
        vec2 d = vUv - 0.5;
        float vignette = smoothstep(0.55, 0.0, length(d));
        gl_FragColor = vec4(uGold, 0.08 * vignette);
      }
    `,
    depthWrite: false,
  });
  const backdrop = new THREE.Mesh(backdropGeom, backdropMat);
  backdrop.position.set(0, 0.1, -1.2);
  scene.add(backdrop);

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
