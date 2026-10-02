import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityRole,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../site/SiteProvider';
import { SPACING } from '../theme/theme';
import type { Product } from '../api/types';

/**
 * ThreeDViewer — mobile mirror of the web ShoeViewerEngine /
 * Hero3DJuttiCanvas / Real3DJuttiHeroCanvas.
 *
 * PARITY SPEC (source: src/components/home/Hero3DJuttiCanvas.tsx and
 * Real3DJuttiHeroCanvas.tsx). Every item below is the contract this component
 * must satisfy once the native rendering packages are installed. The fallback
 * rendered today is an annotated placeholder — see RENDERING FALLBACK below.
 *
 * ----------------------------------------------------------------------------
 * Lighting (matches web canvas constants):
 *   Ambient warm glow : radial gradient cx,cy-20 r10→r180:
 *                         #D4AF37 @ 25% alpha -> TRANSPARENT
 *   Key / rim light    : #FFF2B2 spot highlights on zari sequin accent
 *                         positions (see spot loop in web canvas)
 *   Body gradient      : linear -100,-50 → +100,+50:
 *                         #8A1538 Royal crimson velvet -> #4A0C1B -> #1A050A
 *   Leather sole       : fill #A36B31 (Real3D) / #2D1B18 (Hero3D), stroke
 *                         #5C3A16 / #D4AF37, lineWidth 2.5–3
 *   Ground reflection  : ellipse (cx, cy + scale*0.52, rx scale*0.75, ry 0.18),
 *                         fill #000 @ 35%, filter=blur(10)
 *
 * Scene composition:
 *   - Procedural Punjabi Jutti curved sole contour:
 *       moveTo  -0.85*cos(θ), +0.30
 *       quadCurve  0 → +0.45,    +0.85*cos(θ) → +0.20
 *       quadCurve  +0.95 → -0.10, +0.70 → -0.25
 *       quadCurve  0 → -0.30,    -0.70 → -0.20
 *       closePath
 *   - Upper velvet body: moveTo -0.90*cos(θ), +0.25, two bezier sections
 *       to +1.10*cos(θ), +0.15 with peak at y=-0.45
 *   - Zari lattice: 20px step lines from i=-60..+80: moveTo (i-20)cos,
 *       -10 + (i%30) → lineTo (i+20)cos, +25 - (i%20), stroke
 *       rgba(212,175,55,0.75), lw 1.5
 *   - Dabka sequin accents: 3px radius circles at j=-40..+60 step 25 at
 *       spotX = j*cos(θ), spotY = sin(j+angle)*12 + 5, fill #FFF2B2
 *
 * Interaction (matches web pointer handlers):
 *   - Horizontal drag rotates around Y axis (rotationY += dx * 0.015)
 *   - Idle auto-rotation at 0.006 rad/frame when NOT dragging
 *   - 360 badge with rotating icon + "Interactive 3D Inspection"
 *   - Drag hint at bottom edge: "Tap and drag to rotate"
 *
 * Shadow:
 *   Ellipse at floor, rx scales by |cos(θ)| to foreshorten front/back view.
 *
 * PACKAGES REQUIRED FOR THE NATIVE RENDERER:
 *   This component currently renders the FALLBACK below. To swap in the real
 *   procedural renderer matching the web canvas, install one of:
 *
 *     Option A — Expo 2D Context (matches web's CanvasRenderingContext2D API
 *                most closely, so Hero3DJuttiCanvas.tsx ports with minimal
 *                change):
 *       npx expo install expo-gl expo-2d-context
 *       → use GLView + Expo2DContext from 'expo-2d-context'; port the
 *         requestAnimationFrame loop 1:1 from the web useEffect.
 *
 *     Option B — react-native-skia (best perf, but the rendering code must be
 *                rewritten to Skia commands):
 *       npx expo install @shopify/react-native-skia
 *       → use Canvas, Path, Group, Paint, Blur, RadialGradient etc.
 *
 *     Option C — Three.js via expo-three (for GLTF models, i.e. the
 *                Real3DJuttiHeroCanvas.tsx path which references
 *                /models/punjabi_jutti_master.gltf):
 *       npx expo install expo-gl three expo-three
 *       → match scene setup (ambient, directional, rim lights) to the
 *         Real3D fallback-lighting spec in this file's comments.
 *
 *  Until one of A / B / C is installed, the RENDERING FALLBACK below is
 *  shown instead. It intentionally preserves the semantic shell (the 3D
 *  badge, the interaction hint, the themed surface, the product title
 *  overlay) so screens embedding this component render correctly in the
 *  empty-catalogue state — nothing crashes, nothing shows blank.
 * ----------------------------------------------------------------------------
 */

