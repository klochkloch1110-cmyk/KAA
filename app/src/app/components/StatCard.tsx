import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = "#3b9dd8" }: StatCardProps) {
  return (
    <div className="metal-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_48px_rgba(35,64,88,0.16)]">
      <div className="absolute inset-x-6 top-0 h-px glow-line opacity-0 transition-opacity group-hover:opacity-70" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">{title}</p>
          <p className="text-4xl font-bold tracking-tight text-card-foreground">{value}</p>
          {trend && (
            <p className={`text-sm mt-3 ${trend.isPositive ? "text-status-success" : "text-status-error"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center border"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}42`,
            boxShadow: `0 0 24px ${color}22`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
