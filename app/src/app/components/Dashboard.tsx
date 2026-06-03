import { FileText, Route, Clock, Truck, Users, AlertCircle, DollarSign, CheckCircle2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { StatusBadge } from "./StatusBadge";
import { useAppStore } from "../store/AppStore";

export function Dashboard() {
  const { orders, trips, shifts } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = startOfWeek(new Date());
  const activeOrders = orders.filter((order) => ["assigned", "in_progress"].includes(order.status));
  const currentOrders = orders.filter((order) => order.status !== "archived").slice(0, 8);
  const tripsToday = trips.filter((trip) => trip.date === today).length;
  const weekTrips = trips.filter((trip) => new Date(`${trip.date}T00:00:00`) >= weekStart);
  const weekRevenue = weekTrips.reduce((sum, trip) => {
    const order = orders.find((item) => item.number === trip.orderNumber);
    return sum + (order?.ratePerTrip ?? 0);
  }, 0);
  const openShifts = shifts.filter((shift) => shift.status === "open");
  const driversOnShift = new Set(openShifts.map((shift) => shift.driver).filter(Boolean)).size;
  const vehiclesOnLine = new Set(openShifts.map((shift) => shift.vehicle).filter((vehicle) => vehicle && vehicle !== "ТС")).size;
  const ocrReviewCount = trips.filter((trip) => trip.ocrStatus === "mismatch" || trip.status === "needs_review").length;
  const staleOpenShifts = openShifts.filter((shift) => shift.date < today).length;
  const alerts = [
    ocrReviewCount > 0 ? { color: "orange", title: "Документы требуют проверки", text: `${ocrReviewCount} ${plural(ocrReviewCount, "документ", "документа", "документов")}` } : null,
    staleOpenShifts > 0 ? { color: "yellow", title: "Незакрытые смены", text: `${staleOpenShifts} ${plural(staleOpenShifts, "смена", "смены", "смен")}` } : null,
  ].filter(Boolean) as Array<{ color: "orange" | "yellow"; title: string; text: string }>;

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Панель управления</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Сегодня: {new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md">
              + Создать заказ
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Активные заказы"
            value={activeOrders.length}
            icon={FileText}
            color="#3b9dd8"
          />
          <StatCard
            title="Рейсы сегодня"
            value={tripsToday}
            icon={Route}
            color="#5fb3b3"
          />
          <StatCard
            title="Водители на смене"
            value={driversOnShift}
            icon={Users}
            color="#10b981"
          />
          <StatCard
            title="Автомобили на линии"
            value={vehiclesOnLine}
            icon={Truck}
            color="#f59e0b"
          />
        </div>

        {/* Alerts and Active Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Alerts */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-card-foreground">Требует внимания</h3>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Нет критичных событий</p>
                    <p className="text-xs text-muted-foreground mt-0.5">По текущим данным всё спокойно</p>
                  </div>
                </div>
              ) : alerts.map((alert) => (
                <div key={alert.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${alert.color === "orange" ? "bg-orange-500" : "bg-yellow-500"}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Рейсов выполнено</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">{weekTrips.length}</p>
              <p className="text-xs text-muted-foreground mt-1">За неделю</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">Выручка</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">₽{weekRevenue.toLocaleString("ru-RU")}</p>
              <p className="text-xs text-muted-foreground mt-1">За неделю</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Текущие заказы</h3>
            <button className="text-sm text-primary hover:underline">Показать все →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">№ Заказа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заказчик</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Маршрут</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Материал</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Объём</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Водитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТС</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-muted-foreground text-center" colSpan={8}>
                      Реальных заказов пока нет.
                    </td>
                  </tr>
                ) : currentOrders.map((order) => {
                  const firstDriver = order.drivers[0];
                  return (
                  <tr key={order.number} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.number}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{order.pointA} → {order.pointB}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.material}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.volume} {order.volumeUnit}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {firstDriver?.name || <span className="text-muted-foreground italic">Не назначен</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {firstDriver?.vehicle || <span className="text-muted-foreground italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}

function plural(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
