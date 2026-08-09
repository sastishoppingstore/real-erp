import {
  LayoutDashboard, BookOpen, Package, ShoppingCart, ShoppingBag,
  Users, Briefcase, Factory, FolderKanban, HeadphonesIcon, Truck,
  Settings, BarChart3, Receipt, Landmark, Building2, Warehouse,
  Store, Wallet, CalendarCheck, CreditCard, FileText, Globe,
  ShieldCheck, Wrench, HardHat, Stethoscope, GraduationCap, Hotel,
  Home, Plane, Shirt, Scissors, Dumbbell, UtensilsCrossed, Pill,
  Workflow, Rocket, Palette, Key, UserPlus, FileWarning, Compass,
  Car, ParkingCircle, ClipboardList, Grid, Sparkles, type LucideIcon,
} from "lucide-react";

export interface ModuleEntry {
  id: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
  path: string;
  category: "core" | "pos" | "vertical" | "additional" | "system";
  isCore: boolean;
}

export const MODULE_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, BookOpen, Package, ShoppingCart, ShoppingBag,
  Users, Briefcase, Factory, FolderKanban, HeadphonesIcon, Truck,
  Settings, BarChart3, Receipt, Landmark, Building2, Warehouse,
  Store, Wallet, CalendarCheck, CreditCard, FileText, Globe,
  ShieldCheck, Wrench, HardHat, Stethoscope, GraduationCap, Hotel,
  Home, Plane, Shirt, Scissors, Dumbbell, UtensilsCrossed, Pill,
  Workflow, Rocket, Palette, Key, UserPlus, FileWarning, Compass,
  Car, ParkingCircle, ClipboardList, Grid, Sparkles,
};

