import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

interface AppIconProps {
  icon: LucideIcon;
  label: string;
  labelAr: string;
  route: string;
  badgeCount?: number;
  color?: string;
}

export function AppIcon({ icon: Icon, label, labelAr, route, badgeCount, color }: AppIconProps) {
  const { language } = useLanguage();
  const rtl = language === "ar";

  return (
    <Link
      to={route}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl p-4 sm:p-5",
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600",
        "transition-all duration-200",
        "group cursor-pointer"
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          "size-14 sm:size-16 rounded-2xl",
          "bg-gradient-to-br shadow-inner",
          color || "from-blue-500 to-blue-600"
        )}
      >
        <Icon className="size-7 sm:size-8 text-white" strokeWidth={1.5} />
        {badgeCount != null && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center leading-tight max-w-full truncate">
        {rtl ? labelAr : label}
      </span>
    </Link>
  );
}
