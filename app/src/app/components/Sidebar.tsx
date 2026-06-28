import {
  LayoutDashboard, FileText, Route, Clock, FileImage,
  ScanText, Truck, Users, DollarSign, Fuel, Wrench,
  Wallet, BarChart3, MessageSquare, Settings, X, BookOpen,
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
  { icon: BookOpen,        label: "Справочники",       id: "directories" },
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
  allowedItems?: string[];
}

export function Sidebar({ activeItem, onItemClick, isOpen, onClose, allowedItems }: SidebarProps) {

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
          "bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shadow-[18px_0_42px_rgba(35,64,88,0.10)]",
        ].join(" ")}
      >
        {/* Logo */}
        <div
          className="relative px-5 py-4 border-b border-sidebar-border flex items-center justify-between overflow-hidden"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, #e8f3f8 100%)" }}
        >
          <div className="absolute inset-x-0 bottom-0 h-px glow-line opacity-70" />
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="relative rounded-2xl border border-primary/20 bg-white p-1.5 shadow-[0_10px_28px_rgba(47,147,215,0.14)]">
              <img src="/logo.png" alt="2-АА Неруд" className="w-10 h-10 rounded-xl object-cover" />
            </div>
            <div>
              <h1
                className="font-bold text-lg tracking-wide text-foreground"
              >
                2-АА Неруд
              </h1>
              <p className="text-xs text-primary/80 tracking-wider uppercase">Управление перевозками</p>
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
          <ul className="space-y-1">
            {menuItems.filter((item) => !allowedItems || allowedItems.includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-primary/[0.10] text-foreground border border-primary/25 font-semibold shadow-[0_10px_24px_rgba(47,147,215,0.10)]"
                        : "text-sidebar-foreground/[0.76] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary shadow-[0_0_12px_rgba(47,147,215,0.35)]" />}
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-primary" : ""
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
          <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-secondary/60 p-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold tracking-wider flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(47,147,215,0.14), rgba(83,184,197,0.12))",
                border: "1px solid rgba(47,147,215,0.22)",
                color: "#2f93d7",
                boxShadow: "0 10px 18px rgba(47,147,215,0.10)",
              }}
            >
              АД
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Администратор</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@2aa-nerud.local</p>
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
