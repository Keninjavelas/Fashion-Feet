# Seasonal Experience System Specification

## Overview

The Seasonal Experience System transforms the visual atmosphere of the website while maintaining brand identity.

## Presets (`src/lib/themeTokens.ts`)

1. **`default` (Light Theme)**: Warm ivory (`#FAF6F0`), dark walnut (`#1F1A17`), antique gold (`#C5A059`), royal crimson (`#8A1538`). Minimal luxury.
2. **`diwali`**: Aubergine (`#12080C`), gold (`#D4AF37`), maroon (`#8A1538`). Diya sparks, rangoli dividers, card badge `"Diwali Exclusive"`.
3. **`holi`**: Rose (`#FFF9FB`), pink (`#FF758F`), green (`#2A9D8F`). Gulal powder particle reveal, card badge `"Holi Color Drop"`.
4. **`eid`**: Emerald (`#0B1D16`), gold (`#D4AF37`), ivory (`#FAF6F0`). Crescent moon lanterns, geometric arches, card badge `"Eid Festive Elegance"`.
5. **`christmas`**: Forest green (`#0D1F17`), deep red (`#991B1B`), cream (`#FEF3C7`). Snowfall particles, fairy lights, card badge `"Holiday Gift Edition"`.
6. **`lohri`**: Burnt orange (`#1C0D07`), amber (`#EA580C`), maroon (`#8A1538`). Bonfire ember glow, card badge `"Punjabi Heritage"`.
7. **`baisakhi`**: Mustard (`#FFFDF7`), amber (`#D97706`), green (`#15803D`). Wheat chaff & leaves, card badge `"Spring Harvest"`.

## Particle Canvas (`SeasonalAmbientOverlays.tsx`)
- Renders themed animations (`diyas`, `gulal`, `lanterns`, `snowfall`, `embers`, `wheat`).
- Performance optimized: Automatically throttled on lower-end devices or reduced motion mode.
