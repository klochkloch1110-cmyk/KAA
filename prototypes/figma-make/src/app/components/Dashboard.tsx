import { FileText, Route, Clock, Truck, Users, AlertCircle, DollarSign, CheckCircle2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { StatusBadge } from "./StatusBadge";

interface Order {
  id: string;
  customer: string;
  route: string;
  material: string;
  volume: number;
  driver: string | null;
  vehicle: string | null;
  status: string;
  date: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Стройком-М",
    route: "Карьер №3 → Стройка Ленина 45",
    material: "Песок",
    volume: 20,
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    status: "in_progress",
    date: "2026-05-21",
  },
  {
    id: "ORD-002",
    customer: "БетонСтрой",
    route: "Карьер №1 → Промзона, уч. 12",
    material: "Щебень",
    volume: 25,
    driver: "Петров А.С.",
    vehicle: "В456ВО 77",
    status: "assigned",
    date: "2026-05-21",
  },
  {
    id: "ORD-003",
    customer: "МегаСтрой",
    route: "Карьер №2 → ТЦ Галактика",
    material: "Грунт",
    volume: 18,
    driver: null,
    vehicle: null,
    status: "draft",
    date: "2026-05-21",
  },
  {
    id: "ORD-004",
    customer: "Дорстрой",
    route: "Карьер №3 → Трасса М7, км 15",
    material: "Песок",
    volume: 30,
    driver: "Сидоров П.И.",
    vehicle: "С789НМ 77",
    status: "completed",
    date: "2026-05-20",
  },
];

export function Dashboard() {
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
            value={12}
            icon={FileText}
            trend={{ value: "+3 с утра", isPositive: true }}
            color="#3b9dd8"
          />
          <StatCard
            title="Рейсы сегодня"
            value={28}
            icon={Route}
            trend={{ value: "+15%", isPositive: true }}
            color="#5fb3b3"
          />
          <StatCard
            title="Водители на смене"
            value={8}
            icon={Users}
            color="#10b981"
          />
          <StatCard
            title="Автомобили на линии"
            value={7}
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
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">OCR несовпадение</p>
                  <p className="text-xs text-muted-foreground mt-0.5">3 документа требуют проверки</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">Незакрытые смены</p>
                  <p className="text-xs text-muted-foreground mt-0.5">2 смены за вчера</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Рейсов выполнено</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">142</p>
              <p className="text-xs text-muted-foreground mt-1">За неделю</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">Выручка</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">₽584k</p>
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
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{order.route}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.material}</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{order.volume} т</td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {order.driver || <span className="text-muted-foreground italic">Не назначен</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-card-foreground">
                      {order.vehicle || <span className="text-muted-foreground italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
