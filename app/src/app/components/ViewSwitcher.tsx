import { Monitor, Smartphone } from "lucide-react";

interface ViewSwitcherProps {
  currentView: "admin" | "driver";
  onViewChange: (view: "admin" | "driver") => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 border border-border rounded-lg p-1 flex gap-1"
      style={{ background: "#0c1520", boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,212,0.08)" }}
    >
      <button
        onClick={() => onViewChange("admin")}
        style={currentView === "admin" ? { boxShadow: "0 0 12px rgba(0,200,212,0.4)" } : undefined}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all ${
          currentView === "admin"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Monitor className="w-4 h-4" />
        Администратор
      </button>
      <button
        onClick={() => onViewChange("driver")}
        style={currentView === "driver" ? { boxShadow: "0 0 12px rgba(0,200,212,0.4)" } : undefined}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all ${
          currentView === "driver"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Smartphone className="w-4 h-4" />
        Водитель
      </button>
    </div>
  );
}
