import { lazy, Suspense, useEffect, useState } from "react";
import { Menu, Monitor, Smartphone, FileText, Clock, User, Home as HomeIcon, Search, Bell, Settings, LogOut } from "lucide-react";
import { Sidebar, MENU_LABELS } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { DriverHome } from "./components/DriverHome";
import { DriverOrders } from "./components/DriverOrders";
import { DriverHistory } from "./components/DriverHistory";
import { ShiftsView } from "./components/ShiftsView";
import { DriversView } from "./components/DriversView";
import { TripsView } from "./components/TripsView";
import { OrdersView } from "./components/OrdersView";
import { DocumentsView } from "./components/DocumentsView";
import { DirectoriesView } from "./components/DirectoriesView";
import { ExpensesView } from "./components/ExpensesView";
import { ChatView } from "./components/ChatView";
import { FuelView } from "./components/FuelView";
import { MaintenanceView } from "./components/MaintenanceView";
import { PayrollView } from "./components/PayrollView";
import { AppStoreProvider } from "./store/AppStore";
import { useAppStore } from "./store/AppStore";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { LoginScreen } from "./components/LoginScreen";
import { findCurrentShift, findDriverVehicle } from "./utils/driverData";

const ReportsView = lazy(() => import("./components/ReportsView").then((module) => ({ default: module.ReportsView })));