export interface ThreeDViewerProps extends ViewProps {
  product?: Pick<Product, 'id' | 'title' | 'sku' | 'images'>;
  /** Fallback image if the 3D asset is not available or the renderer is not
   *  installed yet. Matches the `fallbackImage` prop of the web
   *  Real3DJuttiHeroCanvas. */
  fallbackImage?: string;
  /** Aspect ratio of the canvas area. Default 4/3 (matches web hero canvas). */
  aspectRatio?: number;
}

const LIGHTING_SPEC = {
  ambientGlowInner: 'rgba(212, 175, 55, 0.25)',
  bodyRougeCrimson: '#8A1538',
  bodyMidShadow: '#4A0C1B',
  bodyDeep: '#1A050A',
  goldZariStroke: 'rgba(212, 175, 55, 0.75)',
  sequinHighlight: '#FFF2B2',
  soleFill: '#A36B31',
  soleStroke: '#5C3A16',
} as const;

export function ThreeDViewer({
  product,
  fallbackImage,
  aspectRatio = 4 / 3,
  style,
  ...rest
}: ThreeDViewerProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [dragging, setDragging] = useState(false);
  const rotationRef = useRef(0.5);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    let active = true;
    const loop = () => {
      if (!active) return;
      if (!dragging) rotationRef.current += 0.006;
      frame = requestAnimationFrame(loop);
      forceTick((t) => (t + 1) % 1_000_000);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [dragging]);

  const cardWidth = Math.max(width - SPACING.lg * 2, 1);
  const cardHeight = cardWidth / aspectRatio;
  const rotationY = rotationRef.current;
  const heelVisible = Math.abs(Math.cos(rotationY)) > 0.35;

  return (
    <View
      {...rest}
      style={[
        styles.root,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: theme.cardRadius,
        },
        style,
      ]}
      accessibilityRole={('image' as unknown) as AccessibilityRole}
      accessibilityLabel={`3D view of ${product?.title ?? 'jutti'}. ${
        dragging ? 'Drag to rotate.' : 'Tap and drag to rotate 360 degrees.'
      }`}
    >
      {/* Ambient warm glow (matches radial gradient in web canvas) */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: theme.cardRadius,
            backgroundColor: theme.surface,
            overflow: 'hidden',
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              top: '10%',
              left: '15%',
              width: '70%',
              height: '60%',
              borderRadius: 999,
              backgroundColor: LIGHTING_SPEC.ambientGlowInner,
              opacity: 0.8,
            },
          ]}
        />
      </View>

      {/* Placeholder shoe: layered silhouette (sole + velvet body + gold
          zari band + sequin dots). Scaled by |cos(rotationY)| to emulate the
          web canvas's perspective foreshortening. This is NOT a real renderer
          — it preserves the colour palette and composition until the native
          Canvas/GL packages are installed.                                               */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.stage]}>
        <View
          style={[
            styles.shadow,
            {
              width: `${60 + Math.abs(Math.cos(rotationY)) * 18}%`,
              backgroundColor: 'rgba(0,0,0,0.35)',
            },
          ]}
        />
        <View
          style={[
            styles.sole,
            {
              transform: [{ scaleX: 0.45 + Math.abs(Math.cos(rotationY)) * 0.55 }],
              backgroundColor: LIGHTING_SPEC.soleFill,
              borderColor: LIGHTING_SPEC.soleStroke,
            },
          ]}
        />
        <View
          style={[
            styles.body,
            {
              transform: [
                { scaleX: 0.4 + Math.abs(Math.cos(rotationY)) * 0.6 },
                { rotateY: `${(rotationY * 180) / Math.PI}deg` },
              ],
              backgroundColor: LIGHTING_SPEC.bodyRougeCrimson,
              borderColor: LIGHTING_SPEC.goldZariStroke,
            },
          ]}
        >
          <View style={[styles.bodyHighlight, { backgroundColor: LIGHTING_SPEC.bodyMidShadow }]} />
          <View style={[styles.zariBand, { borderColor: LIGHTING_SPEC.goldZariStroke }]} />
          <View style={[styles.sequins, { backgroundColor: LIGHTING_SPEC.sequinHighlight }]} />
          {heelVisible ? (
            <View
              style={[
                styles.heel,
                {
                  backgroundColor: LIGHTING_SPEC.soleFill,
                  borderColor: LIGHTING_SPEC.soleStroke,
                },
                Math.cos(rotationY) > 0 ? { left: 6 } : { right: 6 },
              ]}
            />
          ) : null}
        </View>
      </View>

      {/* 360° inspection badge (top-left) — mirrors web Hero3DJuttiCanvas */}
      <View style={[styles.badge, { borderColor: theme.border }]}>
        <Text style={[styles.badgeLabel, { color: theme.primary }]}>
          360° Interactive 3D
        </Text>
      </View>

      {/* Interaction hint (bottom edge) */}
      <Pressable
        onPressIn={() => setDragging(true)}
        onPressOut={() => setDragging(false)}
        style={styles.dragHint}
      >
        <Text style={[styles.dragHintText, { color: theme.textMuted }]}>
          {dragging ? 'Rotating…' : 'Tap and drag to rotate'}
        </Text>
      </Pressable>

      {/* Product title overlay (bottom-left, above the hint) */}
      {product?.title ? (
        <View style={styles.titleOverlay}>
          <Text style={[styles.titleText, { color: theme.onPrimary }]} numberOfLines={1}>
            {product.title}
          </Text>
          {product.sku ? (
            <Text style={[styles.skuText, { color: theme.onPrimary, opacity: 0.75 }]}>
              {product.sku}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    bottom: '12%',
    height: 18,
    borderRadius: 999,
    opacity: 0.6,
  },
  sole: {
    position: 'absolute',
    bottom: '18%',
    width: '62%',
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
  },
  body: {
    position: 'absolute',
    bottom: '26%',
    width: '54%',
    height: '42%',
    borderRadius: 999,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  bodyHighlight: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    opacity: 0.7,
  },
  zariBand: {
    position: 'absolute',
    top: '38%',
    left: '10%',
    right: '10%',
    height: 0,
    borderTopWidth: 2,
  },
  sequins: {
    position: 'absolute',
    top: '22%',
    left: '30%',
    width: 6,
    height: 6,
    borderRadius: 999,
    opacity: 0.9,
  },
  heel: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  dragHint: {
    position: 'absolute',
    bottom: SPACING.sm,
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dragHintText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  titleOverlay: {
    position: 'absolute',
    left: SPACING.md,
    bottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    maxWidth: '70%',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  skuText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

/**
 * Mirror of the web Real3DJuttiHeroCanvas THREE.js lighting (for future
 * Option-C implementation with expo-three). The web canvas renders a 2D
 * procedural silhouette today, but the GLTF path uses this exact scene:
 *
 *   scene.add(new THREE.AmbientLight(0xd4af37, 0.35));
 *   const key = new THREE.DirectionalLight(0xffffff, 0.9);
 *   key.position.set(3, 5, 2);
 *   scene.add(key);
 *   const rim = new THREE.DirectionalLight(0xfff2b2, 0.7);
 *   rim.position.set(-4, 2, -3);
 *   scene.add(rim);
 *   const fill = new THREE.PointLight(0x8a1538, 0.4, 15);
 *   fill.position.set(0, 1.5, 2);
 *   scene.add(fill);
 *   camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 100);
 *   camera.position.set(0, 0.4, 4);
 *
 *   renderer.toneMapping = THREE.ACESFilmicToneMapping;
 *   renderer.toneMappingExposure = 1.05;
 *   renderer.outputColorSpace = THREE.SRGBColorSpace;
 *
 * Keep the values above in sync if/when the expo-three renderer is wired.
 */
export const REAL3D_LIGHTING = Object.freeze({
  ambientHex: 0xd4af37,
  ambientIntensity: 0.35,
  keyHex: 0xffffff,
  keyIntensity: 0.9,
  keyPosition: [3, 5, 2] as [number, number, number],
  rimHex: 0xfff2b2,
  rimIntensity: 0.7,
  rimPosition: [-4, 2, -3] as [number, number, number],
  fillHex: 0x8a1538,
  fillIntensity: 0.4,
  fillDistance: 15,
  fillPosition: [0, 1.5, 2] as [number, number, number],
  cameraFovDeg: 35,
  cameraPosition: [0, 0.4, 4] as [number, number, number],
  toneMappingExposure: 1.05,
});

/**
 * How to embed in the product detail screen (app/product/[id].tsx):
 *
 *   import { ThreeDViewer } from '../../src/components/ThreeDViewer';
 *
 *   // ...inside the render, above the FlatList image carousel:
 *
 *   {data !== null ? (
 *     <ThreeDViewer product={data} aspectRatio={4 / 3} />
 *   ) : null}
 *
 * The component degrades gracefully when no product/images are passed
 * (empty-catalogue state) and when no native rendering package is installed.
 */
