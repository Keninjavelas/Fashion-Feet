import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `mobile/` is a separate Expo/React Native project with its own toolchain,
    // dependencies and lint expectations. It is intentionally NOT part of this
    // project's lint run — left unignored, its source (and its node_modules) get
    // linted under the Next.js ruleset and break `npm run lint`.
    "mobile/**",
  ]),
  {
    rules: {
    "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