export default function App() {
  return (
    <AuthProvider>
      <AppStoreProvider>
        <AppShell />
      </AppStoreProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { dataMode } = useAppStore();
  const { user, isLoading, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentView, setCurrentView] = useState<"admin" | "driver">("admin");
  const [driverTab, setDriverTab] = useState<"home" | "orders" | "history" | "profile">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "driver") {
      setCurrentView("driver");
      setActiveItem("dashboard");
    }
  }, [user?.role]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Проверяем сессию...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const effectiveView = user.role === "driver" ? "driver" : currentView;
  const canSwitchView = user.role !== "driver";

  /* ── Driver view ── */
  if (effectiveView === "driver") {
    return (
      <div className="size-full bg-background text-foreground flex flex-col items-center min-h-screen">
        {/* Driver top bar — always visible on all screens */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-card/90 backdrop-blur-md border-b border-border/70 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-primary/20 shadow-[0_8px_18px_rgba(47,147,215,0.12)] overflow-hidden">
              <img src="/logo.png" alt="2-АА Неруд" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-bold tracking-wide text-foreground">2-АА Неруд</span>
          </div>
          <div className="flex items-center gap-2">
            {canSwitchView && <ViewToggle currentView={effectiveView} onViewChange={setCurrentView} />}
            <button onClick={signOut} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="Выйти">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="w-full max-w-md relative pt-14">
          <div className="pb-24">
            {driverTab === "home"    && <DriverHome />}
            {driverTab === "orders"  && <DriverOrders />}
            {driverTab === "history" && <DriverHistory />}
            {driverTab === "profile" && <DriverProfile />}
          </div>
          <DriverBottomNav tab={driverTab} onTabChange={setDriverTab} />
        </div>
      </div>
    );
  }

  /* ── Admin view ── */
  const sectionLabel = MENU_LABELS[activeItem] ?? activeItem;
  const allowedAdminItems = getAllowedAdminItems(user.role);
  const safeActiveItem = allowedAdminItems.includes(activeItem) ? activeItem : "dashboard";

  function handleAdminItemClick(id: string) {
    setActiveItem(allowedAdminItems.includes(id) ? id : "dashboard");
    setSidebarOpen(false);
  }

  return (
    <div className="size-full flex flex-col bg-background text-foreground font-sans">

      {/* ── Mobile top header (hidden on md+) ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 flex items-center gap-3 px-4 bg-background/88 border-b border-border/70 shadow-md backdrop-blur-xl"
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-primary/20 shadow-[0_8px_18px_rgba(47,147,215,0.12)] overflow-hidden">
             <img src="/logo.png" alt="2-АА Неруд" className="h-full w-full object-cover" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-wide text-foreground leading-none">
            2-АА Неруд
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1 capitalize">{sectionLabel}</p>
        </div>

        {canSwitchView && <ViewToggle currentView={effectiveView} onViewChange={setCurrentView} />}
      </header>

      {/* ── Main layout row ── */}
      <div className="flex flex-1 overflow-hidden pt-16 md:pt-0 relative">

        {/* Sidebar container */}
        <div className="flex-shrink-0 z-50">
          <Sidebar
            activeItem={safeActiveItem}
            onItemClick={handleAdminItemClick}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            allowedItems={allowedAdminItems}
          />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-background relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(83,184,197,0.18),transparent_31%),radial-gradient(circle_at_12%_88%,rgba(47,147,215,0.10),transparent_34%)]" />
          
          {/* Dashboard Header (Desktop) */}
          <header className="hidden md:flex items-center justify-between px-8 py-5 bg-card/82 backdrop-blur-xl border-b border-border/70 sticky top-0 z-10 shadow-sm">
            <div className="flex flex-col">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success shadow-[0_0_10px_rgba(22,166,106,0.35)]" />
                2-АА Неруд · операционный контур
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {sectionLabel === "dashboard" ? "Панель управления" : sectionLabel}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Контроль заявок, рейсов, смен и документов в одном окне</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Источник данных: {dataMode === "supabase" ? "Supabase" : "mock-режим"}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search fleet, drivers, routes..." 
                  className="bg-input-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm text-foreground rounded-full pl-9 pr-4 py-2 w-72 outline-none transition-all placeholder:text-muted-foreground/60 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(83,184,197,0.5)]"></span>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="h-8 w-px bg-border mx-1"></div>
                
                {canSwitchView && <ViewToggle currentView={effectiveView} onViewChange={setCurrentView} />}

                <div className="flex items-center gap-3 ml-2 pl-2">
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-semibold text-foreground leading-none">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.role === "admin" ? "Руководитель" : "Оператор"}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border p-0.5 bg-white">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shadow-inner">
                      {getInitials(user.fullName)}
                    </div>
                  </div>
                  <button onClick={signOut} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all" title="Выйти">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="relative z-[1] flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {safeActiveItem === "dashboard"   && <Dashboard />}
              {safeActiveItem === "orders"      && <OrdersView />}
              {safeActiveItem === "trips"       && <TripsView />}
              {safeActiveItem === "shifts"      && <ShiftsView />}
              {safeActiveItem === "documents"   && <DocumentsView />}
              {safeActiveItem === "directories" && <DirectoriesView />}
              {safeActiveItem === "expenses"    && <ExpensesView />}
              {safeActiveItem === "chat"        && <ChatView />}
              {safeActiveItem === "drivers"     && <DriversView />}
              {safeActiveItem === "reports"     && (
                <Suspense fallback={<SectionLoading label="Загружаем отчёты..." />}>
                  <ReportsView />
                </Suspense>
              )}
              {safeActiveItem === "fuel"        && <FuelView />}
              {safeActiveItem === "maintenance" && <MaintenanceView />}
              {safeActiveItem === "payroll"     && <PayrollView />}

              {/* Fallback for unimplemented sections */}
              {!["dashboard","orders","trips","shifts","documents","directories","expenses",
                 "chat","drivers","reports","fuel","maintenance","payroll"].includes(safeActiveItem) && (
                <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center px-8">
                    <div className="w-24 h-24 rounded-[20px] dashboard-panel mx-auto mb-6 flex items-center justify-center border border-primary/20 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                      <span className="text-4xl text-primary drop-shadow-[0_0_12px_rgba(42,133,255,0.6)] relative z-10">⚙</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Раздел в разработке</h2>
                    <p className="text-muted-foreground capitalize">{MENU_LABELS[safeActiveItem] ?? safeActiveItem}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getAllowedAdminItems(role: string) {
  const baseItems = ["dashboard", "orders", "trips", "shifts", "documents", "chat", "reports"];
  if (role === "admin" || role === "operator") {
    return [...baseItems, "drivers", "directories", "expenses", "fuel", "maintenance", "payroll", "settings", "ocr", "vehicles"];
  }
  return baseItems;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[320px]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/* ── Unified view switcher (admin ↔ driver) ── */
function ViewToggle({
  currentView,
  onViewChange,
}: {
  currentView: "admin" | "driver";
  onViewChange: (v: "admin" | "driver") => void;
}) {
  return (
    <div className="flex bg-secondary p-1 rounded-full border border-border">
      <button
        onClick={() => onViewChange("admin")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          currentView === "admin"
            ? "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(47,147,215,0.18)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/70"
        }`}
        title="Панель диспетчера"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange("driver")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          currentView === "driver"
            ? "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(47,147,215,0.18)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/70"
        }`}
        title="Приложение водителя"
      >
        <Smartphone className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── Driver profile tab ── */
function DriverProfile() {
  const { user, signOut } = useAuth();
  const { shifts, vehicles, getDriverOrders } = useAppStore();
  const driverName = user?.fullName ?? "Водитель";
  const driverId = user?.id;
  const currentShift = findCurrentShift(shifts, driverName, driverId);
  const driverOrders = getDriverOrders(driverName, driverId);
  const vehicleInfo = findDriverVehicle(vehicles, currentShift, driverOrders, driverName, driverId);

  return (
    <div className="p-6">
      <div className="dashboard-panel p-8 text-center mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-primary/15 to-transparent flex items-center justify-center text-primary text-4xl font-bold mx-auto mb-6 border border-primary/20 shadow-[0_12px_28px_rgba(47,147,215,0.14)]">
          {getInitials(driverName).slice(0, 1) || "В"}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{driverName}</h2>
        <div className="inline-flex items-center gap-2 bg-secondary px-4 py-1.5 rounded-full border border-border mt-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(22,166,106,0.35)]"></div>
          <span className="text-sm font-medium text-muted-foreground">Водитель{vehicleInfo ? ` • ${vehicleInfo.plate}` : ""}</span>
        </div>
        <div className="space-y-3 text-left">
          <div className="w-full bg-secondary/70 border border-border rounded-xl px-6 py-4 text-sm text-foreground">
            <p className="text-xs text-muted-foreground mb-1">Автомобиль</p>
            <p className="font-semibold">{vehicleInfo ? `${vehicleInfo.plate} · ${vehicleInfo.model}` : "Не назначен"}</p>
          </div>
          <button className="w-full bg-secondary/70 border border-border hover:border-primary/30 hover:bg-secondary rounded-xl px-6 py-4 text-sm font-medium text-foreground transition-all flex items-center justify-between group">
            Настройки
            <span className="text-muted-foreground group-hover:text-primary">→</span>
          </button>
          <button className="w-full bg-secondary/70 border border-border hover:border-primary/30 hover:bg-secondary rounded-xl px-6 py-4 text-sm font-medium text-foreground transition-all flex items-center justify-between group">
            Документы
            <span className="text-muted-foreground group-hover:text-primary">→</span>
          </button>
          <button onClick={signOut} className="w-full bg-status-error/10 border border-status-error/20 hover:bg-status-error/20 rounded-xl px-6 py-4 text-sm font-medium text-status-error transition-all mt-4">
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Driver bottom nav ── */
function DriverBottomNav({
  tab,
  onTabChange,
}: {
  tab: string;
  onTabChange: (t: "home" | "orders" | "history" | "profile") => void;
}) {
  const tabs = [
    { id: "home",    Icon: HomeIcon, label: "Главная"  },
    { id: "orders",  Icon: FileText, label: "Заказы"   },
    { id: "history", Icon: Clock,    label: "История"  },
    { id: "profile", Icon: User,     label: "Профиль"  },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/92 backdrop-blur-md border-t border-border/70 pb-safe z-40 shadow-[0_-12px_28px_rgba(35,64,88,0.08)]">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map(({ id, Icon, label }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col items-center gap-1 w-16 py-2 rounded-xl transition-all duration-300 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl -z-10"></div>
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(47,147,215,0.35)]"></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
}
