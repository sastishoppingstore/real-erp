import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/providers/language";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  getEnabledSidebarPathPrefixes,
  getStoredCategory,
  getVisibleGroupTitles,
} from "@/config/businessCatalog";
import {
  LAUNCHER_BACKGROUND,
  LAUNCHER_GROUPS,
  LAUNCHER_GRID_COLS,
  LAUNCHER_SHELF_PAGE_SIZE,
  LAUNCHER_TILE_RADIUS,
  type LauncherGroup,
  type LauncherTile,
} from "@/config/launcherTheme";

/* ─── module registry ─── */
const categoryGroupVisibility: Record<string, string[]> = {
  all: ['MAIN', 'FINANCE', 'INVENTORY', 'SALES', 'PURCHASE', 'CRM', 'HRM', 'MANUFACTURING', 'PROJECTS', 'WORKSHOP', 'CONSTRUCTION', 'HEALTHCARE', 'EDUCATION', 'HOTEL', 'REAL_ESTATE', 'TRANSPORT', 'TRAVEL', 'AVIATION', 'RESTAURANT', 'LAUNDRY', 'SALON', 'GYM', 'ECOMMERCE', 'PHARMACY', 'HOSTEL', 'OPERATIONS', 'PLATFORM', 'SYSTEM'],
};