export const MODULE_REGISTRY: ModuleEntry[] = [
  { id: "dashboard", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, path: "/app", category: "core", isCore: true },
  { id: "pos", label: "POS", labelAr: "نقطة البيع", icon: Store, path: "/app/pos", category: "pos", isCore: false },
  { id: "cashbox", label: "Cashbox", labelAr: "الصندوق", icon: Wallet, path: "/app/cashbox", category: "core", isCore: true },
  { id: "installments", label: "Installments", labelAr: "التقسيط", icon: CalendarCheck, path: "/app/installments", category: "core", isCore: false },
  { id: "accounting", label: "Accounting", labelAr: "المحاسبة", icon: BookOpen, path: "/app/accounting", category: "core", isCore: true },
  { id: "inventory", label: "Inventory", labelAr: "المخزون", icon: Package, path: "/app/inventory/products", category: "core", isCore: true },
  { id: "sales", label: "Sales", labelAr: "المبيعات", icon: ShoppingCart, path: "/app/sales/invoices", category: "core", isCore: true },
  { id: "purchase", label: "Purchase", labelAr: "المشتريات", icon: ShoppingBag, path: "/app/purchase/orders", category: "core", isCore: true },
  { id: "crm", label: "CRM", labelAr: "إدارة العملاء", icon: Users, path: "/app/crm/leads", category: "core", isCore: false },
  { id: "hrm", label: "HRM & Payroll", labelAr: "الموارد البشرية", icon: Users, path: "/app/hrm/employees", category: "core", isCore: true },
  { id: "manufacturing", label: "Manufacturing", labelAr: "التصنيع", icon: Factory, path: "/app/manufacturing/bom", category: "additional", isCore: false },
  { id: "projects", label: "Projects & Tasks", labelAr: "المشاريع", icon: FolderKanban, path: "/app/projects/list", category: "additional", isCore: false },
  { id: "helpdesk", label: "Help Desk", labelAr: "الدعم الفني", icon: HeadphonesIcon, path: "/app/helpdesk/tickets", category: "additional", isCore: false },
  { id: "assets", label: "Assets", labelAr: "الأصول", icon: Building2, path: "/app/assets/list", category: "additional", isCore: false },
  { id: "pos_retail", label: "POS - Retail", labelAr: "نقاط البيع - تجزئة", icon: Store, path: "/app/pos/retail", category: "pos", isCore: false },
  { id: "pos_restaurant", label: "POS - Restaurant", labelAr: "نقاط البيع - مطعم", icon: UtensilsCrossed, path: "/app/pos/restaurant", category: "pos", isCore: false },
  { id: "pos_pharmacy", label: "POS - Pharmacy", labelAr: "نقاط البيع - صيدلية", icon: Pill, path: "/app/pos/pharmacy", category: "pos", isCore: false },
  { id: "pos_wholesale", label: "POS - Wholesale", labelAr: "نقاط البيع - جملة", icon: Store, path: "/app/pos/wholesale", category: "pos", isCore: false },
  { id: "healthcare", label: "Hospital/Clinic", labelAr: "المستشفى/العيادة", icon: Stethoscope, path: "/app/verticals/healthcare/patients", category: "vertical", isCore: false },
  { id: "workshop", label: "Workshop/Garage", labelAr: "ورشة/كراج", icon: Wrench, path: "/app/verticals/workshop", category: "vertical", isCore: false },
  { id: "construction", label: "Construction", labelAr: "المقاولات", icon: HardHat, path: "/app/construction", category: "vertical", isCore: false },
  { id: "education", label: "School/University", labelAr: "مدرسة/جامعة", icon: GraduationCap, path: "/app/verticals/education/students", category: "vertical", isCore: false },
  { id: "hotel", label: "Hotel", labelAr: "فندق", icon: Hotel, path: "/app/verticals/hotel/rooms", category: "vertical", isCore: false },
  { id: "real_estate", label: "Real Estate", labelAr: "العقارات", icon: Home, path: "/app/verticals/real-estate/properties", category: "vertical", isCore: false },
  { id: "transport", label: "Transport/Logistics", labelAr: "النقل", icon: Truck, path: "/app/verticals/transport/fleet", category: "vertical", isCore: false },
  { id: "travel", label: "Travel Agency", labelAr: "وكالة سفر", icon: Compass, path: "/app/verticals/travel/bookings", category: "vertical", isCore: false },
  { id: "aviation", label: "Aviation", labelAr: "الطيران", icon: Plane, path: "/app/verticals/aviation/flights", category: "vertical", isCore: false },
  { id: "hostel", label: "Hostel / Staff Acc.", labelAr: "سكن / نزل", icon: Hotel, path: "/app/verticals/hostel/rooms", category: "vertical", isCore: false },
  { id: "pharmacy", label: "Pharmacy", labelAr: "صيدلية", icon: Pill, path: "/app/verticals/pharmacy/prescriptions", category: "vertical", isCore: false },
  { id: "restaurant", label: "Restaurant Mgmt", labelAr: "إدارة المطعم", icon: UtensilsCrossed, path: "/app/verticals/restaurant/menu", category: "vertical", isCore: false },
  { id: "laundry", label: "Laundry", labelAr: "المغسلة", icon: Shirt, path: "/app/verticals/laundry", category: "vertical", isCore: false },
  { id: "salon", label: "Salon", labelAr: "الصالون", icon: Scissors, path: "/app/verticals/salon", category: "vertical", isCore: false },
  { id: "gym", label: "Gym", labelAr: "النادي الرياضي", icon: Dumbbell, path: "/app/verticals/gym", category: "vertical", isCore: false },
  { id: "ecommerce", label: "Ecommerce", labelAr: "التجارة الإلكترونية", icon: Globe, path: "/app/verticals/ecommerce", category: "vertical", isCore: false },
  { id: "reports", label: "Reports", labelAr: "التقارير", icon: BarChart3, path: "/app/reports", category: "system", isCore: true },
  { id: "sync", label: "Sync Status", labelAr: "المزامنة", icon: Workflow, path: "/app/sync/queue", category: "system", isCore: false },
  { id: "settings", label: "Settings", labelAr: "الإعدادات", icon: Settings, path: "/app/settings", category: "system", isCore: true },
  { id: "company_profile", label: "Company Profile", labelAr: "ملف الشركة", icon: Building2, path: "/app/settings/company-profile", category: "system", isCore: true },
  { id: "zatca", label: "ZATCA", labelAr: "الزكاة والضريبة", icon: ShieldCheck, path: "/app/settings/zatca-integration", category: "system", isCore: false },
];

export function getModuleById(id: string): ModuleEntry | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getModulesByIds(ids: string[]): ModuleEntry[] {
  return MODULE_REGISTRY.filter((m) => ids.includes(m.id));
}

export const ALL_MODULE_IDS = MODULE_REGISTRY.map((m) => m.id);

export const CORE_MODULE_IDS = MODULE_REGISTRY.filter((m) => m.isCore).map((m) => m.id);

export { ALL_MODULES as ALL_MODULES_LEGACY } from "./modules";
