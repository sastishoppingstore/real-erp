import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync, createReadStream, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { initDb } from "./sqlite";
import { serialize } from "./superjson";
import { handlers, MUTATIONS, AUTH_REQUIRED, authMeHandler, ApiError, type RequestLike } from "./handlers";
import { startSyncEngine, syncOnce } from "./sync";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 32145);
const STATIC_DIR = process.env.ERP_STATIC_DIR || join(process.cwd(), "dist", "public");
const DB_PATH = process.env.ERP_DB_PATH || join(process.env.APPDATA || process.env.HOME || ".", ".yasco", "erp.sqlite");

initDb(DB_PATH);
startSyncEngine();

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain",
};

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseInputJson(raw: string | undefined): Record<string, { json: unknown }> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

interface CookieSetter {
  name: string;
  value: string;
  opts: Record<string, unknown>;
}

function buildSetCookie(c: CookieSetter): string {
  const parts = [`${c.name}=${c.value}`];
  const o = c.opts;
  if (o.maxAge !== undefined) parts.push(`Max-Age=${o.maxAge}`);
  if (o.path) parts.push(`Path=${o.path}`);
  if (o.httpOnly) parts.push("HttpOnly");
  if (o.sameSite) parts.push(`SameSite=${o.sameSite}`);
  if (o.secure) parts.push("Secure");
  return parts.join("; ");
}

async function handleTrpc(req: IncomingMessage, res: ServerResponse, pathname: string, query: URLSearchParams) {
  const procNames = pathname.replace(/^\/api\/trpc\/?/, "").split(",").filter(Boolean);
  if (procNames.length === 0) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "No procedure path" }));
    return;
  }
  const method = (req.method || "GET").toUpperCase();
  const isBatch = query.get("batch") === "1";
  const isGet = method === "GET";

  let inputMap: Record<string, { json: unknown }> = {};
  if (isGet) {
    inputMap = parseInputJson(query.get("input") || undefined);
  } else {
    const body = await parseBody(req);
    inputMap = parseInputJson(body);
  }

  const reqLike: RequestLike = {
    headers: req.headers as Record<string, string | undefined>,
    cookies: parseCookies(req.headers.cookie),
  };

  const setCookies: CookieSetter[] = [];
  const setCookieFn = (name: string, value: string, opts: Record<string, unknown>) => {
    setCookies.push({ name, value, opts });
  };

  const results = await Promise.all(
    procNames.map(async (proc, i) => {
      const input = inputMap[String(i)]?.json ?? {};
      const isMutation = MUTATIONS.has(proc);
      if (isGet && isMutation) {
        return errorEnvelope(proc, new ApiError(`Unsupported GET-request to mutation procedure at path "${proc}"`, { code: "METHOD_NOT_SUPPORTED", httpStatus: 405 }));
      }
      if (!isGet && !isMutation) {
        return errorEnvelope(proc, new ApiError(`Unsupported POST-request to query procedure at path "${proc}"`, { code: "METHOD_NOT_SUPPORTED", httpStatus: 405 }));
      }
      if (AUTH_REQUIRED.has(proc) && !handlers[proc]) {
        return errorEnvelope(proc, new ApiError(`Procedure not found: ${proc}`, { code: "NOT_FOUND", httpStatus: 404 }));
      }
      if (!handlers[proc]) {
        return errorEnvelope(proc, new ApiError(`Procedure not found: ${proc}`, { code: "NOT_FOUND", httpStatus: 404 }));
      }
      try {
        if (AUTH_REQUIRED.has(proc) && proc !== "auth.passwordLogin" && proc !== "auth.logout") {
          authMeHandler(reqLike);
        }
        const value = await handlers[proc](input, reqLike, setCookieFn);
        const ser = serialize(value);
        return {
          result: {
            data: ser,
          },
        };
      } catch (err) {
        return errorEnvelope(proc, err);
      }
    })
  );

  if (setCookies.length > 0) {
    res.setHeader("set-cookie", setCookies.map(buildSetCookie));
  }
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(isBatch ? results : results[0]));
}

function errorEnvelope(proc: string, err: unknown) {
  const apiErr = err instanceof ApiError ? err : new ApiError(err instanceof Error ? err.message : String(err));
  return {
    error: {
      json: {
        message: apiErr.message,
        code: apiErr.code,
        data: { code: apiErr.trpcCode, httpStatus: apiErr.httpStatus, path: proc },
      },
    },
  };
}

function serveStatic(req: IncomingMessage, res: ServerResponse, pathname: string) {
  if (!existsSync(STATIC_DIR)) {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Frontend build not found — run: npm run build" }));
    return;
  }
  let rel = pathname;
  if (rel.startsWith("/app")) rel = rel.slice(4) || "/";
  if (rel === "/" ) rel = "/index.html";
  const filePath = normalize(join(STATIC_DIR, rel));
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    });
    createReadStream(filePath).pipe(res);
    return;
  }
  const indexFile = join(STATIC_DIR, "index.html");
  if (existsSync(indexFile)) {
    const content = readFileSync(indexFile);
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
    res.end(content);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  const pathname = url.pathname;
  try {
    if (pathname.startsWith("/api/")) {
      if (pathname === "/api/health" || pathname === "/api/ping") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, ts: Date.now(), desktop: true }));
        return;
      }
      if (pathname.startsWith("/api/trpc")) {
        await handleTrpc(req, res, pathname, url.searchParams);
        return;
      }
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    serveStatic(req, res, pathname);
  } catch (err) {
    try {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
    } catch {
      /* socket may be closed */
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[desktop] YASCO desktop backend listening on http://${HOST}:${PORT}`);
  console.log(`[desktop] DB: ${DB_PATH}`);
  console.log(`[desktop] Static: ${STATIC_DIR}`);
  console.log(`[desktop] Remote: ${process.env.ERP_REMOTE_URL || "https://www.yasco.tech"}`);
  syncOnce().catch(() => {});
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
