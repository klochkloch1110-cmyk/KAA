interface StatusBadgeProps {
  status: string;
  variant?: "outlined" | "filled";
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Черновик", color: "#93a8b8", bgColor: "rgba(147, 168, 184, 0.12)" },
  assigned: { label: "Назначен", color: "#4ab8ff", bgColor: "rgba(74, 184, 255, 0.14)" },
  in_progress: { label: "В работе", color: "#00d7e8", bgColor: "rgba(0, 215, 232, 0.14)" },
  completed: { label: "Выполнен", color: "#27d98a", bgColor: "rgba(39, 217, 138, 0.14)" },
  cancelled: { label: "Отменён", color: "#93a8b8", bgColor: "rgba(147, 168, 184, 0.12)" },
  needs_review: { label: "Требует проверки", color: "#ffb84d", bgColor: "rgba(255, 184, 77, 0.14)" },
  rejected: { label: "Отклонён", color: "#ff5c5c", bgColor: "rgba(255, 92, 92, 0.14)" },
  verified: { label: "Проверен", color: "#27d98a", bgColor: "rgba(39, 217, 138, 0.14)" },
  archived: { label: "Архив", color: "#8fa3b5", bgColor: "rgba(143, 163, 181, 0.12)" },
  open: { label: "Открыта", color: "#4ab8ff", bgColor: "rgba(74, 184, 255, 0.14)" },
  submitted: { label: "Отправлен", color: "#00d7e8", bgColor: "rgba(0, 215, 232, 0.14)" },
  approved: { label: "Одобрен", color: "#27d98a", bgColor: "rgba(39, 217, 138, 0.14)" },
  pending: { label: "Ожидание", color: "#ffb84d", bgColor: "rgba(255, 184, 77, 0.14)" },
  matched: { label: "Совпадение", color: "#27d98a", bgColor: "rgba(39, 217, 138, 0.14)" },
  mismatch: { label: "Несовпадение", color: "#ff5c5c", bgColor: "rgba(255, 92, 92, 0.14)" },
  failed: { label: "Ошибка", color: "#ff5c5c", bgColor: "rgba(255, 92, 92, 0.14)" },
  active: { label: "Активен", color: "#27d98a", bgColor: "rgba(39, 217, 138, 0.14)" },
  service: { label: "ТО", color: "#ffb84d", bgColor: "rgba(255, 184, 77, 0.14)" },
  repair: { label: "Ремонт", color: "#ff5c5c", bgColor: "rgba(255, 92, 92, 0.14)" },
  inactive: { label: "Неактивен", color: "#93a8b8", bgColor: "rgba(147, 168, 184, 0.12)" },
};

export function StatusBadge({ status, variant = "filled" }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: "#93a8b8", bgColor: "rgba(147, 168, 184, 0.12)" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        color: config.color,
        backgroundColor: variant === "filled" ? config.bgColor : "transparent",
        border: `1px solid ${config.color}4D`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
