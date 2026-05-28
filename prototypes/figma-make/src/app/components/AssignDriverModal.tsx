import { useState } from "react";
import {
  X, Search, User, Truck, Phone, Star, CheckCircle2,
  MapPin, ArrowRight, Package, AlertTriangle, UserCheck,
  Clock, Plus, Minus, Edit3, Check,
} from "lucide-react";
import type { AssignedDriver } from "./OrdersView";

/* ─── Типы ─── */
interface OrderBrief {
  number: string;
  customer: string;
  pointA: string;
  pointB: string;
  material: string;
  volume: number;
  volumeUnit: string;
  tripsTotal: number;
  ratePerTrip: number;
}

interface DriverRecord {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleType: string;
  status: "free" | "busy";
  tripsToday: number;
  rating: number;
}

interface AssignDriverModalProps {
  order: OrderBrief;
  existingDrivers: AssignedDriver[];
  onClose: () => void;
  onAssign: (drivers: AssignedDriver[]) => void;
}

/* ─── Мок-справочник водителей ─── */
const DRIVER_ROSTER: DriverRecord[] = [
  {
    id: "d1",
    name: "Иванов Иван Петрович",
    phone: "+7 (905) 123-45-67",
    vehicle: "А123КС 77",
    vehicleType: "КАМАЗ-6520 (20 т)",
    status: "free",
    tripsToday: 3,
    rating: 4.9,
  },
  {
    id: "d2",
    name: "Петров Алексей Сергеевич",
    phone: "+7 (916) 234-56-78",
    vehicle: "В456ВО 77",
    vehicleType: "МАЗ-5516 (20 т)",
    status: "free",
    tripsToday: 5,
    rating: 4.7,
  },
  {
    id: "d3",
    name: "Сидоров Пётр Иванович",
    phone: "+7 (926) 345-67-89",
    vehicle: "С789НМ 77",
    vehicleType: "КАМАЗ-65115 (15 т)",
    status: "busy",
    tripsToday: 4,
    rating: 4.8,
  },
  {
    id: "d4",
    name: "Козлов Михаил Дмитриевич",
    phone: "+7 (903) 456-78-90",
    vehicle: "Е234АО 77",
    vehicleType: "Volvo FH (25 т)",
    status: "free",
    tripsToday: 2,
    rating: 5.0,
  },
  {
    id: "d5",
    name: "Новиков Андрей Викторович",
    phone: "+7 (917) 567-89-01",
    vehicle: "К567ТУ 77",
    vehicleType: "КАМАЗ-6580 (25 т)",
    status: "busy",
    tripsToday: 6,
    rating: 4.6,
  },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

/* ─── Компонент ─── */
export function AssignDriverModal({ order, existingDrivers, onClose, onAssign }: AssignDriverModalProps) {
  const [search, setSearch] = useState("");
  const [filterFree, setFilterFree] = useState(false);

  /* Список выбранных: id → переопределение ТС (если есть) */
  const [selected, setSelected] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    existingDrivers.forEach((d) => {
      const rec = DRIVER_ROSTER.find((r) => r.name === d.name);
      if (rec) m.set(rec.id, d.vehicle !== rec.vehicle ? d.vehicle : "");
    });
    return m;
  });

  /* Редактирование ТС для конкретного водителя */
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [vehicleDraft, setVehicleDraft] = useState("");

  const filtered = DRIVER_ROSTER.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.vehicle.toLowerCase().includes(q) ||
      d.vehicleType.toLowerCase().includes(q);
    return matchSearch && (!filterFree || d.status === "free");
  });

  function toggle(driver: DriverRecord) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(driver.id)) {
        next.delete(driver.id);
        if (editingVehicle === driver.id) setEditingVehicle(null);
      } else {
        next.set(driver.id, "");
      }
      return next;
    });
  }

  function startEditVehicle(driverId: string) {
    const rec = DRIVER_ROSTER.find((d) => d.id === driverId)!;
    setVehicleDraft(selected.get(driverId) || rec.vehicle);
    setEditingVehicle(driverId);
  }

  function commitVehicle(driverId: string) {
    const rec = DRIVER_ROSTER.find((d) => d.id === driverId)!;
    const val = vehicleDraft.trim();
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(driverId, val === rec.vehicle ? "" : val);
      return next;
    });
    setEditingVehicle(null);
  }

  function handleConfirm() {
    const drivers: AssignedDriver[] = Array.from(selected.keys()).map((id) => {
      const rec = DRIVER_ROSTER.find((d) => d.id === id)!;
      const override = selected.get(id) ?? "";
      return {
        name: rec.name,
        vehicle: override || rec.vehicle,
        vehicleType: rec.vehicleType,
        phone: rec.phone,
      };
    });
    onAssign(drivers);
  }

  const selectedCount = selected.size;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Шапка ── */}
        <div className="bg-gradient-to-r from-primary to-accent px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Назначение водителей</h2>
              <p className="text-xs text-white/70">{order.number} · {order.customer}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Инфо о заявке ── */}
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              {order.pointA.split(",")[0]}
              <ArrowRight className="w-3 h-3" />
              {order.pointB.split(",")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {order.material} · {order.volume} {order.volumeUnit}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {order.tripsTotal} рейсов · ₽{order.ratePerTrip.toLocaleString("ru-RU")}/рейс
            </span>
          </div>
        </div>

        {/* ── Тело ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Поиск + фильтр */}
          <div className="px-5 pt-4 pb-3 space-y-3 sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Имя, номер ТС, тип..."
                className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setFilterFree(!filterFree)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  filterFree
                    ? "bg-green-500/10 border-green-400/40 text-green-600"
                    : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${filterFree ? "bg-green-500" : "bg-muted-foreground"}`} />
                Только свободные
              </button>
              <span className="text-xs text-muted-foreground">{filtered.length} водит. · выбрано {selectedCount}</span>
            </div>
          </div>

          {/* Список водителей */}
          <div className="px-5 py-4 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Водители не найдены</p>
              </div>
            )}
            {filtered.map((driver) => {
              const isSelected = selected.has(driver.id);
              const isBusy = driver.status === "busy";
              const vehicleOverride = selected.get(driver.id) ?? "";
              const effectiveVehicle = vehicleOverride || driver.vehicle;
              const isEditingThis = editingVehicle === driver.id;

              return (
                <div
                  key={driver.id}
                  className={`rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {/* Основная строка карточки */}
                  <button
                    className="w-full text-left p-3"
                    onClick={() => toggle(driver)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Чекбокс-аватар */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isSelected
                          ? <Check className="w-4 h-4" />
                          : initials(driver.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{driver.name}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            isBusy
                              ? "bg-orange-500/10 text-orange-600"
                              : "bg-green-500/10 text-green-600"
                          }`}>
                            {isBusy ? "Занят" : "Свободен"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-primary font-semibold">{driver.vehicle}</span>
                          <span className="text-xs text-muted-foreground">· {driver.vehicleType}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-foreground">{driver.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{driver.tripsToday} рейс.</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && isBusy && (
                      <div className="mt-2 flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg px-2.5 py-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        <p className="text-xs text-orange-600 dark:text-orange-400">Водитель занят — будет назначен в очередь</p>
                      </div>
                    )}
                  </button>

                  {/* Блок ТС — разворачивается при выборе */}
                  {isSelected && (
                    <div className="border-t border-primary/20 px-3 py-2 bg-primary/3">
                      {!isEditingThis ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Truck className="w-3.5 h-3.5 text-primary" />
                            <span className="font-mono font-semibold text-primary">{effectiveVehicle}</span>
                            {vehicleOverride && (
                              <span className="text-muted-foreground text-[10px] italic">(изменено)</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditVehicle(driver.id); }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                          >
                            <Edit3 className="w-3 h-3" />
                            Изменить ТС
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <input
                            autoFocus
                            type="text"
                            value={vehicleDraft}
                            onChange={(e) => setVehicleDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitVehicle(driver.id);
                              if (e.key === "Escape") setEditingVehicle(null);
                            }}
                            className="flex-1 px-2 py-1 bg-background border border-primary rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); commitVehicle(driver.id); }}
                            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0"
                          >
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Итоговая полоса + Футер ── */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex-shrink-0 space-y-3">

          {/* Список выбранных */}
          {selectedCount > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Выбрано ({selectedCount}):</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selected.keys()).map((id) => {
                  const rec = DRIVER_ROSTER.find((d) => d.id === id)!;
                  const override = selected.get(id) ?? "";
                  const vehicle = override || rec.vehicle;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1"
                    >
                      <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-[9px] font-bold text-primary-foreground flex-shrink-0">
                        {initials(rec.name)}
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-28">
                        {rec.name.split(" ")[0]} {rec.name.split(" ")[1]?.[0]}.
                      </span>
                      <span className="text-xs font-mono text-primary">{vehicle}</span>
                      <button
                        onClick={() => toggle(rec)}
                        className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            {selectedCount === 0
              ? "Выберите водителя"
              : selectedCount === 1
              ? "Назначить водителя"
              : `Назначить ${selectedCount} водителей`}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
