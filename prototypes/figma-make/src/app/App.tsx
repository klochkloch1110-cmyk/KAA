import { useState } from "react";
import { Menu, Monitor, Smartphone, FileText, Clock, User, Home as HomeIcon, Search, Bell, Settings, Plus } from "lucide-react";
import { Sidebar, MENU_LABELS } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { DriverHome } from "./components/DriverHome";
import { DriverOrders } from "./components/DriverOrders";
import { DriverHistory } from "./components/DriverHistory";
import { ShiftsView } from "./components/ShiftsView";
import { DriversView } from "./components/DriversView";
import { ReportsView } from "./components/ReportsView";
import { TripsView } from "./components/TripsView";
import { OrdersView } from "./components/OrdersView";
import { DocumentsView } from "./components/DocumentsView";
import { ExpensesView } from "./components/ExpensesView";
import { ChatView } from "./components/ChatView";
import { FuelView } from "./components/FuelView";
import { MaintenanceView } from "./components/MaintenanceView";
import { PayrollView } from "./components/PayrollView";

export default function App() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentView, setCurrentView] = useState<"admin" | "driver">("admin");
  const [driverTab, setDriverTab] = useState<"home" | "orders" | "history" | "profile">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Driver view ── */
  if (currentView === "driver") {
    return (
      <div className="size-full bg-background text-foreground flex flex-col items-center min-h-screen">
        {/* Driver top bar — always visible on all screens */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#0B0E14]/90 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_rgba(42,133,255,0.2)]">
              <span className="text-primary font-bold text-xs">А</span>
            </div>
            <span className="text-sm font-bold tracking-wide text-foreground">АВЛ 84</span>
          </div>
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
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

  return (
    <div className="size-full flex flex-col bg-background text-foreground font-sans">

      {/* ── Mobile top header (hidden on md+) ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-16 flex items-center gap-3 px-4 bg-[#0B0E14] border-b border-border/50 shadow-md"
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_rgba(42,133,255,0.2)]">
             <span className="text-primary font-bold text-sm">А</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-wide text-foreground leading-none">
            АВЛ 84
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1 capitalize">{sectionLabel}</p>
        </div>

        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </header>

      {/* ── Main layout row ── */}
      <div className="flex flex-1 overflow-hidden pt-16 md:pt-0 relative">

        {/* Sidebar container */}
        <div className="flex-shrink-0 z-50">
          <Sidebar
            activeItem={activeItem}
            onItemClick={(id) => { setActiveItem(id); setSidebarOpen(false); }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-[#0B0E14] relative">
          
          {/* Dashboard Header (Desktop) */}
          <header className="hidden md:flex items-center justify-between px-8 py-5 bg-[#0B0E14]/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize">
                {sectionLabel === "dashboard" ? "Dashboard" : sectionLabel}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Overview and detailed fleet metrics</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search fleet, drivers, routes..." 
                  className="bg-[#151822] border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm text-foreground rounded-full pl-9 pr-4 py-2 w-64 outline-none transition-all placeholder:text-muted-foreground/60 shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#151822] border border-transparent hover:border-border transition-all relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(42,133,255,0.8)]"></span>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#151822] border border-transparent hover:border-border transition-all">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="h-8 w-px bg-border mx-1"></div>
                
                <ViewToggle currentView={currentView} onViewChange={setCurrentView} />

                <div className="flex items-center gap-3 ml-2 pl-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shadow-inner">
                      DI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {activeItem === "dashboard"   && <Dashboard />}
              {activeItem === "orders"      && <OrdersView />}
              {activeItem === "trips"       && <TripsView />}
              {activeItem === "shifts"      && <ShiftsView />}
              {activeItem === "documents"   && <DocumentsView />}
              {activeItem === "expenses"    && <ExpensesView />}
              {activeItem === "chat"        && <ChatView />}
              {activeItem === "drivers"     && <DriversView />}
              {activeItem === "reports"     && <ReportsView />}
              {activeItem === "fuel"        && <FuelView />}
              {activeItem === "maintenance" && <MaintenanceView />}
              {activeItem === "payroll"     && <PayrollView />}

              {/* Fallback for unimplemented sections */}
              {!["dashboard","orders","trips","shifts","documents","expenses",
                 "chat","drivers","reports","fuel","maintenance","payroll"].includes(activeItem) && (
                <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center px-8">
                    <div className="w-24 h-24 rounded-[20px] dashboard-panel mx-auto mb-6 flex items-center justify-center bg-[#151822] shadow-[0_0_40px_rgba(42,133,255,0.05)] border border-primary/20 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                      <span className="text-4xl text-primary drop-shadow-[0_0_12px_rgba(42,133,255,0.6)] relative z-10">⚙</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Раздел в разработке</h2>
                    <p className="text-muted-foreground capitalize">{sectionLabel}</p>
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

/* ── Unified view switcher (admin ↔ driver) ── */
function ViewToggle({
  currentView,
  onViewChange,
}: {
  currentView: "admin" | "driver";
  onViewChange: (v: "admin" | "driver") => void;
}) {
  return (
    <div className="flex bg-[#151822] p-1 rounded-full border border-border/50">
      <button
        onClick={() => onViewChange("admin")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          currentView === "admin"
            ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(42,133,255,0.4)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
        title="Панель диспетчера"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange("driver")}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          currentView === "driver"
            ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(42,133,255,0.4)]"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
  return (
    <div className="p-6">
      <div className="dashboard-panel p-8 text-center mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-primary/20 to-transparent flex items-center justify-center text-primary text-4xl font-bold mx-auto mb-6 border border-primary/20 shadow-[0_0_20px_rgba(42,133,255,0.15)]">
          И
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Иванов Иван Петрович</h2>
        <div className="inline-flex items-center gap-2 bg-[#1A1D27] px-4 py-1.5 rounded-full border border-border mt-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(0,230,118,0.6)]"></div>
          <span className="text-sm font-medium text-muted-foreground">Водитель • А123КС 77</span>
        </div>
        <div className="space-y-3 text-left">
          <button className="w-full bg-[#1A1D27] border border-border/50 hover:border-primary/30 hover:bg-[#1A1D27]/80 rounded-xl px-6 py-4 text-sm font-medium text-foreground transition-all flex items-center justify-between group">
            Настройки
            <span className="text-muted-foreground group-hover:text-primary">→</span>
          </button>
          <button className="w-full bg-[#1A1D27] border border-border/50 hover:border-primary/30 hover:bg-[#1A1D27]/80 rounded-xl px-6 py-4 text-sm font-medium text-foreground transition-all flex items-center justify-between group">
            Документы
            <span className="text-muted-foreground group-hover:text-primary">→</span>
          </button>
          <button className="w-full bg-status-error/10 border border-status-error/20 hover:bg-status-error/20 rounded-xl px-6 py-4 text-sm font-medium text-status-error transition-all mt-4">
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/90 backdrop-blur-md border-t border-border/50 pb-safe z-40">
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
              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(42,133,255,0.6)]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(42,133,255,0.8)]"></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
}
