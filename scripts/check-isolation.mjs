import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function loadJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

const publicRoutes = Object.keys(loadJson("../.next/server/app-paths-manifest.json"));
const adminRoutes = Object.keys(loadJson("../apps/admin/.next/server/app-paths-manifest.json"));
const publicActions = loadJson("../.next/server/server-reference-manifest.json");
const adminActions = loadJson("../apps/admin/.next/server/server-reference-manifest.json");

assert(publicRoutes.some((route) => route === "/shop/page"), "Storefront build is missing the shop");
assert(adminRoutes.some((route) => route === "/admin/login/page"), "Admin build is missing its login");
assert(adminRoutes.some((route) => route === "/api/upload/route"), "Admin build is missing uploads");

for (const route of publicRoutes) {
  assert(!route.startsWith("/admin/") && !route.startsWith("/api/admin/") && route !== "/api/upload/route", `Admin route leaked into storefront: ${route}`);
}
for (const route of adminRoutes) {
  assert(!route.startsWith("/shop/") && !route.startsWith("/api/v1/"), `Storefront route leaked into admin: ${route}`);
}

function actionNames(manifest) {
  return new Set(Object.values(manifest.node ?? {}).map((entry) => entry.exportedName));
}

const publicNames = actionNames(publicActions);
const adminNames = actionNames(adminActions);
for (const name of publicNames) {
  assert(!adminNames.has(name), `Server Action is registered on both origins: ${name}`);
}

console.log(`Isolation verified: ${publicRoutes.length} storefront routes, ${adminRoutes.length} admin routes, no shared Server Actions.`);
