import { LucideIcon, Package, FileText, Users, Calendar, MessageSquare } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action, children }: EmptyStateProps) {
  const DisplayIcon = Icon || Package;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <DisplayIcon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={Package}
      title="Заказов пока нет"
      message="Новые заказы появятся здесь автоматически"
    />
  );
}

export function EmptyDocuments() {
  return (
    <EmptyState
      icon={FileText}
      title="Документов не найдено"
      message="Загруженные документы появятся здесь"
    />
  );
}

export function EmptyDrivers() {
  return (
    <EmptyState
      icon={Users}
      title="Водители не найдены"
      message="Добавьте водителей для начала работы"
      action={{
        label: "Добавить водителя",
        onClick: () => console.log("Add driver"),
      }}
    />
  );
}

export function EmptyShifts() {
  return (
    <EmptyState
      icon={Calendar}
      title="Смен не найдено"
      message="Открытые и завершённые смены отобразятся здесь"
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Нет сообщений"
      message="Начните общение с командой"
    />
  );
}

interface EmptySearchResultsProps {
  query: string;
  onClear: () => void;
}

export function EmptySearchResults({ query, onClear }: EmptySearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">Ничего не найдено</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-2">
        По запросу <span className="font-medium text-card-foreground">"{query}"</span> ничего не найдено
      </p>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Попробуйте изменить параметры поиска
      </p>
      <button
        onClick={onClear}
        className="px-6 py-2 text-primary hover:underline font-medium"
      >
        Очистить поиск
      </button>
    </div>
  );
}
