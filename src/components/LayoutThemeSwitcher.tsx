import { useState, useRef, useEffect } from "react";
import { LayoutGrid, PanelLeft, LayoutDashboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLayoutTheme, type LayoutTheme } from "@/providers/layoutTheme";
import { useLanguage } from "@/providers/language";

const themeOptions: { value: LayoutTheme; label: string; labelAr: string; icon: typeof LayoutGrid }[] = [
  { value: "sidebar", label: "Sidebar", labelAr: "قائمة جانبية", icon: PanelLeft },
  { value: "app_launcher", label: "App Launcher", labelAr: "لانشر التطبيقات", icon: LayoutDashboard },
  { value: "launcher_theme", label: "Launcher Theme", labelAr: "ثيم اللانشر", icon: LayoutGrid },
];

export function LayoutThemeSwitcher() {
  const { layoutTheme, setLayoutTheme } = useLayoutTheme();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = themeOptions.find((t) => t.value === layoutTheme) ?? themeOptions[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white gap-1.5 px-2.5"
        title={rtl ? "تغيير شكل الشاشة" : "Change view"}
        aria-label={rtl ? "تغيير شكل الشاشة" : "Change view"}
        aria-expanded={open}
      >
        <CurrentIcon className="size-4" />
        <span className="text-xs font-semibold hidden sm:inline">
          {rtl ? current.labelAr : current.label}
        </span>
      </Button>

      {open && (
        <div
          className={cn_dropdown(rtl)}
          role="menu"
        >
          {themeOptions.map((opt) => {
            const OptIcon = opt.icon;
            const isActive = opt.value === layoutTheme;
            return (
              <button
                key={opt.value}
                role="menuitem"
                onClick={() => {
                  setLayoutTheme(opt.value);
                  setOpen(false);
                }}
                className={cn_item(isActive)}
              >
                <OptIcon className="size-4 shrink-0" />
                <span className="flex-1 text-start">{rtl ? opt.labelAr : opt.label}</span>
                {isActive && <Check className="size-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function cn_dropdown(rtl: boolean) {
  return [
    "absolute top-full mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50",
    rtl ? "left-0" : "right-0",
  ].join(" ");
}

function cn_item(active: boolean) {
  return [
    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
    active ? "text-emerald-700 bg-emerald-50" : "text-slate-700 hover:bg-slate-50",
  ].join(" ");
}
