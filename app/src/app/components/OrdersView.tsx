import { useState } from "react";
import {
  Plus, User, Truck, ChevronRight, CheckCircle2, Clock,
  FileText, Archive, ArrowRight, Hash, MapPin, Package,
  Navigation, Edit2, UserCheck, AlertTriangle, Search,
  LayoutGrid, Columns, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { CreateOrderModal } from "./CreateOrderModal";
import type { CreatedOrderDraft } from "./CreateOrderModal";
import { AssignDriverModal } from "./AssignDriverModal";
import { useAppStore } from "../store/AppStore";
import type { AppOrder, AssignedDriver as StoreAssignedDriver, OrderStatus } from "../store/AppStore";

/* ─────────────────────────────────────────────
   Типы и данные
───────────────────────────────────────────── */
type Status = OrderStatus;
type Order = AppOrder;
export type AssignedDriver = StoreAssignedDriver;

/* ─────────────────────────────────────────────
   Конфиг колонок pipeline
───────────────────────────────────────────── */
const PIPELINE: {
  status: Status;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  actor: string;
  actorColor: string;
  action: string;
  nextStatus?: Status;
  nextLabel?: string;
}[] = [
  {
    status: "draft",
    label: "Черновик",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-400/30",
    dot: "bg-gray-400",
    actor: "Диспетчер",
    actorColor: "bg-blue-500/15 text-blue-600",
    action: "Назначить водителя →",
    nextStatus: "assigned",
    nextLabel: "Назначена",
  },
  {
    status: "assigned",
    label: "Назначена",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-400/30",
    dot: "bg-blue-500",
    actor: "Водитель",
    actorColor: "bg-cyan-500/15 text-cyan-700",
    action: "Открыть смену →",
    nextStatus: "in_progress",
    nextLabel: "В работе",
  },
  {
    status: "in_progress",
    label: "В работе",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/30",
    dot: "bg-cyan-500",
    actor: "Водитель",
    actorColor: "bg-cyan-500/15 text-cyan-700",
    action: "Выполнить рейсы → Закрыть смену",
    nextStatus: "completed",
    nextLabel: "Выполнена",
  },
  {
    status: "completed",
    label: "Выполнена",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-400/30",
    dot: "bg-green-500",
    actor: "Диспетчер",
    actorColor: "bg-blue-500/15 text-blue-600",
    action: "Проверить и архивировать →",
    nextStatus: "archived",
    nextLabel: "Архив",
  },
  {
    status: "archived",
    label: "Архив",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    dot: "bg-muted-foreground",
    actor: "Система",
    actorColor: "bg-muted text-muted-foreground",
    action: "Хранение данных",
  },
];

/* ─────────────────────────────────────────────
   Компонент
───────────────────────────────────────────── */
export function OrdersView() {
  const { orders, drivers, vehicles, createOrder, updateOrder, assignDrivers, advanceOrderStatus } = useAppStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [assignTarget, setAssignTarget] = useState<Order | null>(null);
  const [editTarget, setEditTarget] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const currentAssignTarget = assignTarget
    ? orders.find((order) => order.number === assignTarget.number) ?? assignTarget
    : null;

  async function advanceStatus(orderNumber: string) {
    try {
      await advanceOrderStatus(orderNumber);
      setSelected(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось сохранить статус заявки");
    }
  }

  async function handleAssign(orderNumber: string, newDrivers: AssignedDriver[]) {
    await assignDrivers(orderNumber, newDrivers);
    setAssignTarget(null);
    setSelected(null);
  }

  function handleCreate(order: CreatedOrderDraft) {
    return createOrder(order);
  }

  async function handleUpdate(order: CreatedOrderDraft) {
    await updateOrder(order);
    setEditTarget(null);
    setSelected((current) => current?.number === order.number ? { ...current, ...order, volume: order.volume ?? 0 } : current);
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.customer.toLowerCase().includes(q) ||
      o.number.includes(q) ||
      o.drivers.some((d) => d.name.toLowerCase().includes(q) || d.vehicle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">

      {/* ── Шапка ── */}
      <div className="metal-panel rounded-2xl px-6 py-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/80">Pipeline заказов</div>
            <h1 className="text-2xl font-bold text-card-foreground">Заявки</h1>
            <p className="text-sm text-muted-foreground mt-1">Полный цикл — от создания до архива</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Переключатель вид */}
            <div className="flex rounded-full border border-border bg-secondary/70 p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-semibold transition-colors ${
                  viewMode === "kanban" ? "bg-primary text-primary-foreground shadow-[0_10px_18px_rgba(47,147,215,0.16)]" : "text-muted-foreground hover:bg-white/80"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Pipeline
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 flex items-center gap-1.5 rounded-full text-xs font-semibold transition-colors ${
                  viewMode === "list" ? "bg-primary text-primary-foreground shadow-[0_10px_18px_rgba(47,147,215,0.16)]" : "text-muted-foreground hover:bg-white/80"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Список
              </button>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-sm font-bold hover:opacity-95 transition-opacity shadow-[0_12px_24px_rgba(47,147,215,0.18)]"
            >
              <Plus className="w-4 h-4" />
              Новая заявка
            </button>
          </div>
        </div>

        {/* Поиск */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Заказчик, номер, водитель..."
            className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-full text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35 focus:border-primary/45 outline-none transition-all"
          />
        </div>

        {/* ── Полоса статусов ── */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
          {PIPELINE.map((col, idx) => {
            const count = filtered.filter((o) => o.status === col.status).length;
            return (
              <div key={col.status} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-secondary/60 ${col.border}`}>
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${col.bg} ${col.color}`}>
                    {count}
                  </span>
                </div>
                {idx < PIPELINE.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Kanban / List ── */}
      {viewMode === "kanban" ? (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 py-4 h-full min-w-max">
            {PIPELINE.map((col) => {
              const colOrders = filtered.filter((o) => o.status === col.status);
              return (
                <div key={col.status} className="flex flex-col w-72 shrink-0">
                  {/* Заголовок колонки */}
                  <div className={`metal-panel rounded-2xl px-3 py-2.5 mb-3 ${col.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                        <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                        <span className={`text-xs font-bold px-1.5 rounded-full ${col.bg} ${col.color}`}>
                          {colOrders.length}
                        </span>
                      </div>
                    </div>
                    {/* Кто действует */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.actorColor}`}>
                        {col.actor}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{col.action}</span>
                    </div>
                  </div>

                  {/* Карточки */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {colOrders.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="w-8 h-8 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-xs">Нет заявок</p>
                      </div>
                    )}
                    {colOrders.map((order) => (
                      <KanbanCard
                        key={order.number}
                        order={order}
                        col={col}
                        onClick={() => setSelected(order)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto py-4">
          <div className="space-y-2 max-w-4xl mx-auto">
            {filtered.map((order) => {
              const col = PIPELINE.find((c) => c.status === order.status)!;
              return (
                <button
                  key={order.number}
                  onClick={() => setSelected(order)}
                  className="w-full metal-panel rounded-2xl px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 flex items-center gap-4"
                >
                  <div className={`w-2 h-10 rounded-full ${col.dot} shrink-0`} />
                  <div className="flex-1 min-w-0 grid grid-cols-4 gap-3 items-center">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-primary">{order.number}</p>
                      <p className="text-sm font-semibold text-card-foreground truncate">{order.customer}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {order.pointA.split(",")[0]} → {order.pointB.split(",")[0]}
                      </p>
                      <p className="text-xs text-card-foreground">{order.material} · {order.volume} {order.volumeUnit}</p>
                    </div>
                    <div>
                      {order.drivers.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-card-foreground truncate">{order.drivers[0].name}</span>
                          {order.drivers.length > 1 && (
                            <span className="text-xs text-primary font-semibold">+{order.drivers.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Не назначен</span>
                      )}
                      {order.status === "in_progress" && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex-1 h-1 bg-secondary rounded-full max-w-20">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(order.tripsCompleted / order.tripsTotal) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{order.tripsCompleted}/{order.tripsTotal}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${col.bg} ${col.color} border ${col.border}`}>
                        {col.label}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Детальная панель ── */}
      {selected && (
        <DetailPanel
          order={selected}
          onClose={() => setSelected(null)}
          onAdvance={() => advanceStatus(selected.number)}
          onAssign={() => setAssignTarget(selected)}
          onEdit={() => setEditTarget(selected)}
        />
      )}

      {isCreateOpen && (
        <CreateOrderModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreate}
        />
      )}

      {editTarget && (
        <CreateOrderModal
          mode="edit"
          initialOrder={orders.find((order) => order.number === editTarget.number) ?? editTarget}
          onClose={() => setEditTarget(null)}
          onCreated={handleUpdate}
        />
      )}

      {currentAssignTarget && (
        <AssignDriverModal
          order={currentAssignTarget}
          existingDrivers={currentAssignTarget.drivers}
          drivers={drivers}
          vehicles={vehicles}
          onClose={() => setAssignTarget(null)}
          onAssign={(drivers) => handleAssign(currentAssignTarget.number, drivers)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Kanban-карточка
───────────────────────────────────────────── */
function KanbanCard({
  order, col, onClick,
}: {
  order: Order;
  col: typeof PIPELINE[0];
  onClick: () => void;
}) {
  const progress = order.tripsTotal > 0 ? order.tripsCompleted / order.tripsTotal : 0;

  return (
    <button
      onClick={onClick}
      className={`w-full metal-panel rounded-2xl ${col.border} text-left p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/30 space-y-2.5`}
    >
      {/* Номер + OCR-предупреждение */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-primary">{order.number}</span>
        {order.ocrIssue && (
          <span className="flex items-center gap-1 text-[10px] text-status-warning bg-status-warning/10 px-1.5 py-0.5 rounded-full font-semibold">
            <AlertTriangle className="w-3 h-3" />
            OCR
          </span>
        )}
      </div>

      {/* Заказчик */}
      <p className="text-sm font-bold text-card-foreground leading-tight">{order.customer}</p>

      {/* Маршрут */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
        <span className="truncate">{order.pointA.split(",")[0]}</span>
        <ArrowRight className="w-3 h-3 shrink-0" />
        <span className="truncate">{order.pointB.split(",")[0]}</span>
      </div>

      {/* Материал */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Package className="w-3 h-3" />
        {order.material} · {order.volume} {order.volumeUnit}
      </div>

      {/* Водители */}
      {order.drivers.length > 0 ? (
        <div className="space-y-1">
          {order.drivers.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-card-foreground font-medium truncate">{d.name}</span>
              <span className="text-muted-foreground">·</span>
              <Truck className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground font-mono">{d.vehicle}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-orange-500">
          <User className="w-3 h-3" />
          <span className="font-medium">Водитель не назначен</span>
        </div>
      )}

      {/* Прогресс рейсов */}
      {order.status === "in_progress" && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Рейсы</span>
            <span className="font-semibold text-card-foreground">{order.tripsCompleted} / {order.tripsTotal}</span>
          </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {order.status === "completed" && (
        <div className="flex items-center gap-1.5 text-xs text-status-success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-semibold">{order.tripsCompleted} рейсов выполнено</span>
        </div>
      )}

      {/* Ставки */}
      <div className="pt-1 border-t border-border space-y-1">
        {order.clientRate != null ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-status-success" />
              Заказчик
            </span>
            <span className="text-xs font-bold text-status-success">
              ₽{order.clientRate.toLocaleString("ru-RU")}/{order.clientRateUnit}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="w-3 h-3 text-primary" />
            Водитель
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            ₽{order.ratePerTrip.toLocaleString("ru-RU")}/рейс
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Детальная панель (slide-in справа)
───────────────────────────────────────────── */
function DetailPanel({
  order, onClose, onAdvance, onAssign, onEdit,
}: {
  order: Order;
  onClose: () => void;
  onAdvance: () => Promise<void> | void;
  onAssign: () => void;
  onEdit: () => void;
}) {
  const col = PIPELINE.find((c) => c.status === order.status)!;
  const nextCol = PIPELINE.find((c) => c.status === col.nextStatus);
  const clientTotal = (order.clientRate ?? 0) * (order.clientRateUnit === "час" ? order.tripsTotal : order.volume);
  const driverTotal = order.ratePerTrip * order.tripsTotal;
  const margin = clientTotal - driverTotal;
  const marginPct = clientTotal > 0 ? Math.round((margin / clientTotal) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-2xl border-l border-border flex flex-col overflow-hidden">

        {/* Шапка панели */}
        <div className={`px-5 py-4 border-b border-border ${col.bg} shrink-0`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-primary">{order.number}</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground text-lg leading-none">×</button>
          </div>
          <h2 className="text-lg font-bold text-card-foreground">{order.customer}</h2>
          <div className={`inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-lg border ${col.border} ${col.bg}`}>
            <div className={`w-2 h-2 rounded-full ${col.dot}`} />
            <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
          </div>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* OCR-предупреждение */}
          {order.ocrIssue && (
            <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Расхождение OCR</p>
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-0.5">Данные ТТН требуют дополнительной сверки диспетчером</p>
              </div>
            </div>
          )}

          {/* Стороны */}
          <Section title="Стороны">
            <Row label="От кого" value={order.from} />
            <Row label="Кому" value={order.to} />
          </Section>

          {/* Груз */}
          <Section title="Груз">
            <Row label="Материал" value={order.material} />
            <Row label="Объём" value={`${order.volume} ${order.volumeUnit}`} />
          </Section>

          {/* Маршрут */}
          <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Маршрут</p>
            </div>
            <div className="p-3 space-y-0">
              <div className="flex items-start gap-3 py-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
                <div>
                  <p className="text-xs text-muted-foreground">Погрузка</p>
                  <p className="text-sm font-medium text-card-foreground">{order.pointA}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-2">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">B</div>
                <div>
                  <p className="text-xs text-muted-foreground">Разгрузка</p>
                  <p className="text-sm font-medium text-card-foreground">{order.pointB}</p>
                </div>
              </div>
            </div>
            <a
              href={`https://yandex.ru/maps/?rtext=${encodeURIComponent(order.pointA)}~${encodeURIComponent(order.pointB)}&rtt=auto`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/20 transition-colors border-t border-border"
            >
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Яндекс.Карты</span>
            </a>
          </div>

          {/* Назначение */}
          <div className="bg-muted/20 border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Назначение</p>
              {order.drivers.length > 0 && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {order.drivers.length} вод.
                </span>
              )}
            </div>
            <div className="px-4 py-3">
              {order.drivers.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-orange-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="italic">Водитель не назначен</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {order.drivers.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {d.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-card-foreground truncate">{d.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-primary">{d.vehicle}</span>
                          <span className="text-xs text-muted-foreground">· {d.vehicleType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Рейсы */}
          <Section title="Рейсы">
            <Row label="Выполнено" value={`${order.tripsCompleted} из ${order.tripsTotal}`} />
            {order.status === "in_progress" && (
              <div className="pt-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(order.tripsCompleted / order.tripsTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Section>

          {/* Финансы */}
          <div className="bg-muted/20 border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-muted/40 border-b border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Финансы</p>
            </div>
            <div className="p-4 space-y-3">

              {/* Доход от заказчика */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">Доход (заказчик)</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    ₽{(order.clientRate ?? 0).toLocaleString("ru-RU")} / {order.clientRateUnit ?? "тонн"}
                    {order.clientRateUnit !== "час"
                      ? ` × ${order.volume} ${order.volumeUnit}`
                      : ` × ${order.tripsTotal} рейс.`}
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ₽{clientTotal.toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>

              {/* Расход — водители */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Расход (водители)</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">
                    ₽{order.ratePerTrip.toLocaleString("ru-RU")} / рейс × {order.tripsTotal} рейс.
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ₽{driverTotal.toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>

              {/* Маржа */}
              <div className={`rounded-xl px-3 py-2.5 border ${
                margin >= 0
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {margin >= 0
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    <p className={`text-xs font-semibold ${margin >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      Маржа
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${margin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {margin >= 0 ? "+" : ""}₽{margin.toLocaleString("ru-RU")}
                    </span>
                    <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      margin >= 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {marginPct}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Примечание */}
          {order.note && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Примечание</p>
              <p className="text-sm text-card-foreground">{order.note}</p>
            </div>
          )}

          {/* Описание следующего шага */}
          {nextCol && (
            <div className="bg-muted/30 border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Следующий шаг</p>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${col.border} ${col.bg}`}>
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${nextCol.border} ${nextCol.bg}`}>
                  <div className={`w-2 h-2 rounded-full ${nextCol.dot}`} />
                  <span className={`text-xs font-semibold ${nextCol.color}`}>{nextCol.label}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Действие: <span className="font-medium text-card-foreground">{col.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Кто: <span className={`font-semibold px-1.5 py-0.5 rounded-full text-[11px] ${col.actorColor}`}>{col.actor}</span>
              </p>
            </div>
          )}
        </div>

        {/* Футер с действиями */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 shrink-0 space-y-2">
          {/* Кнопка продвижения статуса */}
          {nextCol && (
            <button
              onClick={order.status === "draft" ? onAssign : onAdvance}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {order.status === "draft" && <><UserCheck className="w-4 h-4" /> Назначить водителя</>}
              {order.status === "assigned" && <><Clock className="w-4 h-4" /> Перевести в работу</>}
              {order.status === "in_progress" && <><CheckCircle2 className="w-4 h-4" /> Завершить заявку</>}
              {order.status === "completed" && <><Archive className="w-4 h-4" /> Архивировать</>}
            </button>
          )}
          <button onClick={onEdit} className="w-full py-2.5 border border-border rounded-xl text-sm font-medium text-card-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <Edit2 className="w-4 h-4" />
            Редактировать
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Вспомогательные ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/20 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 border-b border-border">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label, value, icon, accent, warn,
}: {
  label: string; value: string;
  icon?: React.ReactNode; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-semibold text-right ${accent ? "text-accent" : warn ? "text-orange-500 italic" : "text-card-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