/* ─── animation variants ─── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 22 } },
  exit: { opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.15 } },
};

/* ─── 3D Tile component ─── */
function Tile3D({
  label,
  icon: Icon,
  gradient,
  shadowColor,
  onClick,
  size = "large",
}: {
  label: string;
  icon: LucideIcon;
  gradient: string;
  shadowColor: string;
  onClick: () => void;
  size?: "large" | "small" | "sub";
}) {
  const isLarge = size === "large";
  const isSub = size === "sub";
  return (
    <motion.button
      variants={tileVariants}
      whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.2 } }}
      whileTap={{ y: 1, scale: 0.97 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50 cursor-pointer select-none"
      style={{
        background: gradient,
        boxShadow: `0 8px 24px -4px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`,
        width: isSub ? "170px" : undefined,
        height: isSub ? "170px" : undefined,
        padding: isSub ? "1.25rem" : isLarge ? "1.5rem 1rem" : "0.875rem 0.75rem",
        minHeight: isLarge ? "120px" : "80px",
        minWidth: isLarge ? undefined : "90px",
      }}
    >
      {/* Glossy highlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 45%, transparent 55%)",
        }}
      />
      <Icon className={`relative z-10 drop-shadow-md ${isSub ? "size-12" : isLarge ? "size-10" : "size-6"}`} strokeWidth={1.8} />
      <span
        className={`relative z-10 font-semibold leading-tight text-center drop-shadow-sm ${isSub ? "text-sm" : isLarge ? "text-xs" : "text-[10px]"}`}
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

/* ─── main component ─── */
export default function LauncherThemeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth({});
  const rtl = language === "ar";

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const [shelfScroll, setShelfScroll] = useState(0);

  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    const onScroll = () => setShelfScroll(el.scrollLeft);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* filter groups by business category */
  const isSuperAdmin = user?.role === "super_admin";
  const storedCategory = getStoredCategory();
  const visibleGroupKeys = isSuperAdmin
    ? categoryGroupVisibility.all
    : (getVisibleGroupTitles(storedCategory) || categoryGroupVisibility.all);
  const enabledPathPrefixes = isSuperAdmin ? null : getEnabledSidebarPathPrefixes(storedCategory);
  const isPathEnabled = (path: string) => {
    if (!enabledPathPrefixes) return true;
    return enabledPathPrefixes.some((p) => path === p || (p !== "/app" && path.startsWith(`${p}/`)));
  };

  const filteredGroups = LAUNCHER_GROUPS.filter(
    (g) => visibleGroupKeys.includes(g.key)
  );

  const topGroups = filteredGroups.slice(0, Math.min(filteredGroups.length, 12));
  const bottomGroups = filteredGroups;

  const activeGroupData = activeGroup
    ? filteredGroups.find((g) => g.key === activeGroup)
    : null;

  /* If we're on a page (not /app dashboard), don't show launcher */
  const isDashboardRoute = location.pathname === "/app" || location.pathname === "/app/";

  /* shelf scroll handlers */
  const scrollShelf = useCallback((dir: "left" | "right") => {
    shelfRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }, []);

  if (!isDashboardRoute) return null;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      {/* ─── Main Grid (~70%) ─── */}
      <div className={`flex-1 min-h-0 overflow-auto rounded-2xl ${LAUNCHER_BACKGROUND} p-5 shadow-xl border border-white/5`}>
        <AnimatePresence mode="wait">
          {activeGroupData ? (
            /* Drill-down sub-module view */
            <motion.div
              key={`sub-${activeGroup}`}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={containerVariants}
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveGroup(null)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  {rtl ? "رجوع" : "Back"}
                </motion.button>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <activeGroupData.icon className="size-5" />
                  {rtl ? activeGroupData.labelAr : activeGroupData.label}
                </h2>
              </div>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-7 justify-items-center"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {activeGroupData.children
                  .filter((c) => isPathEnabled(c.path))
                  .map((child) => (
                    <Tile3D
                      key={child.key}
                      label={rtl ? child.labelAr : child.label}
                      icon={child.icon}
                      gradient={child.gradient}
                      shadowColor={child.shadowColor}
                      onClick={() => navigate(child.path)}
                      size="sub"
                    />
                  ))}
              </motion.div>
            </motion.div>
          ) : (
            /* Top-level module grid */
            <motion.div
              key="top-grid"
              className={`${LAUNCHER_GRID_COLS} gap-4`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {topGroups.map((group) => (
                <Tile3D
                  key={group.key}
                  label={rtl ? group.labelAr : group.label}
                  icon={group.icon}
                  gradient={group.gradient}
                  shadowColor={group.shadowColor}
                  onClick={() => {
                    if (group.children.length === 1) {
                      navigate(group.children[0].path);
                    } else {
                      setActiveGroup(group.key);
                    }
                  }}
                  size="large"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Shelf (~20%) ─── */}
      <div className="shrink-0 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border border-white/10 shadow-lg px-2 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollShelf("left")}
            className="shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white size-8 transition-colors"
            aria-label={rtl ? "تمرير لليمين" : "Scroll left"}
          >
            <ChevronLeft className="size-4" />
          </button>

          <div
            ref={shelfRef}
            className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {bottomGroups.map((group) => (
              <motion.div
                key={`shelf-${group.key}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Tile3D
                  label={rtl ? group.labelAr : group.label}
                  icon={group.icon}
                  gradient={group.gradient}
                  shadowColor={group.shadowColor}
                  onClick={() => {
                    if (group.children.length === 1) {
                      navigate(group.children[0].path);
                    } else {
                      setActiveGroup(group.key);
                      // Scroll main grid to top
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  size="small"
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => scrollShelf("right")}
            className="shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white size-8 transition-colors"
            aria-label={rtl ? "تمرير لليسار" : "Scroll right"}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: Math.ceil(bottomGroups.length / LAUNCHER_SHELF_PAGE_SIZE) }).map((_, i) => {
            const tileW = 90 + 12;
            const start = i * LAUNCHER_SHELF_PAGE_SIZE * tileW;
            const end = start + LAUNCHER_SHELF_PAGE_SIZE * tileW;
            const isActive = shelfScroll >= start - 60 && shelfScroll < end - 60;
            return (
              <button
                key={i}
                onClick={() => {
                  shelfRef.current?.scrollTo({ left: i * LAUNCHER_SHELF_PAGE_SIZE * tileW, behavior: "smooth" });
                }}
                className={cn_dot(isActive)}
                aria-label={`Page ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function cn_dot(active: boolean) {
  return [
    "rounded-full transition-all duration-300 cursor-pointer",
    active ? "w-5 h-2 bg-emerald-400" : "w-2 h-2 bg-white/25 hover:bg-white/50",
  ].join(" ");
}
