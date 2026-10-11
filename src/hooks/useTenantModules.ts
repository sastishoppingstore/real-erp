import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { MODULE_PATH_PREFIXES } from "@/config/businessCatalog";

/* Core modules every tenant keeps regardless of tenant_modules (app chrome: home, reports, settings). */
export const ALWAYS_ON_MODULE_IDS = ["dashboard", "reports", "settings"];

/**
 * Server-authoritative module list for the current tenant.
 * Returns null when the server has no module rows yet -> callers fall back to local profile.
 */
export function useTenantModules() {
  const { data } = trpc.settings.modulesGet.useQuery(undefined, { retry: false, staleTime: 60_000 });

  const serverModules: string[] | null = useMemo(() => {
    const mods = (data as any)?.modules as string[] | undefined;
    if (!mods || !mods.length) return null;
    return Array.from(new Set([...ALWAYS_ON_MODULE_IDS, ...mods]));
  }, [data]);

  const serverPrefixes: string[] | null = useMemo(() => {
    if (!serverModules) return null;
    return Array.from(new Set(serverModules.flatMap((m) => MODULE_PATH_PREFIXES[m] || [])));
  }, [serverModules]);

  return { serverModules, serverPrefixes };
}

/** Sidebar/launcher path matching (dashboard prefix "/app" matches only the home route). */
export function isPathAllowed(path: string, prefixes: string[] | null) {
  if (!prefixes) return true;
  // Vertical POS modes need their own module enabled. A generic "/app/pos"
  // prefix (sales / pos_retail) must NOT leak Restaurant / Pharmacy POS into
  // tenants that never enabled those verticals.
  for (const restricted of RESTRICTED_POS_SUBPATHS) {
    if (path === restricted || path.startsWith(`${restricted}/`)) {
      return prefixes.some(
        (p) => p === restricted || (p.startsWith(`${restricted}/`) && (path === p || path.startsWith(`${p}/`))),
      );
    }
  }
  return prefixes.some((p) => path === p || (p !== "/app" && path.startsWith(`${p}/`)));
}

/**
 * POS sub-paths that belong to a specific vertical. Only an explicit module
 * prefix for the same vertical (e.g. pos_restaurant -> "/app/pos/restaurant")
 * may unlock them — a bare "/app/pos" prefix never does.
 */
const RESTRICTED_POS_SUBPATHS = ["/app/pos/restaurant", "/app/pos/pharmacy"];
