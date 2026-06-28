import { useState } from "react";
import { FileText, Route, Truck, Users, AlertCircle, DollarSign, CheckCircle2, Radio, ShieldCheck } from "lucide-react";
import { StatCard } from "./StatCard";
import { StatusBadge } from "./StatusBadge";
import { useAppStore } from "../store/AppStore";
import { CreateOrderModal } from "./CreateOrderModal";
import type { CreatedOrderDraft } from "./CreateOrderModal";

export function Dashboard() {
  const { orders, trips, shifts, createOrder } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  function handleCreate(order: CreatedOrderDraft) {
    return createOrder(order);
  }

  return (
    <div className="flex-1 overflow-auto bg-transparent">
      <div className="space-y-8">
        <section className="metal-panel relative overflow-hidden rounded-[28px] p-6 md:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute right-12 top-10 h-28 w-28 rounded-full border border-accent/20" />
          <div className="absolute inset-x-10 top-0 h-px glow-line opacity-80" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <Radio className="h-3.5 w-3.5" />
                2-АА Неруд · live control
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">Оперативная сводка</h1>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Сегодня: {new Date().toLocaleDateString("ru-RU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Контролируем заявки, рейсы, смены и документы без лишнего шума.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-border bg-secondary/55 px-4 py-3">
                <p className="text-xs text-muted-foreground">Активные заявки</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{activeOrders.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/55 px-4 py-3">
                <p className="text-xs text-muted-foreground">Открытые смены</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{openShifts.length}</p>
              </div>
              <button onClick={() => setIsCreateOpen(true)} className="col-span-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_28px_rgba(47,147,215,0.18)] transition-transform hover:-translate-y-0.5 sm:col-span-1">
                + Создать заказ
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Активные заказы"
            value={activeOrders.length}
            icon={FileText}
            color="#4ab8ff"
          />
          <StatCard
            title="Рейсы сегодня"
            value={tripsToday}
            icon={Route}
            color="#00d7e8"
          />
          <StatCard
            title="Водители на смене"
            value={driversOnShift}
            icon={Users}
            color="#27d98a"
          />
          <StatCard
            title="Автомобили на линии"
            value={vehiclesOnLine}
            icon={Truck}
            color="#ffb84d"
          />
        </div>

        {/* Alerts and Active Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Alerts */}
          <div className="metal-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-status-warning" />
              <h3 className="font-semibold text-card-foreground">Требует внимания</h3>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/55 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-status-success mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Нет критичных событий</p>
                    <p className="text-xs text-muted-foreground mt-0.5">По текущим данным всё спокойно</p>
                  </div>
                </div>
              ) : alerts.map((alert) => (
                <div key={alert.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/55 border border-border">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${alert.color === "orange" ? "bg-status-warning" : "bg-yellow-500"}`}></div>
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
            <div className="metal-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Рейсов выполнено</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">{weekTrips.length}</p>
              <p className="text-xs text-muted-foreground mt-1">За неделю</p>
            </div>
            <div className="metal-panel rounded-2xl p-6">
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
        <div className="metal-panel overflow-hidden rounded-2xl">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">Текущие заказы</h3>
            <button className="text-sm text-primary hover:underline">Показать все →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/70">
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
                  <tr key={order.number} className="hover:bg-secondary/55 cursor-pointer transition-colors">
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
        {isCreateOpen && (
          <CreateOrderModal
            onClose={() => setIsCreateOpen(false)}
            onCreated={handleCreate}
          />
        )}
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
