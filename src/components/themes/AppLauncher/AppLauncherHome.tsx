import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/providers/language";
import { useLayoutTheme } from "@/providers/layoutTheme";
import { AppIcon } from "./AppIcon";
import { MODULE_REGISTRY } from "@/config/moduleRegistry";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";

const categoryLabels: Record<string, { label: string; labelAr: string }> = {
  core: { label: "Core Business", labelAr: "الأعمال الأساسية" },
  pos: { label: "Point of Sale", labelAr: "نقاط البيع" },
  vertical: { label: "Industry Verticals", labelAr: "قطاعات صناعية" },
  additional: { label: "Additional", labelAr: "إضافي" },
  system: { label: "System", labelAr: "النظام" },
};

export default function AppLauncherHome() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const { setLayoutTheme } = useLayoutTheme();

  const { data: companySettings } = trpc.settings.companySettingsGet.useQuery(undefined, {
    retry: false,
  });
  const { data: tenantModules } = trpc.settings.themeGet.useQuery(undefined, {
    retry: false,
  });

  const enabledModuleIds = useMemo(() => {
    if (!companySettings) return null;
    const stored = companySettings.enabledModules as string[] | undefined;
    return stored && Array.isArray(stored) && stored.length > 0 ? stored : null;
  }, [companySettings]);

  const modules = useMemo(() => {
    let all = MODULE_REGISTRY;
    if (enabledModuleIds) {
      all = all.filter((m) => enabledModuleIds.includes(m.id));
    }
    const grouped: Record<string, typeof all> = {};
    for (const mod of all) {
      if (!grouped[mod.category]) grouped[mod.category] = [];
      grouped[mod.category].push(mod);
    }
    return grouped;
  }, [enabledModuleIds]);

  const companyName = companySettings?.companyName || (rtl ? "شركتك" : "Your Company");

  const handleSwitchToSidebar = useCallback(() => {
    setLayoutTheme("sidebar");
  }, [setLayoutTheme]);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white font-bold text-sm shadow">
              YA
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{companyName}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {rtl ? "نظام ERP" : "Enterprise ERP"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchToSidebar}
            className="gap-2 text-slate-600 dark:text-slate-300"
          >
            <PanelLeftOpen className="size-4" />
            <span className="hidden sm:inline">{rtl ? "القائمة الجانبية" : "Sidebar View"}</span>
            <span className="sm:hidden">{rtl ? "قائمة" : "Menu"}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-8">
        {Object.entries(modules).map(([category, mods]) => {
          const catLabel = categoryLabels[category];
          return (
            <section key={category}>
              {catLabel && (
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {rtl ? catLabel.labelAr : catLabel.label}
                </h2>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                {mods.map((mod) => (
                  <AppIcon
                    key={mod.id}
                    icon={mod.icon}
                    label={mod.label}
                    labelAr={mod.labelAr}
                    route={mod.path}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
