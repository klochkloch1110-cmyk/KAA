import { DollarSign, Plus, Calendar, Truck, User, Filter, TrendingUp, Eye, Edit2 } from "lucide-react";
import { useState } from "react";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vehicle: string | null;
  driver: string | null;
  orderId: string | null;
  paymentMethod: string;
  receipt: boolean;
  approvedBy: string | null;
  status: string;
}

const mockExpenses: Expense[] = [
  {
    id: "EXP-001",
    date: "2026-05-21",
    category: "fuel",
    description: "Заправка 250 л",
    amount: 13750,
    vehicle: "А123КС 77",
    driver: "Иванов И.П.",
    orderId: "ORD-001",
    paymentMethod: "card",
    receipt: true,
    approvedBy: "Администратор",
    status: "approved",
  },
  {
    id: "EXP-002",
    date: "2026-05-21",
    category: "maintenance",
    description: "Замена масла",
    amount: 4500,
    vehicle: "В456ВО 77",
    driver: null,
    orderId: null,
    paymentMethod: "cash",
    receipt: true,
    approvedBy: null,
    status: "pending",
  },
  {
    id: "EXP-003",
    date: "2026-05-20",
    category: "repair",
    description: "Ремонт тормозной системы",
    amount: 18000,
    vehicle: "С789НМ 77",
    driver: null,
    orderId: null,
    paymentMethod: "card",
    receipt: true,
    approvedBy: "Администратор",
    status: "approved",
  },
  {
    id: "EXP-004",
    date: "2026-05-20",
    category: "parking",
    description: "Стоянка (ночь)",
    amount: 500,
    vehicle: "А123КС 77",
    driver: "Иванов И.П.",
    orderId: "ORD-001",
    paymentMethod: "cash",
    receipt: false,
    approvedBy: "Администратор",
    status: "approved",
  },
  {
    id: "EXP-005",
    date: "2026-05-19",
    category: "other",
    description: "Мойка автомобиля",
    amount: 800,
    vehicle: "Д012РТ 77",
    driver: "Васильев Д.А.",
    orderId: null,
    paymentMethod: "card",
    receipt: true,
    approvedBy: "Администратор",
    status: "approved",
  },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  fuel: { label: "Топливо", color: "#3b9dd8" },
  maintenance: { label: "ТО", color: "#f59e0b" },
  repair: { label: "Ремонт", color: "#dc2626" },
  parking: { label: "Стоянка", color: "#8b5cf6" },
  toll: { label: "Дорожные сборы", color: "#10b981" },
  other: { label: "Прочее", color: "#64748b" },
};

export function ExpensesView() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingCount = mockExpenses.filter((e) => e.status === "pending").length;
  const approvedAmount = mockExpenses.filter((e) => e.status === "approved").reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = Object.keys(categoryLabels).map((cat) => ({
    category: cat,
    label: categoryLabels[cat].label,
    color: categoryLabels[cat].color,
    total: mockExpenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    count: mockExpenses.filter((e) => e.category === cat).length,
  })).filter((ct) => ct.count > 0);

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Расходы</h1>
              <p className="text-sm text-muted-foreground mt-1">Учёт всех расходов по автопарку</p>
            </div>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить расход
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Период:</span>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <span className="text-sm text-muted-foreground">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все категории
            </button>
            {Object.entries(categoryLabels).map(([key, { label, color }]) => {
              const count = mockExpenses.filter((e) => e.category === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === key ? "text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  style={categoryFilter === key ? { backgroundColor: color } : {}}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Всего расходов</p>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">₽{totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">За период</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Одобрено</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">₽{approvedAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Подтверждённые</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-orange-700 dark:text-orange-400">На проверке</p>
              <Filter className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{pendingCount}</p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">Требуют одобрения</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Средний расход</p>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">
              ₽{Math.round(totalAmount / filteredExpenses.length).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">На операцию</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="font-semibold text-card-foreground mb-4">Расходы по категориям</h3>
          <div className="space-y-3">
            {categoryTotals.map((ct) => (
              <div key={ct.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ct.color }} />
                    <span className="text-sm font-medium text-card-foreground">{ct.label}</span>
                    <span className="text-xs text-muted-foreground">({ct.count})</span>
                  </div>
                  <span className="text-sm font-bold text-card-foreground">₽{ct.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(ct.total / totalAmount) * 100}%`,
                      backgroundColor: ct.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">№</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Категория</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Описание</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТС</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Водитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Сумма</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((expense) => {
                  const category = categoryLabels[expense.category];
                  return (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-primary">{expense.id}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {new Date(expense.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{expense.description}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {expense.vehicle || <span className="italic text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {expense.driver || <span className="italic text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold" style={{ color: category.color }}>
                        ₽{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            expense.status === "approved"
                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                          }`}
                        >
                          {expense.status === "approved" ? "Одобрен" : "На проверке"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Расход {selectedExpense.id}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(selectedExpense.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Amount and Category */}
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `${categoryLabels[selectedExpense.category].color}20`,
                      color: categoryLabels[selectedExpense.category].color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: categoryLabels[selectedExpense.category].color }}
                    />
                    {categoryLabels[selectedExpense.category].label}
                  </span>
                  <div className="text-right">
                    <p
                      className="text-3xl font-bold"
                      style={{ color: categoryLabels[selectedExpense.category].color }}
                    >
                      ₽{selectedExpense.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Описание</h3>
                  <p className="text-base font-medium text-card-foreground">{selectedExpense.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedExpense.vehicle && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Транспортное средство</p>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-card-foreground">{selectedExpense.vehicle}</p>
                      </div>
                    </div>
                  )}
                  {selectedExpense.driver && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Водитель</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-card-foreground">{selectedExpense.driver}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Способ оплаты</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {selectedExpense.paymentMethod === "card" ? "Безналичный" : "Наличные"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Чек</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {selectedExpense.receipt ? "Есть" : "Нет"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Статус:</span>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                        selectedExpense.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                      }`}
                    >
                      {selectedExpense.status === "approved" ? "Одобрен" : "На проверке"}
                    </span>
                  </div>
                  {selectedExpense.approvedBy && (
                    <p className="text-xs text-muted-foreground mt-2">Одобрил: {selectedExpense.approvedBy}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedExpense(null)}
                className="px-5 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
              >
                Закрыть
              </button>
              {selectedExpense.status === "pending" && (
                <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md">
                  Одобрить
                </button>
              )}
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
