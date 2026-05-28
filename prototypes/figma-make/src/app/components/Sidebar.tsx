import {
  LayoutDashboard, FileText, Route, Clock, FileImage,
  ScanText, Truck, Users, DollarSign, Fuel, Wrench,
  Wallet, BarChart3, MessageSquare, Settings, X,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Панель управления", id: "dashboard" },
  { icon: FileText,        label: "Заявки",            id: "orders"    },
  { icon: Route,           label: "Рейсы",             id: "trips"     },
  { icon: Clock,           label: "Смены",             id: "shifts"    },
  { icon: FileImage,       label: "Документы",         id: "documents" },
  { icon: ScanText,        label: "OCR",               id: "ocr"       },
  { icon: Truck,           label: "Автопарк",          id: "vehicles"  },
  { icon: Users,           label: "Водители",          id: "drivers"   },
  { icon: DollarSign,      label: "Расходы",           id: "expenses"  },
  { icon: Fuel,            label: "Топливо",           id: "fuel"      },
  { icon: Wrench,          label: "ТО и Ремонт",       id: "maintenance"},
  { icon: Wallet,          label: "Зарплата",          id: "payroll"   },
  { icon: BarChart3,       label: "Отчёты",            id: "reports"   },
  { icon: MessageSquare,   label: "Чат",               id: "chat"      },
  { icon: Settings,        label: "Настройки",         id: "settings"  },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeItem, onItemClick, isOpen, onClose }: SidebarProps) {

  function handleClick(id: string) {
    onItemClick(id);
    onClose(); // close drawer on mobile after selection
  }

  return (
    <>
      {/* ── Mobile backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ── */}
      <div
        className={[
          /* positioning */
          "fixed top-0 left-0 h-full z-50 w-64 flex-shrink-0",
          /* on md+ become part of normal layout flow */
          "md:relative md:h-screen md:z-auto",
          /* mobile slide transition */
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          /* base */
          "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border",
        ].join(" ")}
      >
        {/* Logo */}
        <div
          className="px-5 py-4 border-b border-sidebar-border flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0a1525 0%, #050810 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div style={{ filter: "drop-shadow(0 0 8px rgba(0,200,212,0.5))" }}>
              <img src="/logo.png" alt="АВЛ 84" className="w-11 h-11 rounded-lg object-contain" />
            </div>
            <div>
              <h1
                className="font-bold text-lg tracking-widest"
                style={{ color: "#00c8d4", textShadow: "0 0 10px rgba(0,200,212,0.6)" }}
              >
                АВЛ 84
              </h1>
              <p className="text-xs text-sidebar-foreground/50 tracking-wider uppercase">Автопарк</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    style={isActive
                      ? { boxShadow: "0 0 14px rgba(0,200,212,0.35), inset 0 0 0 1px rgba(0,200,212,0.3)" }
                      : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-sidebar-primary/20 text-primary border border-primary/40 font-semibold"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-primary drop-shadow-[0_0_6px_rgba(0,200,212,0.8)]" : ""
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-wider flex-shrink-0"
              style={{
                background: "rgba(0,200,212,0.12)",
                border: "1px solid rgba(0,200,212,0.35)",
                color: "#00c8d4",
                boxShadow: "0 0 8px rgba(0,200,212,0.2)",
              }}
            >
              АД
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Администратор</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">admin@avl84.ru</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Export label map so App can show section name in mobile header */
export const MENU_LABELS: Record<string, string> = Object.fromEntries(
  menuItems.map((m) => [m.id, m.label])
);
