// Turbopack leaks EdgeRuntime global in API routes, breaking Prisma. We must hide it.
if (typeof globalThis !== "undefined") {
  Object.defineProperty(globalThis, "EdgeRuntime", { get: () => undefined, configurable: true });
}
