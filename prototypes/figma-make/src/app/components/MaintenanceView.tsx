import { Wrench, Calendar, AlertTriangle, CheckCircle2, Search, Plus, Truck, Clock } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: "scheduled" | "repair" | "inspection";
  serviceType: string;
  description: string;
  scheduledDate?: string;
  completedDate?: string;
  nextDueDate?: string;
  nextDueMileage?: number;
  currentMileage: number;
  cost?: number;
  serviceCenter: string;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  notes?: string;
}

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "MAINT-001",
    vehicleId: "VEH-001",
    vehiclePlate: "А123КС 77",
    type: "scheduled",
    serviceType: "ТО-2",
    description: "Плановое техническое обслуживание ТО-2",
    scheduledDate: "2026-05-25T10:00:00",
    currentMileage: 152340,
    nextDueMileage: 160000,
    serviceCenter: "ГАЗ Сервис №5",
    status: "scheduled",
    priority: "medium",
  },
  {
    id: "MAINT-002",
    vehicleId: "VEH-002",
    vehiclePlate: "В456МН 77",
    type: "repair",
    serviceType: "Ремонт тормозной системы",
    description: "Замена тормозных колодок передней оси",
    scheduledDate: "2026-05-22T09:00:00",
    currentMileage: 98560,
    cost: 15000,
    serviceCenter: "ГАЗ Сервис №5",
    status: "in_progress",
    priority: "high",
    notes: "Срочный ремонт, автомобиль простаивает",
  },
  {
    id: "MAINT-003",
    vehicleId: "VEH-003",
    vehiclePlate: "С789ТР 77",
    type: "scheduled",
    serviceType: "ТО-1",
    description: "Плановое техническое обслуживание ТО-1",
    scheduledDate: "2026-05-15T14:00:00",
    completedDate: "2026-05-15T16:30:00",
    currentMileage: 145200,
    nextDueMileage: 155000,
    nextDueDate: "2026-07-15",
    cost: 8500,
    serviceCenter: "ГАЗ Сервис №3",
    status: "completed",
    priority: "low",
  },
  {
    id: "MAINT-004",
    vehicleId: "VEH-004",
    vehiclePlate: "Т098УВ 77",
    type: "inspection",
    serviceType: "Техосмотр",
    description: "Ежегодный технический осмотр",
    scheduledDate: "2026-05-18T11:00:00",
    currentMileage: 87340,
    serviceCenter: "Техосмотр №12",
    status: "overdue",
    priority: "high",
  },
  {
    id: "MAINT-005",
    vehicleId: "VEH-001",
    vehiclePlate: "А123КС 77",
    type: "repair",
    serviceType: "Замена масла и фильтров",
    description: "Замена моторного масла, масляного и воздушного фильтров",
    scheduledDate: "2026-05-10T10:00:00",
    completedDate: "2026-05-10T11:30:00",
    currentMileage: 150000,
    cost: 4500,
    serviceCenter: "ГАЗ Сервис №5",
    status: "completed",
    priority: "medium",
  },
];

const statistics = {
  upcoming: 2,
  inProgress: 1,
  overdue: 1,
  totalCost: 28000,
};

