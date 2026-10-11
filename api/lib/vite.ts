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

  // NOTE: the real (built) service worker is served from dist by serveStatic below,
  // with no-store so browsers always pick up cache-policy changes.

  const ASSET_CACHE = "public, max-age=31536000, immutable";

  app.use("*", async (c, next) => {
    const url = new URL(c.req.url);
    const p = url.pathname;

    // Service worker / registration / manifest: never serve a stale copy.
    if (p === "/sw.js" || p === "/registerSW.js" || p === "/manifest.webmanifest" || p === "/manifest.json") {
      c.header("Cache-Control", "no-cache, no-store, must-revalidate");
      await next();
      return;
    }
    // Hashed build assets: cache hard ONLY when the file actually exists.
    // A missing chunk (e.g. requested mid-deploy while dist is being
    // rewritten) must never carry immutable caching — browsers and CDN edge
    // nodes (Cloudflare) would otherwise cache the 404 for up to a year and
    // the app would keep failing with "Failed to fetch dynamically imported
    // module" long after the deploy finished.
    if (p.startsWith("/assets/")) {
      let exists = false;
      try {
        const rel = decodeURIComponent(p).replace(/^\/+/, "");
        const full = path.resolve(distPath, rel);
        const inside = full === distPath || full.startsWith(distPath + path.sep);
        if (inside) {
          const st = fs.statSync(full, { throwIfNoEntry: false });
          exists = !!st && st.isFile();
        }
      } catch {
        exists = false;
      }
      c.header("Cache-Control", exists ? ASSET_CACHE : "no-cache, no-store, must-revalidate");
      await next();
      return;
    }
    // HTML / SPA routes: always revalidate so a new build is picked up instantly.
    c.header("Cache-Control", "no-cache, no-store, must-revalidate");
    await next();
  });

  app.use(
    "*",
    serveStatic({
      root: distPath,
      onNotFound: (filePath, c) => {
        // Missing build asset -> honest 404 (never HTML). Returning SPA HTML for a
        // missing chunk is what triggers "Failed to fetch dynamically imported module".
        if (/^\/assets\//.test(filePath) || /\.(js|css|map|png|jpg|jpeg|svg|ico|webp|woff2?|ttf)$/i.test(filePath)) {
          c.notFound();
        }
      },
    })
  );

  app.notFound((c) => {
    const url = new URL(c.req.url);
    if (url.pathname.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }
    if (url.pathname.startsWith("/assets/")) {
      return c.body("Not Found", 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
