import { MapPin, ChevronRight, Package } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface Order {
  id: string;
  customer: string;
  pointA: string;
  pointB: string;
  material: string;
  volume: number;
  ratePerTrip: string;
  status: string;
  tripsCompleted: number;
  tripsTotal: number;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Стройком-М",
    pointA: "Карьер №3",
    pointB: "Стройка Ленина 45",
    material: "Песок",
    volume: 20,
    ratePerTrip: "₽1,500",
    status: "in_progress",
    tripsCompleted: 3,
    tripsTotal: 5,
  },
  {
    id: "ORD-005",
    customer: "СтройТех",
    pointA: "Карьер №1",
    pointB: "Завод №2",
    material: "Бетон",
    volume: 22,
    ratePerTrip: "₽1,600",
    status: "assigned",
    tripsCompleted: 0,
    tripsTotal: 4,
  },
];

export function DriverOrders() {
  return (
    <div className="h-screen bg-background overflow-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
        <h1 className="text-2xl font-bold">Мои заказы</h1>
        <p className="text-sm opacity-90 mt-1">Назначенные маршруты</p>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {mockOrders.map((order) => (
          <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                  <h3 className="font-bold text-card-foreground">{order.customer}</h3>
                </div>
                <StatusBadge status={order.status} />
              </div>
              {order.status === "in_progress" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Прогресс</span>
                    <span className="text-xs font-medium text-card-foreground">
                      {order.tripsCompleted} / {order.tripsTotal} рейсов
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${(order.tripsCompleted / order.tripsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Route */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Загрузка</p>
                    <p className="text-sm font-medium text-card-foreground">{order.pointA}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    B
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Разгрузка</p>
                    <p className="text-sm font-medium text-card-foreground">{order.pointB}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/20 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-1">Материал</p>
                  <p className="text-sm font-medium text-card-foreground">{order.material}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-1">Объём</p>
                  <p className="text-sm font-medium text-card-foreground">{order.volume} т</p>
                </div>
              </div>

              {/* Rate */}
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/20 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ставка за рейс</span>
                <span className="text-lg font-bold text-accent">{order.ratePerTrip}</span>
              </div>

              {/* Action */}
              <button className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <MapPin className="w-5 h-5" />
                Открыть маршрут
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {mockOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-1">Нет активных заказов</h3>
            <p className="text-sm text-muted-foreground">Новые заказы появятся здесь</p>
          </div>
        )}
      </div>
    </div>
  );
}
