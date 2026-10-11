import path from "path"
import { fileURLToPath } from "url"
const __dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url))
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Must be defined: the minifier removes React's own `typeof` guard around
    // this identifier, which otherwise becomes an unguarded ReferenceError and
    // leaves ReactDOM uninitialised (createRoot(...).render -> not a function).
    __REACT_DEVTOOLS_GLOBAL_HOOK__: "undefined",
  },
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "manifest.json"],
      manifest: {
        name: "ERP System",
        short_name: "ERP",
        description: "Enterprise Resource Planning System",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "192x192", type: "image/svg+xml" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,svg,png,ico,json}"],
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            /* Always prefer fresh index.html online -> stops "Failed to fetch dynamically imported module" */
            urlPattern: ({ request }: any) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20 },
            },
          },
          {
            urlPattern: /^\/assets\//,
            handler: "CacheFirst",
            options: {
              cacheName: "asset-cache",
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      // No manualChunks at all.
      // Any manual chunking here duplicated React core into another chunk
      // (recharts dragged React along), which left ReactDOMRoot.prototype.render
      // undefined at call time -> "createRoot(...).render is not a function".
      // Rollup's default chunking emits one shared vendor chunk instead.
      output: {},
    },
  },
})
