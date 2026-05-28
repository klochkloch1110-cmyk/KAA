import { Wallet, DollarSign, TrendingUp, Calendar, Search, Download, User, FileText } from "lucide-react";
import { useState } from "react";

interface PayrollRecord {
  id: string;
  driverId: string;
  driverName: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  tripsCount: number;
  tripsEarnings: number;
  bonuses: number;
  deductions: number;
  totalEarnings: number;
  status: "draft" | "calculated" | "paid";
  paidDate?: string;
  breakdown: {
    baseRate: number;
    overtimeRate?: number;
    fuelBonus?: number;
    safetyBonus?: number;
    lateDeduction?: number;
    damagesDeduction?: number;
  };
}

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "PAY-001",
    driverId: "DRV-001",
    driverName: "Иванов И.П.",
    period: "Май 2026",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    tripsCount: 45,
    tripsEarnings: 67500,
    bonuses: 5000,
    deductions: 2000,
    totalEarnings: 70500,
    status: "calculated",
    breakdown: {
      baseRate: 67500,
      fuelBonus: 3000,
      safetyBonus: 2000,
      damagesDeduction: 2000,
    },
  },
  {
    id: "PAY-002",
    driverId: "DRV-002",
    driverName: "Петров А.С.",
    period: "Май 2026",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    tripsCount: 38,
    tripsEarnings: 57000,
    bonuses: 3500,
    deductions: 0,
    totalEarnings: 60500,
    status: "calculated",
    breakdown: {
      baseRate: 57000,
      fuelBonus: 2000,
      safetyBonus: 1500,
    },
  },
  {
    id: "PAY-003",
    driverId: "DRV-003",
    driverName: "Сидоров М.К.",
    period: "Май 2026",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-31",
    tripsCount: 42,
    tripsEarnings: 63000,
    bonuses: 4000,
    deductions: 1500,
    totalEarnings: 65500,
    status: "calculated",
    breakdown: {
      baseRate: 63000,
      fuelBonus: 2500,
      safetyBonus: 1500,
      lateDeduction: 1500,
    },
  },
  {
    id: "PAY-004",
    driverId: "DRV-001",
    driverName: "Иванов И.П.",
    period: "Апрель 2026",
    periodStart: "2026-04-01",
    periodEnd: "2026-04-30",
    tripsCount: 48,
    tripsEarnings: 72000,
    bonuses: 6000,
    deductions: 0,
    totalEarnings: 78000,
    status: "paid",
    paidDate: "2026-05-05",
    breakdown: {
      baseRate: 72000,
      fuelBonus: 3500,
      safetyBonus: 2500,
    },
  },
];

const statistics = {
  totalPayroll: 196500,
  drivers: 3,
  avgPerDriver: 65500,
  totalTrips: 125,
};

export function PayrollView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "calculated" | "paid">("all");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const filteredRecords = mockPayrollRecords.filter((record) => {
    const matchesSearch =
      record.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.period.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "Черновик",
      calculated: "Рассчитано",
      paid: "Выплачено",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400",
      calculated: "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
      paid: "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Зарплата</h1>
            <p className="text-sm text-muted-foreground mt-1">Расчёты и выплаты водителям</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-muted text-card-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              Экспорт
            </button>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Рассчитать период
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Общий фонд (май)</p>
                <p className="text-xl font-bold text-card-foreground">₽{statistics.totalPayroll.toLocaleString("ru-RU")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Водителей</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.drivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Средняя зарплата</p>
                <p className="text-xl font-bold text-card-foreground">₽{statistics.avgPerDriver.toLocaleString("ru-RU")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего рейсов</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.totalTrips}</p>
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
              placeholder="Поиск по водителю, периоду..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
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
              onClick={() => setFilterStatus("calculated")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "calculated"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Рассчитано
            </button>
            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "paid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Выплачено
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
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Водитель</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Период</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Рейсов</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Начислено</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Премии</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Вычеты</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">К выплате</th>
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
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{record.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{record.period}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-card-foreground">{record.tripsCount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">₽{record.tripsEarnings.toLocaleString("ru-RU")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-green-600">+₽{record.bonuses.toLocaleString("ru-RU")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-red-600">
                      {record.deductions > 0 ? `-₽${record.deductions.toLocaleString("ru-RU")}` : "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-accent">₽{record.totalEarnings.toLocaleString("ru-RU")}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
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
                <h2 className="text-xl font-bold">Расчётный лист</h2>
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
              {/* Driver and Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Водитель</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.driverName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Расчётный период</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.period}</p>
                </div>
              </div>

              {/* Period Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Начало периода</p>
                  <p className="text-sm text-card-foreground">
                    {new Date(selectedRecord.periodStart).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Конец периода</p>
                  <p className="text-sm text-card-foreground">
                    {new Date(selectedRecord.periodEnd).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              {/* Trips Count */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Количество рейсов</span>
                  <span className="text-sm font-bold text-card-foreground">{selectedRecord.tripsCount}</span>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div>
                <h3 className="font-semibold text-card-foreground mb-3">Начисления</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Базовая ставка за рейсы</span>
                    <span className="text-sm font-medium text-card-foreground">
                      ₽{selectedRecord.breakdown.baseRate.toLocaleString("ru-RU")}
                    </span>
                  </div>
                  {selectedRecord.breakdown.overtimeRate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Переработка</span>
                      <span className="text-sm font-medium text-card-foreground">
                        ₽{selectedRecord.breakdown.overtimeRate.toLocaleString("ru-RU")}
                      </span>
                    </div>
                  )}
                  {selectedRecord.breakdown.fuelBonus && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700 dark:text-green-400">Премия за топливо</span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        +₽{selectedRecord.breakdown.fuelBonus.toLocaleString("ru-RU")}
                      </span>
                    </div>
                  )}
                  {selectedRecord.breakdown.safetyBonus && (
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700 dark:text-green-400">Премия за безопасность</span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        +₽{selectedRecord.breakdown.safetyBonus.toLocaleString("ru-RU")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deductions */}
              {(selectedRecord.breakdown.lateDeduction || selectedRecord.breakdown.damagesDeduction) && (
                <div>
                  <h3 className="font-semibold text-card-foreground mb-3">Вычеты</h3>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 space-y-3 border border-red-200 dark:border-red-900">
                    {selectedRecord.breakdown.lateDeduction && (
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700 dark:text-red-400">Опоздания</span>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          -₽{selectedRecord.breakdown.lateDeduction.toLocaleString("ru-RU")}
                        </span>
                      </div>
                    )}
                    {selectedRecord.breakdown.damagesDeduction && (
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700 dark:text-red-400">Ущерб</span>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          -₽{selectedRecord.breakdown.damagesDeduction.toLocaleString("ru-RU")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Итого к выплате</span>
                  <span className="text-2xl font-bold text-accent">
                    ₽{selectedRecord.totalEarnings.toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Статус</p>
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                  {getStatusLabel(selectedRecord.status)}
                </span>
              </div>

              {/* Paid Date */}
              {selectedRecord.paidDate && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Дата выплаты</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {new Date(selectedRecord.paidDate).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedRecord.status !== "paid" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                    {selectedRecord.status === "calculated" ? "Выплатить" : "Рассчитать"}
                  </button>
                  <button className="px-6 bg-muted text-card-foreground rounded-lg py-3 font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Экспорт
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
