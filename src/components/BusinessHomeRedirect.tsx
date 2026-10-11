import { lazy } from "react";
import { Navigate } from "react-router";
import { useTenantModules } from "@/hooks/useTenantModules";
import AppLayout from "./AppLayout";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

/**
 * Business home for the exact /app route.
 * Construction tenants go straight to their Sahl-style dashboard
 * (/app/construction) — they never sit on the generic launcher.
 * Everyone else keeps the launcher Dashboard as today.
 * While modules load, a dark splash keeps the screen Sahl-consistent.
 */
export default function BusinessHomeRedirect() {
  const { serverModules, isLoadingModules } = useTenantModules();

  if (isLoadingModules || !serverModules) {
    if (isLoadingModules) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-900 via-stone-900 to-neutral-900">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <p className="text-sm text-emerald-200">... جار التحميل</p>
          </div>
        </div>
      );
    }
    return (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    );
  }

  if (serverModules.includes("construction")) {
    return <Navigate to="/app/construction" replace />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
