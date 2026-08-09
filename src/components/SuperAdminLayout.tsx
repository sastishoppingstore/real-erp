import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/providers/language";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard, Building2, CreditCard, FileWarning, Users,
  Settings, FileText, Key, LogOut, Menu, ShieldCheck,
  BarChart3, Mail, UserCheck, Headphones, Grid, PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/admin" },
  { label: "Companies", labelAr: "الشركات", icon: Building2, path: "/admin/companies" },
  { label: "Plans", labelAr: "الخطط", icon: CreditCard, path: "/admin/plans" },
  { label: "Compliance", labelAr: "الامتثال", icon: FileWarning, path: "/admin/compliance" },
  { label: "Licenses", labelAr: "التراخيص", icon: Key, path: "/admin/license-console" },
  { label: "License Approval", labelAr: "الموافقة", icon: ShieldCheck, path: "/admin/license-approval" },
  { label: "Resellers", labelAr: "الموزعون", icon: Headphones, path: "/admin/resellers" },
  { label: "Reseller Keys", labelAr: "مفاتيح الموزعين", icon: Key, path: "/admin/reseller-keys" },
  { label: "Master Control", labelAr: "التحكم الكامل", icon: Settings, path: "/admin/super-master-control" },
  { label: "SMTP Settings", labelAr: "إعدادات SMTP", icon: Mail, path: "/admin/smtp" },
  { label: "Email Templates", labelAr: "قوالب البريد", icon: FileText, path: "/admin/email-templates" },
  { label: "Impersonate", labelAr: "انتحال", icon: UserCheck, path: "/admin/impersonate" },
  { label: "Audit Logs", labelAr: "سجلات المراجعة", icon: BarChart3, path: "/admin/dashboard" },
  { label: "Invoice Settings", labelAr: "إعدادات الفاتورة", icon: FileText, path: "/admin/invoice-settings" },
];

type AdminTheme = "sidebar" | "app_launcher" | "launcher_theme";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    return (localStorage.getItem("yasco-admin-theme") as AdminTheme) || "launcher_theme";
  });
  const isAppLauncher = adminTheme === "app_launcher" || adminTheme === "launcher_theme";
  const isDashboard = useLocation().pathname === "/admin";

  useEffect(() => {
    localStorage.setItem("yasco-admin-theme", adminTheme);
  }, [adminTheme]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const { language, setLang } = useLanguage();
  const rtl = language === "ar";

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <img src="/logo-40.png" alt="YASCO" className="w-10 h-10 rounded-lg object-contain mx-auto" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "super_admin") {
    navigate("/app", { replace: true });
    return null;
  }

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      {isAppLauncher && isDashboard ? null : (
      <aside className={cn(
        "h-screen bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300",
        "fixed lg:static z-50",
        mobileOpen ? "left-0" : "-left-64 lg:left-0",
        sidebarOpen ? "w-64" : "w-16",
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-slate-700 p-4",
          sidebarOpen ? "gap-3" : "justify-center p-3",
        )}>
          <img src="/logo-40.png" alt="YASCO" className="w-8 h-8 rounded-lg object-contain" />
          {sidebarOpen && (
            <div>
              <span className="block font-bold text-sm text-white">YASCO</span>
              <span className="block text-[10px] text-amber-400">Super Admin</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-800",
                  isActive ? "bg-amber-600/20 text-amber-400 border-r-2 border-amber-500" : "text-slate-300",
                  !sidebarOpen && "justify-center px-3",
                )}
                title={!sidebarOpen ? (rtl ? item.labelAr : item.label) : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{rtl ? item.labelAr : item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center border-t border-slate-700 p-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900 text-white shadow-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1 hover:bg-slate-800 rounded">
              <Menu className="w-5 h-5" />
            </button>
            <a href="https://yasco.tech" className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors hidden sm:inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {rtl ? "العودة للموقع" : "Back to Site"}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdminTheme(adminTheme === "sidebar" ? "app_launcher" : adminTheme === "app_launcher" ? "launcher_theme" : "sidebar")}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
              title={rtl ? "تغيير نمط العرض" : "Toggle layout"}
            >
              {adminTheme === "sidebar" ? <Grid className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{adminTheme === "sidebar" ? "Grid" : adminTheme === "app_launcher" ? "3D Launcher" : "Sidebar"}</span>
            </button>
            <button
              onClick={() => setLang(language === "en" ? "ar" : "en")}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              {language === "en" ? "AR" : "EN"}
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {user?.name || "Super Admin"}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-800/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {rtl ? "خروج" : "Logout"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-4 lg:p-6">
          {isAppLauncher && isDashboard ? (
            <AdminAppLauncher navItems={navItems} theme={adminTheme} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

function AdminAppLauncher({ navItems: items, theme }: { navItems: typeof navItems; theme?: AdminTheme }) {
  const { language } = useLanguage();
  const rtl = language === "ar";
  const { user } = useAuth();
  const is3D = theme === "launcher_theme";

  const gradients = [
    "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
    "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
    "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  ];

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {rtl ? "مرحباً، " : "Welcome, "}{user?.name || "Admin"}
          {is3D && <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/30">3D Launcher</span>}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {rtl ? "لوحة تحكم المشرف العام" : "Super Admin Dashboard"}
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {items.map((item, idx) => (
          <Link
            key={item.path}
            to={item.path}
            style={is3D ? {
              background: gradients[idx % gradients.length],
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
            } : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-200 p-5 cursor-pointer group hover:-translate-y-1",
              is3D
                ? "border border-white/20 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
            )}
          >
            <div className={cn(
              "flex items-center justify-center size-14 rounded-2xl",
              is3D ? "bg-white/20 backdrop-blur-md" : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-inner"
            )}>
              <item.icon className={cn("size-7", is3D ? "text-white drop-shadow-md" : "text-white")} strokeWidth={1.5} />
            </div>
            <span className={cn(
              "text-xs sm:text-sm font-semibold text-center leading-tight",
              is3D ? "text-white drop-shadow-sm" : "text-slate-700 dark:text-slate-300"
            )}>
              {rtl ? item.labelAr : item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
