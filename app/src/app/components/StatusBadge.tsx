import { Badge } from "@mui/material";

interface StatusBadgeProps {
  status: string;
  variant?: "outlined" | "filled";
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Черновик", color: "#64748b", bgColor: "#f1f5f9" },
  assigned: { label: "Назначен", color: "#3b9dd8", bgColor: "#e0f2fe" },
  in_progress: { label: "В работе", color: "#5fb3b3", bgColor: "#d1fae5" },
  completed: { label: "Выполнен", color: "#10b981", bgColor: "#d1fae5" },
  cancelled: { label: "Отменён", color: "#64748b", bgColor: "#f1f5f9" },
  needs_review: { label: "Требует проверки", color: "#f59e0b", bgColor: "#fef3c7" },
  rejected: { label: "Отклонён", color: "#dc2626", bgColor: "#fee2e2" },
  verified: { label: "Проверен", color: "#10b981", bgColor: "#d1fae5" },
  archived: { label: "Архив", color: "#475569", bgColor: "#e2e8f0" },
  open: { label: "Открыта", color: "#3b9dd8", bgColor: "#e0f2fe" },
  submitted: { label: "Отправлен", color: "#5fb3b3", bgColor: "#d1fae5" },
  approved: { label: "Одобрен", color: "#10b981", bgColor: "#d1fae5" },
  pending: { label: "Ожидание", color: "#f59e0b", bgColor: "#fef3c7" },
  matched: { label: "Совпадение", color: "#10b981", bgColor: "#d1fae5" },
  mismatch: { label: "Несовпадение", color: "#dc2626", bgColor: "#fee2e2" },
  failed: { label: "Ошибка", color: "#dc2626", bgColor: "#fee2e2" },
  active: { label: "Активен", color: "#10b981", bgColor: "#d1fae5" },
  service: { label: "ТО", color: "#f59e0b", bgColor: "#fef3c7" },
  repair: { label: "Ремонт", color: "#dc2626", bgColor: "#fee2e2" },
  inactive: { label: "Неактивен", color: "#64748b", bgColor: "#f1f5f9" },
};

export function StatusBadge({ status, variant = "filled" }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: "#64748b", bgColor: "#f1f5f9" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{
        color: config.color,
        backgroundColor: variant === "filled" ? config.bgColor : "transparent",
        border: variant === "outlined" ? `1px solid ${config.color}` : "none",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