export function MaintenanceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "in_progress" | "completed" | "overdue">("all");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const filteredRecords = mockMaintenanceRecords.filter((record) => {
    const matchesSearch =
      record.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.serviceCenter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      scheduled: "Плановое ТО",
      repair: "Ремонт",
      inspection: "Осмотр",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
      repair: "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400",
      inspection: "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">ТО и Ремонт</h1>
            <p className="text-sm text-muted-foreground mt-1">Управление техническим обслуживанием и ремонтами</p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Запланировать ТО
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Запланировано</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">В работе</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Просрочено</p>
                <p className="text-xl font-bold text-destructive">{statistics.overdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Затраты (месяц)</p>
                <p className="text-xl font-bold text-card-foreground">₽{statistics.totalCost.toLocaleString("ru-RU")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по номеру, виду работ, сервису..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterStatus("scheduled")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "scheduled"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Запланировано
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "in_progress"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              В работе
            </button>
            <button
              onClick={() => setFilterStatus("overdue")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "overdue"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Просрочено
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "completed"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Завершено
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Автомобиль</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Тип</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Работы</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Дата</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Сервис</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Приоритет</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{record.vehiclePlate}</p>
                        <p className="text-xs text-muted-foreground">{record.currentMileage.toLocaleString("ru-RU")} км</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(record.type)}`}>
                      {getTypeLabel(record.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-card-foreground">{record.serviceType}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{record.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">
                        {record.scheduledDate &&
                          new Date(record.scheduledDate).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{record.serviceCenter}</p>
                  </td>
                  <td className="px-6 py-4">
                    {record.priority === "high" && (
                      <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                        Высокий
                      </span>
                    )}
                    {record.priority === "medium" && (
                      <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400">
                        Средний
                      </span>
                    )}
                    {record.priority === "low" && (
                      <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400">
                        Низкий
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === "scheduled" && <StatusBadge status="assigned" />}
                    {record.status === "in_progress" && <StatusBadge status="in_progress" />}
                    {record.status === "completed" && <StatusBadge status="completed" />}
                    {record.status === "overdue" && <StatusBadge status="needs_review" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{selectedRecord.serviceType}</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm opacity-90">{selectedRecord.id}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">{selectedRecord.vehiclePlate}</p>
                    <p className="text-sm text-muted-foreground">
                      Текущий пробег: {selectedRecord.currentMileage.toLocaleString("ru-RU")} км
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Описание работ</p>
                <p className="text-sm text-card-foreground">{selectedRecord.description}</p>
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Тип работ</p>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${getTypeBadgeColor(selectedRecord.type)}`}>
                    {getTypeLabel(selectedRecord.type)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Приоритет</p>
                  {selectedRecord.priority === "high" && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                      Высокий
                    </span>
                  )}
                  {selectedRecord.priority === "medium" && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400">
                      Средний
                    </span>
                  )}
                  {selectedRecord.priority === "low" && (
                    <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400">
                      Низкий
                    </span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                {selectedRecord.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Запланировано</span>
                    <span className="text-sm font-medium text-card-foreground">
                      {new Date(selectedRecord.scheduledDate).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {selectedRecord.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Завершено</span>
                    <span className="text-sm font-medium text-card-foreground">
                      {new Date(selectedRecord.completedDate).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {selectedRecord.nextDueDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Следующее ТО</span>
                    <span className="text-sm font-medium text-card-foreground">
                      {new Date(selectedRecord.nextDueDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                )}
                {selectedRecord.nextDueMileage && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Следующее ТО (пробег)</span>
                    <span className="text-sm font-medium text-card-foreground">
                      {selectedRecord.nextDueMileage.toLocaleString("ru-RU")} км
                    </span>
                  </div>
                )}
              </div>

              {/* Service Center */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Сервисный центр</p>
                <p className="font-medium text-card-foreground">{selectedRecord.serviceCenter}</p>
              </div>

              {/* Cost */}
              {selectedRecord.cost && (
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">Стоимость</p>
                  <p className="text-2xl font-bold text-accent">₽{selectedRecord.cost.toLocaleString("ru-RU")}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900">
                  <p className="text-xs text-muted-foreground mb-1">Примечание</p>
                  <p className="text-sm text-card-foreground">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Статус</p>
                {selectedRecord.status === "scheduled" && <StatusBadge status="assigned" />}
                {selectedRecord.status === "in_progress" && <StatusBadge status="in_progress" />}
                {selectedRecord.status === "completed" && <StatusBadge status="completed" />}
                {selectedRecord.status === "overdue" && <StatusBadge status="needs_review" />}
              </div>

              {/* Actions */}
              {selectedRecord.status !== "completed" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  {selectedRecord.status === "scheduled" && (
                    <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                      Начать работу
                    </button>
                  )}
                  {selectedRecord.status === "in_progress" && (
                    <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                      Завершить
                    </button>
                  )}
                  {selectedRecord.status === "overdue" && (
                    <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                      Перенести
                    </button>
                  )}
                  <button className="px-6 bg-muted text-card-foreground rounded-lg py-3 font-medium hover:bg-muted/80 transition-colors">
                    Отменить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
