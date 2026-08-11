# DESKTOP OFFLINE ARCHITECTURE — AUDIT

**Project:** YASCO ERP  
**Date:** 2026-08-11  
**Scope:** Existing offline/sync groundwork in the repo, gaps vs. the offline desktop requirement, and implications for the local-first Windows app.

---

## 1. Executive Summary

The codebase is **substantially further along** than a typical "web-only" ERP. A **Tauri desktop shell already exists** (`src-tauri/`) that bundles a Node runtime + the full backend bundle (`dist/boot.js`) + the built frontend, and spawns the backend as a **local HTTP server on `127.0.0.1:32145`** that the desktop window loads. A complete **sync protocol already exists on the server** (`api/syncRouter.ts`: push/pull, conflict detection, tombstones, device registration, offline POS sale application). A frontend **sync engine already exists** (`src/lib/sync/syncEngine.ts` + Dexie `localDatabase.ts`).

**The one critical gap that breaks offline today:** the backend's data layer is **MySQL-only** (`api/queries/connection.ts` hardcodes `drizzle-orm/mysql2`). The Tauri app passes `DATABASE_URL=mysql://erp:erp123@localhost:3306/erp`, i.e. the desktop app **requires a local MySQL server** — on a clean Windows machine with no MySQL, the bundled backend fails to start and the app is non-functional, online or offline. Everything else (sync protocol, shell, native printer commands) is in place and reusable.

> Note: the brief describes the backend as "Node/Express + MongoDB". The actual backend is **Node/Hono + tRPC + drizzle-orm over MySQL** (production `erp_yasco_prod`). The design in this audit and the companion design doc is based on the real stack.

---

## 2. What Already Exists (by area)

### 2.1 Desktop shell — `src-tauri/` (Tauri v2)

| Piece | Location | Notes |
|---|---|---|
| Window | `tauri.conf.json` → `url: "http://127.0.0.1:32145/app"` | Loads the LOCAL server, not the website — already not a "webview wrapper of yasco.tech" |
| Backend spawn | `src/lib.rs` → `start_local_backend()` | Spawns `node dist/boot.js` sidecar with `ERP_DESKTOP_MODE=true`, `HOST=127.0.0.1`, `PORT=32145`, `ERP_STATIC_DIR=<bundled dist/public>` |
| Bundled resources | `tauri.conf.json` → `bundle.resources` | `dist/boot.js`, `dist/public`, `package.json` |
| Node binary | `tauri.conf.json` → `externalBin: ["binaries/node"]` | **`src-tauri/binaries/` is EMPTY** — a platform node binary must be supplied at build time |
| Native print | `src/commands/pos_printer.rs` | `print_receipt`, `print_barcode`, `open_cash_drawer`, `get_printer_list` — real Windows printer access via JS API |
| Biometrics | `src/commands/biometric.rs` | fingerprint enroll/verify/capture, face capture |
| HW fingerprint | `src/commands/hardware_fingerprint.rs` | CPU id, disk serial, MAC (license binding) |
| Local SQLite | `tauri_plugin_sql` migration `sqlite:erp.db` | SQLite plugin registered but **currently unused by the frontend data layer** |

The window spawns the backend and waits for port 32145 to come up (15s timeout). `BackendChild` is killed on exit.

### 2.2 Server sync protocol — `api/syncRouter.ts` (production-ready)

- `sync.registerDevice(deviceId, deviceName, platform, appVersion)` — device registry.
- `sync.push({ changes: [{ entityType, entityId, action: create|update|delete, payload, deviceId, localUuid }] })`
  - `sales` + `create` → `createSyncedPosSale()` — creates an invoice on the server from an offline POS sale payload, decrements stock, writes a cashbox transaction. Returns `serverId`.
  - Other syncable entities (`products, customers, suppliers, invoices, invoiceItems, sales, purchases, payments, tasks, meetings`) → insert with `tenantId` + `localUuid` (tables carry `local_uuid` and `version` columns), update matched by `localUuid` with **version-based conflict detection** (`clientVersion < serverVersion` → `conflict` result with `serverVersion`).
  - Returns `{ results: [{entityId, localUuid, serverId, status: synced|failed|conflict, error?, message?}], conflicts: [...] }`.
- `sync.pull({ since })` — returns changed records per entity type since a timestamp + `tombstones` (deleted records).
- `sync.resolveConflict` — manual conflict resolution path (writes audit log `sync_conflict_resolved`).
- Syncable tables are defined in `SYNCABLE_TABLES` + `tableMap`. All server-side queries are tenant-scoped (`eq(table.tenantId, ctx.user.tenantId!)`).

**Implication:** the desktop app does NOT need a bespoke server-side sync endpoint. The local backend can reuse this exact protocol as the remote target.

### 2.3 Frontend offline layer — `src/lib/`

| File | Role |
|---|---|
| `lib/db/localDatabase.ts` | Dexie (IndexedDB) instance: `products, customers, suppliers, invoices, sales, purchases, payments, tasks, meetings, syncQueue, syncLogs` tables + `getDeviceId()` |
| `lib/sync/connectionDetector.ts` | online/offline detection + change events |
| `lib/sync/syncEngine.ts` | Push/pull engine: marks queue items `syncing → synced/failed/conflict`, writes `syncLogs`, pulls via `sync.pull({since})`, applies tombstones, 60s interval + on-reconnect |
| `lib/sync/offlineStorage.ts` | `getDeviceId()` (persisted device identity) |
| `lib/desktop/dexie-schema.ts`, `lib/desktop/sync-queue-service.ts` | Desktop-oriented schema + queue service (partially superseded by the above) |
| `providers/sync.tsx` | React `SyncProvider` + `useSync()` (status, retryAllFailed, stats) |
| `pages/sync/ConflictResolutionPage.tsx` | UI to review/retry conflicted queue items |
| `pages/sync/LocalDatabaseStatusPage.tsx` | Local DB + sync status UI |

