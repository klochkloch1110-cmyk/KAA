import { useState } from "react";
import {
  X,
  Clock,
  User,
  Calendar,
  Truck,
  Fuel,
  Gauge,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  Package,
  AlertTriangle,
} from "lucide-react";

interface ShiftCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Данные смены (в реальности приходят из context / API) ── */
const SHIFT = {
  date: "23.05.2026",
  driver: "Иванов Иван Петрович",
  vehicle: "А123КС 77",
  startTime: "08:00",
  /* Одна или несколько заявок в смене */
  orders: [
    {
      number: "avl-0001/05/26",
      pointA: "Карьер №3",
      pointB: "Стройка Ленина 45",
      trips: 3,
      volume: 60,      // тонн
      volumeUnit: "тонн",
    },
    {
      number: "avl-0002/05/26",
      pointA: "Карьер №1",
      pointB: "ТЦ Галактика",
      trips: 2,
      volume: 36,
      volumeUnit: "тонн",
    },
  ],
};

/* Вычисляемые итоги */
const totalTrips  = SHIFT.orders.reduce((s, o) => s + o.trips, 0);
const totalVolume = SHIFT.orders.reduce((s, o) => s + o.volume, 0);
const multiOrder  = SHIFT.orders.length > 1;

function rTrips(n: number) {
  if (n === 1) return "рейс";
  if (n >= 2 && n <= 4) return "рейса";
  return "рейсов";
}

export function ShiftCloseModal({ isOpen, onClose }: ShiftCloseModalProps) {
  const [mileage, setMileage] = useState("");
  const [fuel, setFuel]     = useState("");
  const [mileageErr, setMileageErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]     = useState(false);

  function validateMileage(val: string): boolean {
    if (!val.trim()) {
      setMileageErr("Укажите пробег");
      return false;
    }
    if (Number(val) < 0) {
      setMileageErr("Пробег не может быть отрицательным");
      return false;
    }
    setMileageErr("");
    return true;
  }

  async function handleSubmit() {
    if (!validateMileage(mileage)) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 1800);
  }

  function handleClose() {
    if (submitting) return;
    setMileage("");
    setFuel("");
    setMileageErr("");
    setDone(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary to-accent px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Закрытие смены</h2>
              <p className="text-xs text-white/70">{SHIFT.date} · Начало {SHIFT.startTime}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Success ── */}
        {done && (
          <div className="absolute inset-0 bg-background flex flex-col items-center justify-center z-20 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Смена закрыта!</h3>
            <p className="text-sm text-muted-foreground">Данные сохранены и переданы диспетчеру</p>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* ══ БЛОК 1: Автоматические данные ══ */}
            <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Данные смены — заполнены автоматически
                </p>
              </div>

              <div className="divide-y divide-border">
                {/* Дата */}
                <AutoRow
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Дата"
                  value={SHIFT.date}
                />
                {/* ФИО */}
                <AutoRow
                  icon={<User className="w-3.5 h-3.5" />}
                  label="ФИО водителя"
                  value={SHIFT.driver}
                />
                {/* Номер машины */}
                <AutoRow
                  icon={<Truck className="w-3.5 h-3.5" />}
                  label="Номер машины"
                  value={SHIFT.vehicle}
                  accent
                />
              </div>
            </div>

            {/* ══ БЛОК 2: Рейсы ══ */}
            <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Рейсы за смену
                </p>
              </div>

              <div className="px-4 py-3 space-y-3">
                {/* Итоговая строка */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Всего рейсов</span>
                  <span className="text-xl font-bold text-primary">
                    {totalTrips} <span className="text-base font-semibold">{rTrips(totalTrips)}</span>
                  </span>
                </div>

                {/* Разбивка по заявкам (если заявок > 1) */}
                {multiOrder && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="space-y-1.5">
                      {SHIFT.orders.map((o) => (
                        <div key={o.number} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                          <span className="text-card-foreground font-medium flex-shrink-0">
                            {o.trips} {rTrips(o.trips)},
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1 truncate">
                            {o.pointA}
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            {o.pointB}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ══ БЛОК 3: Объём ══ */}
            <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Объём за смену
                </p>
              </div>

              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Общий объём</span>
                  <span className="text-xl font-bold text-accent">
                    {totalVolume} <span className="text-base font-semibold text-muted-foreground">тонн</span>
                  </span>
                </div>

                {multiOrder && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="space-y-1.5">
                      {SHIFT.orders.map((o) => (
                        <div key={o.number} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Package className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {o.pointA} <ArrowRight className="w-3 h-3 inline" /> {o.pointB}
                            </span>
                          </div>
                          <span className="font-semibold text-card-foreground flex-shrink-0 ml-2">
                            {o.volume} {o.volumeUnit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Разделитель ── */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <p className="text-xs text-muted-foreground font-semibold">Заполняется водителем</p>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ══ БЛОК 4: Пробег (ручной) ══ */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Gauge className="w-4 h-4 text-primary" />
                Пробег машины <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={mileage}
                  onChange={(e) => {
                    setMileage(e.target.value);
                    if (e.target.value) validateMileage(e.target.value);
                    else setMileageErr("");
                  }}
                  placeholder="Введите показание одометра"
                  className={`w-full px-4 py-3 pr-12 bg-background border-2 rounded-xl text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    mileageErr ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  км
                </span>
              </div>
              {mileageErr && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {mileageErr}
                </div>
              )}
            </div>

            {/* ══ БЛОК 5: Топливо (ручной) ══ */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Fuel className="w-4 h-4 text-primary" />
                Заправлено ДТ
                <span className="text-xs font-normal text-muted-foreground">(если заправлялись)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 pr-12 bg-background border-2 border-border rounded-xl text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  л
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex-shrink-0 flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !mileage.trim() || !!mileageErr}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Закрытие смены...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Закрыть смену
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-full py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function AutoRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 gap-3">
      <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-xs font-semibold text-right truncate max-w-[60%] ${accent ? "text-primary font-mono" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
