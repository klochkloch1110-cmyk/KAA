import {
  Truck, User, Clock, ChevronRight, Camera, CheckCircle2,
  LogOut, Navigation, Building2, Hash, Package, ChevronDown,
  ChevronUp, FileText, AlertCircle, PlayCircle,
} from "lucide-react";
import { useState } from "react";
import { ShiftCloseModal } from "./ShiftCloseModal";
import { TripReportModal } from "./TripReportModal";
import type { SubmittedTripReport } from "./TripReportModal";
import { useAppStore } from "../store/AppStore";
import { useAuth } from "../auth/AuthProvider";
import { findCurrentShift, findDriverVehicle, isCurrentDriverRecord } from "../utils/driverData";

interface Trip {
  id: string;
  time: string;
  consignmentNote: string;
  volume: number;
}

interface Order {
  number: string;
  date: string;
  customer: string;
  from: string;
  to: string;
  material: string;
  volume: number;
  volumeUnit: string;
  pointA: string;
  pointB: string;
  ratePerTrip: string;
  note?: string;
  completedTrips: Trip[];
}

export function DriverHome() {
  const { user } = useAuth();
  const { shifts, vehicles, getDriverOrders, getOrderTrips, submitTripReport, openShift, closeShift } = useAppStore();
  const [isShiftCloseModalOpen, setIsShiftCloseModalOpen] = useState(false);
  const [isTripReportModalOpen, setIsTripReportModalOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string>("");
  const [reportOrderNum, setReportOrderNum] = useState<string | null>(null);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [shiftError, setShiftError] = useState("");
  const [isOpeningShift, setIsOpeningShift] = useState(false);

  const driverName = user?.fullName ?? "Водитель";
  const driverId = user?.id;
  const currentShift = findCurrentShift(shifts, driverName, driverId);
  const driverOrders = getDriverOrders(driverName, driverId);
  const vehicleInfo = findDriverVehicle(vehicles, currentShift, driverOrders, driverName, driverId);
  const orders: Order[] = driverOrders.map((order) => ({
    number: order.number,
    date: order.date,
    customer: order.customer,
    from: order.from,
    to: order.to,
    material: order.material,
    volume: order.volume,
    volumeUnit: order.volumeUnit,
    pointA: order.pointA,
    pointB: order.pointB,
    ratePerTrip: `₽${order.ratePerTrip.toLocaleString("ru-RU")}`,
    note: order.note,
    completedTrips: getOrderTrips(order.number).filter((trip) => isCurrentDriverRecord(trip, driverName, driverId)).map((trip) => ({
      id: trip.id,
      time: trip.time,
      consignmentNote: trip.consignmentNoteDriver,
      volume: trip.volumeDriver,
    })),
  }));

  function openReport(orderNumber: string) {
    setReportOrderNum(orderNumber);
    setShowOrderPicker(false);
    setIsTripReportModalOpen(true);
  }

  function handleTripSubmitted(trip: SubmittedTripReport) {
    return submitTripReport(trip);
  }

  async function handleOpenShift() {
    const assignment = driverOrders
      .flatMap((order) => order.drivers)
      .find((driver) => (driverId && driver.driverId === driverId) || driver.name === driverName);

    setShiftError("");
    setIsOpeningShift(true);
    try {
      await openShift({
        driverId,
        driverName,
        vehicleId: assignment?.vehicleId,
        vehiclePlate: assignment?.vehicle,
      });
    } catch (error) {
      setShiftError(error instanceof Error ? error.message : "Не удалось открыть смену");
    } finally {
      setIsOpeningShift(false);
    }
  }

  const totalTrips = orders.reduce((s, o) => s + o.completedTrips.length, 0);
  const totalEarnings = orders.reduce((sum, order) => sum + order.completedTrips.length * Number(order.ratePerTrip.replace(/[^0-9.-]/g, "")), 0);
  const selectedOrder = orders.find((order) => order.number === reportOrderNum);

  return (
    <div className="h-screen bg-background overflow-auto pb-20">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold">Добрый день!</h1>
            <p className="text-sm opacity-80 mt-0.5">{driverName}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Смена */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{currentShift ? "Смена открыта" : "Смена не открыта"}</span>
            </div>
            {currentShift && <span className="text-xs opacity-80">с {currentShift.startTime}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Дата", value: currentShift?.date ?? "—" },
              { label: "Рейсов", value: String(totalTrips) },
              { label: "Заработано", value: `₽${totalEarnings.toLocaleString("ru-RU")}` },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs opacity-70">{s.label}</p>
                <p className="text-base font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="p-4 space-y-3">

        {/* Кнопка отчёта о рейсе */}
        <div className="relative">
          <button
            onClick={() => {
              if (!currentShift) {
                setShiftError("Сначала откройте смену, затем отправляйте рейсовые отчёты");
                return;
              }
              setShowOrderPicker((v) => !v);
            }}
            className="w-full bg-primary text-primary-foreground rounded-xl p-4 font-medium shadow-lg hover:opacity-90 transition-opacity flex items-center justify-between disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold">Отчёт о рейсе</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                  {orders.length} заявки
              </span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          {/* Выбор заявки для отчёта */}
          {showOrderPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Выберите заявку для отчёта
                </p>
              </div>
              {orders.map((o, idx) => (
                <button
                  key={o.number}
                  onClick={() => openReport(o.number)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-primary">{o.number}</p>
                    <p className="text-sm font-semibold text-card-foreground truncate">{o.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.pointA.split(",")[0]} → {o.pointB.split(",")[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">{o.completedTrips.length}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!currentShift && (
          <button
            onClick={handleOpenShift}
            disabled={isOpeningShift || orders.length === 0}
            className="w-full bg-card border border-primary/30 text-card-foreground rounded-xl p-4 font-medium hover:bg-primary/10 transition-colors flex items-center justify-between disabled:opacity-60 disabled:hover:bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-base">Открыть смену</span>
                <p className="text-xs text-muted-foreground mt-0.5 text-left">
                  {orders.length > 0 ? "Будет использована назначенная машина" : "Нет назначенных заявок и машины"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        {shiftError && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{shiftError}</span>
          </div>
        )}

        {/* Закрыть смену */}
        <button
          onClick={() => {
            if (currentShift) setIsShiftCloseModalOpen(true);
          }}
          disabled={!currentShift}
          className="w-full bg-card border border-border text-card-foreground rounded-xl p-4 font-medium hover:bg-muted/50 transition-colors flex items-center justify-between disabled:opacity-60 disabled:hover:bg-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-base">Закрыть смену</span>
              {!currentShift && <p className="text-xs text-muted-foreground mt-0.5 text-left">Сначала должна быть открыта смена</p>}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* ── Активные заявки ── */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-bold text-card-foreground">Активные заявки</h2>
            <span className="text-xs font-semibold text-white bg-primary px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </div>

          <div className="space-y-2">
            {orders.map((order, idx) => {
              const isOpen = expandedOrder === order.number;
              const hasTrips = order.completedTrips.length > 0;

              return (
                <div
                  key={order.number}
                  className={`bg-card rounded-xl border overflow-hidden shadow-sm transition-all ${
                    isOpen ? "border-primary/40" : "border-border"
                  }`}
                >
                  {/* Заголовок карточки — всегда виден */}
                  <button
                    onClick={() => setExpandedOrder(isOpen ? "" : order.number)}
                    className="w-full text-left"
                  >
                    <div className={`px-4 py-3 flex items-center gap-3 ${
                      isOpen
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border"
                        : "hover:bg-muted/30 transition-colors"
                    }`}>
                      {/* Номер */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isOpen ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      {/* Инфо */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary">{order.number}</span>
                          {hasTrips && (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              {order.completedTrips.length}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-card-foreground truncate">{order.customer}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.pointA.split(",")[0]} → {order.pointB.split(",")[0]}
                        </p>
                      </div>
                      {/* Стрелка */}
                      <div className="flex-shrink-0 text-muted-foreground">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Развёрнутое содержимое */}
                  {isOpen && (
                    <div className="p-4 space-y-3">

                      {/* Номер и дата */}
                      <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-mono font-bold text-primary">{order.number}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </div>

                      {/* Заказчик */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Заказчик</p>
                        <p className="font-semibold text-card-foreground">{order.customer}</p>
                      </div>

                      {/* От кого / Кому */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">От кого</p>
                          </div>
                          <p className="text-xs font-medium text-card-foreground leading-tight">{order.from}</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Кому</p>
                          </div>
                          <p className="text-xs font-medium text-card-foreground leading-tight">{order.to}</p>
                        </div>
                      </div>

                      {/* Материал и объём */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Материал</p>
                          </div>
                          <p className="font-semibold text-card-foreground">{order.material}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Общий объём</p>
                          <p className="font-semibold text-card-foreground">{order.volume} {order.volumeUnit}</p>
                        </div>
                      </div>

                      {/* Маршрут */}
                      <div className="bg-muted/30 rounded-xl overflow-hidden border border-border">
                        <div className="flex items-start gap-3 px-3 py-2.5">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">A</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Место погрузки</p>
                            <p className="text-sm font-medium text-card-foreground leading-tight">{order.pointA}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-3">
                          <div className="ml-2.5 flex flex-col gap-0.5">
                            {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-border mx-auto" />)}
                          </div>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="flex items-start gap-3 px-3 py-2.5">
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">B</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Место разгрузки</p>
                            <p className="text-sm font-medium text-card-foreground leading-tight">{order.pointB}</p>
                          </div>
                        </div>
                        <a
                          href={`https://yandex.ru/maps/?rtext=${encodeURIComponent(order.pointA)}~${encodeURIComponent(order.pointB)}&rtt=auto`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors py-2.5 border-t border-border"
                        >
                          <Navigation className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">Маршрут в Яндекс.Картах</span>
                        </a>
                      </div>

                      {/* Ставка */}
                      <div className="bg-accent/10 rounded-xl px-4 py-3 border border-accent/20 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Ставка за рейс</p>
                        <p className="text-xl font-bold text-accent">{order.ratePerTrip}</p>
                      </div>

                      {/* Примечание */}
                      {order.note && (
                        <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                          <div className="flex items-center gap-1.5 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-primary" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Примечание</p>
                          </div>
                          <p className="text-sm text-card-foreground leading-relaxed break-words">{order.note}</p>
                        </div>
                      )}

                      {/* Выполненные рейсы */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Рейсы по заявке
                          </p>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {order.completedTrips.length}
                          </span>
                        </div>
                        {order.completedTrips.length > 0 ? (
                          <div className="space-y-1.5">
                            {order.completedTrips.map((trip) => (
                              <div key={trip.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                <p className="text-sm font-medium text-card-foreground flex-1 min-w-0 truncate">ТТН {trip.consignmentNote}</p>
                                <p className="text-xs text-muted-foreground flex-shrink-0">{trip.time}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic text-center py-2">Рейсов ещё не выполнено</p>
                        )}
                      </div>

                      {/* Кнопка отчёта по этой заявке */}
                      <button
                        onClick={() => openReport(order.number)}
                        className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                      >
                        <FileText className="w-4 h-4" />
                        Отчёт по этой заявке
                      </button>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Мой автомобиль */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Мой автомобиль
          </h3>
          <div className="space-y-2">
            {vehicleInfo ? (
              [
                { label: "Гос. номер", value: vehicleInfo.plate },
                { label: "Модель", value: vehicleInfo.model },
                { label: "Пробег", value: vehicleInfo.mileage === null ? "—" : `${vehicleInfo.mileage.toLocaleString("ru-RU")} км` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between gap-4">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="text-sm font-medium text-card-foreground text-right">{r.value}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Автомобиль пока не назначен.</p>
            )}
          </div>
        </div>

      </div>

      <ShiftCloseModal
        isOpen={isShiftCloseModalOpen}
        onClose={() => setIsShiftCloseModalOpen(false)}
        shift={currentShift}
        orders={orders.map((order) => ({
          number: order.number,
          pointA: order.pointA,
          pointB: order.pointB,
          trips: order.completedTrips.length,
          volume: order.completedTrips.reduce((sum, trip) => sum + trip.volume, 0),
          volumeUnit: order.volumeUnit,
        }))}
        onSubmitted={closeShift}
      />
      <TripReportModal
        isOpen={isTripReportModalOpen}
        order={selectedOrder ? { ...selectedOrder, driver: driverName } : undefined}
        onClose={() => setIsTripReportModalOpen(false)}
        onSubmitted={handleTripSubmitted}
      />
    </div>
  );
}