**Gap:** no page mutation currently writes to the Dexie `syncQueue` in web mode (only the conflict page updates statuses). The engine is dormant scaffolding. In the desktop design (Stage B) the durable queue moves into the local backend's SQLite, and the frontend engine's `sync.push/pull` calls are answered by the **local backend**, which itself forwards to the remote — a single, consistent queue.

### 2.4 Frontend API client — `src/providers/trpc.tsx`

- tRPC HTTP client with `url: "/api/trpc"` — **same-origin**. Because the desktop window loads from `http://127.0.0.1:32145`, the frontend talks to the local backend automatically. No URL switch or online/offline branching in app code is required: the routing decision is made by *which server the window loaded from* (local in desktop, remote on the web).
- Transformer: `superjson` (Date markers in `meta.values` — must be handled by any adapter talking to the API directly).

### 2.5 Auth & licensing — `api/context.ts`, `api/auth-router.ts`, `api/lib/session.ts`

- `auth.passwordLogin({ username, password })` → compares against `env.adminPassword` (timing-safe), signs a **JWT session** (`APP_SECRET`, HS256, 1-year expiry), sets cookie `Session.cookieName`.
- `context.ts` has a **desktop-license + local-admin fallback**: when the DB is unavailable and the claim matches `localAdminUnionId()`, it returns `createLocalAdminUser()` — the architecture already anticipates DB-less operation.
- `auth.me` returns the current user.

**Implication for offline auth:** the local backend can (a) authenticate offline against a locally stored admin credential (first-run seeded from remote login), and (b) sign local session JWTs with the same `APP_SECRET` scheme so the frontend's session cookie flow works unchanged.

### 2.6 Printing

- A4: `src/lib/invoiceHtml.ts` builds invoice HTML and calls `window.print()` — pure frontend, works offline.
- Thermal: `trpc.thermalPrint.generateThermal({ invoiceId, format: "80mm" })` — **backend procedure** (returns HTML for the 80mm receipt). Must be mirrored by the local backend to print offline (native `print_receipt` Rust command exists as an alternative for direct printer IO).

### 2.7 Build/package scripts (`package.json`)

- `build:backend` → esbuild `api/boot.ts` → `dist/boot.js` (single-file backend bundle).
- `build:tauri` → `npm run build && npx tauri build`.
- There is **no CI workflow** for producing the Windows installer, and `src-tauri/binaries/` is empty.

---

## 3. Gap Analysis vs. Requirement

| # | Requirement | Status | Gap / Action |
|---|---|---|---|
| 1 | Native desktop shell (not webview of website) | ✅ Tauri shell loads local `127.0.0.1:32145` | None |
| 2 | Embedded local DB on user machine | ❌ Backend is MySQL-only; Tauri expects local MySQL | **Build local SQLite backend** (Stage B/C) |
| 3 | Business logic runs locally offline | ❌ Depends on #2 | Mirror core tRPC procedures against SQLite |
| 4 | Durable sync queue | ⚠️ Server protocol + frontend engine exist; no live queue population | Queue in local backend SQLite; reuse remote `sync.push/pull` |
| 5 | Auto-sync on reconnect | ✅ `connectionDetector` + engine + server protocol | Wire local backend ↔ remote adapter |
| 6 | Conflict detection + no silent overwrite | ✅ Server returns version conflicts; conflict UI exists | Surface conflicts through queue; financial records → flag, not LWW |
| 7 | tenantId/branch scoping on sync | ✅ Server scopes by `ctx.user.tenantId!` | Local backend must enforce the same |
| 8 | Offline: invoices CRUD + print thermal/A4 | ⚠️ A4 local; thermal via backend | Mirror `thermalPrint.generateThermal` |
| 9 | Offline: products/categories/customers/stock | ❌ Depends on #2 | Mirror procedures |
| 10 | POS offline | ✅ Server has `createSyncedPosSale` | Local POS = local invoice create + queue |
| 11 | ZATCA offline queue | ✅ Remote requires Fatoora; queue locally | Local `zatcaStatus: pending` until sync |
| 12 | Self-contained Windows installer | ⚠️ Tauri config complete; node binary missing; no CI | Bundle node.exe; add Windows build workflow |
| 13 | Auto-update | ❌ Not configured | Flagged as decision (see design) |

---

## 4. Conclusions

1. **Build the missing local data layer, reuse everything else.** The Tauri shell, native printing, sync protocol, frontend sync engine, and conflict UI are production-grade and should be reused as-is.
2. **The desktop backend is a new bundle** (`dist/desktop-boot.js`) that (a) serves `dist/public` statics, (b) answers the same-origin `/api/trpc` with mirrored core procedures over **SQLite** (`node:sqlite`, built into Node ≥ 22.5 — no native module), (c) runs the sync engine that forwards to `https://www.yasco.tech/api/trpc` using the existing `sync.push/pull` protocol.
3. **Auth is offline-capable by design** — local admin fallback + JWT sessions; first online run seeds local identity; later offline logins work.
4. **Windows packaging** must include a Node runtime binary (≥ v22.5 for `node:sqlite`) in `src-tauri/binaries/` and a CI build for the MSI/NSIS installer.

See `DESKTOP_OFFLINE_ARCHITECTURE_DESIGN.md` for the full design.
