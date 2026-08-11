# DESKTOP OFFLINE ARCHITECTURE — DESIGN

**Project:** YASCO ERP desktop app  
**Date:** 2026-08-11  
**Builds on:** `DESKTOP_OFFLINE_ARCHITECTURE_AUDIT.md` (read first)

---

## 1. Architecture Overview

```
┌─────────────────────────── Desktop (Windows) ───────────────────────────┐
│                                                                         │
│  Tauri window (127.0.0.1:32145/app)                                     │
│  React app (same-origin tRPC client → "/api/trpc")                      │
│        │                                                                │
│        ▼                                                                │
│  ┌───────────────────────────────────────────────┐                      │
│  │ Local backend  (node dist/desktop-boot.js)    │  ← sidecar (bundled) │
│  │  • static: dist/public                        │                      │
│  │  • /api/trpc: mirrored core procedures        │                      │
│  │  • auth: local JWT sessions (APP_SECRET)      │                      │
│  │  • SQLite (node:sqlite) — core tables + sync  │                      │
│  │    queue (durable)                            │                      │
│  │  • Sync engine thread (30s + on-write)        │                      │
│  │        │                                      │                      │
│  │        ▼ (HTTPS + session cookie)             │                      │
│  └──┴──► Remote adapter: https://www.yasco.tech/ │                      │
│                 api/trpc (auth.passwordLogin,     │                      │
│                 sync.push, sync.pull,             │                      │
│                 sync.resolveConflict, sync.getDevices)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key decision: "local-first with queue, authoritative remote."** All reads/writes in desktop mode hit the local SQLite. Every local mutation is (1) applied to SQLite immediately and (2) appended to a durable `sync_queue` table. A background engine flushes the queue to the remote (`sync.push`), pulls remote changes (`sync.pull` since last sync), and records conflicts. The remote (yasco.tech) remains authoritative for tenant data and resolves the sync protocol's version conflicts.

---

## 2. Local SQLite Schema (`node:sqlite`, bundled Node ≥ 22.5)

Tables mirror the MySQL schema for the **core offline surface**, adding the columns the sync protocol needs (`local_uuid`, `version`, `tenant_id`, `updated_at`), exactly like the server tables.

```
core tables (per tenant row):
  users           id, union_id, name, email, role, is_active, tenant_id,
                  password_hash (scrypt for offline auth), created_at, updated_at
  categories      id, name, description, tenant_id, local_uuid, version, updated_at
  products        id, sku, name, barcode, price, cost_price, vat_rate, image_url,
                  category_id, is_active, tenant_id, local_uuid, version, updated_at
  customers       id, name, phone, email, address, tax_number, is_active,
                  tenant_id, local_uuid, version, updated_at
  invoices        id, invoice_no, customer_id, subtotal, discount, vat, total,
                  status (draft|completed|cancelled), payment_method,
                  zatca_status, invoice_date, created_by, tenant_id,
                  local_uuid, version, updated_at
  invoice_items   id, invoice_id, product_id, description, qty, unit_price,
                  discount, vat, total, tenant_id, local_uuid, version, updated_at
  stock_movements id, product_id, warehouse_id, qty_change, reason,
                  ref_type, ref_id, tenant_id, created_at   (audit trail; not synced)

sync tables:
  sync_queue      id, entity_type, entity_id, local_uuid, action,
                  payload_json, status (pending|syncing|synced|failed|conflict),
                  error, attempts, created_at, updated_at
  sync_meta       key, value        (last_pull_at, last_push_at, device_id,
                                     remote_user_id, remote_tenant_id, app_version)
  sync_conflicts  id, queue_id, entity_type, entity_id, local_version,
                  server_version, local_payload_json, server_payload_json,
                  resolved (0/1), resolution, created_at
