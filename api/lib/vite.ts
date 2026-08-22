import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = process.env.ERP_STATIC_DIR
    ? path.resolve(process.env.ERP_STATIC_DIR)
    : path.resolve(import.meta.dirname, "../dist/public");

  // Self-destructing service worker to clear old caches
  app.get("/sw.js", (c) => {
    const swCode = `// Self-destructing service worker
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }).then(function() { return self.registration.unregister(); }).then(function() {
      return self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) { try { client.navigate(client.url); } catch(e){} });
      });
    })
  );
});`;
    return c.body(swCode, 200, {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  });

  app.use("*", serveStatic({ root: distPath }));

  app.notFound((c) => {
    const url = new URL(c.req.url);
    if (url.pathname.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
