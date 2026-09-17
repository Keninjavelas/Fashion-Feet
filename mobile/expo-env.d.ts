/// <reference types="expo/types" />

// Expo writes a file like this on `npx expo start`. It is checked in here so that
// `tsc --noEmit` type-checks against the same globals the bundler injects —
// notably `process.env.EXPO_PUBLIC_*`, which Metro replaces at build time.