```

- **Identity:** `local_uuid` = UUID v4 generated locally at create time; it is the join key with the server (`server_id` mapping stored in `sync_queue` result / `serverId` column back into the row's `server_id`).
- **`version`:** monotonically incremented on every local update. Pushed to remote so the server can run its existing conflict check (`clientVersion < serverVersion → conflict`). On pull, rows with `serverVersion > localVersion` are conflict candidates.

---

## 3. Mirrored tRPC Procedure Surface (local backend)

Same procedure paths and input shapes as the server so the frontend needs **zero code changes**:

```
auth.passwordLogin, auth.me, auth.logout
settings.companySettingsGet
inventory.categoryList, inventory.categoryCreate, inventory.productList,
    inventory.productCreate, inventory.warehouseList, inventory.warehouseCreate,
    inventory.inventoryList
sales.customerList, sales.customerCreate, sales.customerUpdate,
    sales.invoiceList, sales.invoiceGet, sales.invoiceCreate,
    sales.invoiceUpdate, sales.invoiceUpdateStatus, sales.invoiceDelete
pos.createSaleInvoice, pos.todaySalesSummary, pos.sessionCurrent,
    pos.heldSalesList, pos.holdSale, pos.resumeHold
thermalPrint.generateThermal
zatca.generateQrCode, zatca.syncStatus            (ZATCA clearance is queued; see §7)
sync.push, sync.pull, sync.registerDevice, sync.resolveConflict   (answered against
    local queue; the LOCAL engine forwards to remote)
```

All queries are scoped by the local session's `tenant_id` (mirroring the server's `ctx.user.tenantId` enforcement).

---

## 4. Sync Engine Design

### 4.1 Remote adapter (`desktop/backend/remote.ts`)
- HTTPS client with cookie jar against `https://www.yasco.tech/api/trpc` (tRPC batch protocol, superjson response decoding: parse `meta.values` Date markers).
- Session: on first online run, `auth.passwordLogin` with the user's real credentials → remote session cookie persisted in `sync_meta` → used for all pushes/pulls. If the remote session expires (401), the engine pauses and marks `needOnlineAuth` (app prompts once for credentials).

### 4.2 Push pipeline
1. Local mutation → transactionally insert row + enqueue `sync_queue` row (status `pending`).
2. Engine (every 30s and immediately after any enqueue when online): drain queue in order (oldest first, `attempts < 5`, `status != conflict`).
3. Each item → `remote sync.push([change])` → map response:
   - `status: synced` → store `serverId`, mark `synced`.
   - `status: conflict` → copy local+server payloads into `sync_conflicts`, mark queue `conflict`. **No silent overwrite** — surfaced in the existing `ConflictResolutionPage` via `trpc.sync.*` (local answers it from SQLite).
   - `status: failed` → retry with backoff (`attempts++`); after 5 attempts stays `failed` (visible in the app, retryable).
4. Delete-success rule for `sales.create` (no idempotency key server-side): items are marked `syncing` before dispatch and only `synced` on success; on network failure mid-flight the app re-queues **only if the local row still references a local-only server_id** — dedupe by checking whether the remote already created the invoice (`auth.me`-scoped `sales.invoiceList` query by `local_uuid` — one call per in-flight item, throttled). Default: leave item `syncing` and retry; the first successful response is recorded; duplicates are prevented because retry only re-sends if the server has no record of that `local_uuid`.

