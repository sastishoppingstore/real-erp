import { deserialize, serialize } from "./superjson";
import { getDb } from "./sqlite";
import type { DatabaseSync } from "node:sqlite";

export const REMOTE_URL = process.env.ERP_REMOTE_URL || "https://www.yasco.tech";

let cookieJarCache: Record<string, string> | null = null;

function loadCookies(): Record<string, string> {
  if (cookieJarCache) return cookieJarCache;
  try {
    const row = getDb().prepare("SELECT value FROM sync_meta WHERE key = 'remote_cookies'").get() as
      | { value: string }
      | undefined;
    cookieJarCache = row?.value ? JSON.parse(row.value) : {};
  } catch {
    cookieJarCache = {};
  }
  return cookieJarCache;
}

function saveCookies(jar: Record<string, string>) {
  cookieJarCache = jar;
  try {
    getDb().prepare("INSERT OR REPLACE INTO sync_meta (key, value) VALUES ('remote_cookies', ?)").run(JSON.stringify(jar));
  } catch {
    // db not ready yet
  }
}

export function setRemoteCookies(cookies: Record<string, string>) {
  const current = loadCookies();
  const next = { ...current, ...cookies };
  saveCookies(next);
}

export function clearRemoteCookies() {
  saveCookies({});
}

export function remoteSessionActive(): boolean {
  const jar = loadCookies();
  return Boolean(jar.erp_sid);
}

function extractCookies(setCookieHeader: string | string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader ? [setCookieHeader] : [];
  for (const h of headers) {
    const m = /^([^=;]+)=([^;]*)/.exec(h);
    if (m) out[m[1].trim()] = m[2];
  }
  return out;
}

interface RemoteResult {
  json: unknown;
  meta?: { values?: Record<string, string[]> };
}

function parseBatchResponse(body: string): RemoteResult[] {
  const parsed = JSON.parse(body);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item) => {
    if (item?.error) throw new RemoteError(item.error.json?.message || "Remote error", item.error.json);
    return {
      json: item?.result?.data?.json,
      meta: item?.result?.data?.meta,
    };
  });
}

export class RemoteError extends Error {
  info: unknown;
  constructor(message: string, info: unknown) {
    super(message);
    this.info = info;
  }
}

export async function remoteCall(procedurePath: string, input: unknown, opts: { method?: "GET" | "POST" } = {}): Promise<unknown> {
  const method = opts.method || "GET";
  const url = `${REMOTE_URL}/api/trpc/${procedurePath}?batch=1`;
  const jar = loadCookies();
  const headers: Record<string, string> = {
    accept: "application/json",
    cookie: Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; "),
  };
  let body: string | undefined;
  if (method === "POST") {
    headers["content-type"] = "application/json";
    const ser = serialize(input);
    body = JSON.stringify({ "0": ser });
  } else {
    const ser = serialize(input);
    const q = encodeURIComponent(JSON.stringify({ "0": ser }));
    const finalUrl = `${url}&input=${q}`;
    const res = await fetch(finalUrl, { method, headers });
    const text = await res.text();
    const results = parseBatchResponse(text);
    return deserialize(results[0].json, results[0].meta?.values);
  }
  const res = await fetch(url, { method, headers, body });
  const setCookies = extractCookies(res.headers.get("set-cookie") || undefined);
  if (Object.keys(setCookies).length > 0) {
    setRemoteCookies(setCookies);
  }
  const text = await res.text();
  const results = parseBatchResponse(text);
  return deserialize(results[0].json, results[0].meta?.values);
}

export async function remoteLogin(username: string, password: string): Promise<{ user: Record<string, unknown> }> {
  const result = (await remoteCall("auth.passwordLogin", { username, password }, { method: "POST" })) as {
    success: boolean;
    user: Record<string, unknown>;
  };
  return { user: result.user };
}

export function remoteUserId(): number | null {
  try {
    const row = getDb().prepare("SELECT value FROM sync_meta WHERE key = 'remote_user_id'").get() as
      | { value: string }
      | undefined;
    return row?.value ? Number(row.value) : null;
  } catch {
    return null;
  }
}
