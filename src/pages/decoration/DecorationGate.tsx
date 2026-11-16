/**
 * Decoration & Construction — module gate.
 *
 * The Decoration routes belong to the `decoration` module. Only a tenant that
 * has that module enabled may open them; anybody else (a Sahl / construction
 * tenant, the ERP owner tenant, …) is sent back to their own home.
 *
 * This keeps the two modules genuinely separate without touching the legacy
 * Sahl / construction module in any way.
 */
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useTenantModules } from "@/hooks/useTenantModules";

export default function DecorationGate({ children }: { children: ReactNode }) {
  const { serverModules, isLoadingModules } = useTenantModules();

  // While the server-authoritative module list is loading, hold the screen
  // instead of guessing — a wrong redirect would bounce the user out of the
  // module they are entitled to.
  if (isLoadingModules) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-950">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-emerald-200">جارٍ تحميل الوحدة…</p>
        </div>
      </div>
    );
  }

  // No module list (tenant has no rows) or no `decoration` module → not ours.
  if (!serverModules || !serverModules.includes("decoration")) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