### 4.3 Pull pipeline
- Track `last_pull_at` in `sync_meta`. Engine calls `remote sync.pull({since: last_pull_at})`.
- Apply: for each changed row, upsert into SQLite matched by `local_uuid` — **if local `version > server version` for the same uuid → create conflict record (see §4.2)**; otherwise overwrite local (server wins for rows we haven't touched).
- Apply tombstones as local deletes (soft: `is_deleted` flag for financial records; hard delete for products/customers kept consistent with server semantics).
- Update `last_pull_at` only after all rows applied cleanly.

### 4.4 Conflict resolution
- Default: **flag, never overwrite**. Financial records (invoices, payments, sales) always go to conflict review — no LWW.
- `ConflictResolutionPage` (existing UI) lists conflicts from `sync_conflicts`; user picks **server version** or **local version**; `sync.resolveConflict` records the choice and clears the conflict; the winning version is pushed/kept.

### 4.5 Devices
- `sync.registerDevice` called on first launch with the hardware fingerprint device id (from the existing Rust command) — remote records the device; multiple devices allowed; the remote's device list (`sync.getDevices`) is shown in the app's sync status page.

---

## 5. Offline Auth Design

1. **First run (online required once):** user enters their yasco.tech credentials → local backend calls remote `auth.passwordLogin` → stores remote session + `remote_user_id`/`remote_tenant_id` in `sync_meta` → seeds/creates the local `users` row with a locally-generated scrypt hash (master password option: user sets an offline PIN/password, stored as scrypt) → issues a **local JWT session** signed with `APP_SECRET` (same scheme as server sessions).
2. **Offline runs:** `auth.passwordLogin` verifies against the local scrypt hash → local JWT session cookie → `auth.me` works. No network dependency.
3. If the user clears local data: full re-pairing flow (online).

---

## 6. Printing

- **A4 invoice:** unchanged — `src/lib/invoiceHtml.ts` + `window.print()` (local, offline).
- **Thermal 80mm:** local backend implements `thermalPrint.generateThermal` returning the same receipt HTML the server returns (mirrored logic), so the POS receipt flow works offline. Native `print_receipt` Rust command remains available for direct printer IO (used when a raw print is desired).

---

## 7. ZATCA Offline Strategy

- **Online:** `zatca.clearanceInvoice` goes straight to the remote (as today).
- **Offline invoice create/update:** local `zatca_status = 'pending_local'`; a `sync_queue` item (`entity_type: 'zatca', action: 'clearance'`) is enqueued. When the engine flushes, the remote clears the invoice; local status updates on the next pull. The invoice list shows "Pending ZATCA clearance" badge until confirmed (no silent failure — user is told clearance is queued).

---

## 8. Packaging & Windows Build

1. **Node runtime:** bundle Windows x64 `node.exe` (≥ 22.5, LTS recommended) → `src-tauri/binaries/node.exe` (matched by `externalBin: ["binaries/node"]`).
2. **Tauri resources:** `dist/desktop-boot.js` (new esbuild bundle), `dist/public`, `package.json` — per existing config; add `dist/desktop-boot.js` to `bundle.resources`.
3. **Sidecar env changes** (`src-tauri/src/lib.rs`):
   - sidecar script → `dist/desktop-boot.js`
   - `DATABASE_URL` → **remove** (SQLite lives at `<app-data>/erp.sqlite`)
   - add `ERP_REMOTE_URL=https://www.yasco.tech`
   - keep `ERP_DESKTOP_MODE=true`, `HOST=127.0.0.1`, `PORT=32145`, `APP_ID`, `APP_SECRET` (auto-generated and persisted per install for stable session signing).
4. **Windows installer:** build on `windows-latest` (NSIS/MSI) — provided as a GitHub Actions workflow `desktop-windows.yml` (Tauri cross-build from Linux is not supported). Local verification on this Linux host: `npx tauri build` produces the Linux bundle used for the Stage-D test run.
5. **Auto-update:** flagged as a future decision (tauri-plugin-updater ready when productized); NOT in this iteration.

---

## 9. Test Plan (Stage D)

| # | Scenario | Expectation |
|---|---|---|
| 1 | Clean start, online | Backend boots, SQLite initializes, login works, remote pairing succeeds |
| 2 | Create invoice offline (network blocked) | Saves locally, prints A4 + thermal, status `pending_local`/queued |
| 3 | Reconnect | Queue flushes; invoice appears in yasco.tech; `serverId` recorded; no duplicates |
| 4 | Concurrent edit conflict | Local edit while offline vs server edit → conflict entry, no overwrite; user resolves |
| 5 | Pull | Remote changes (created in web app) appear locally |
| 6 | Tombstones | Remote delete propagates as local delete |
| 7 | ZATCA queue | Offline invoice → `pending_local` → cleared after sync |
| 8 | Long offline | 30+ min offline with multiple writes; all queued; no data loss; app remains functional |

Deliverable: `DESKTOP_APP_TEST_REPORT.md` with per-scenario results.
