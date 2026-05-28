import { useState } from "react";
import {
  X,
  MapPin,
  Navigation,
  Package,
  Truck,
  FileText,
  Hash,
  Building2,
  User2,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Route,
  TrendingUp,
  ArrowDownUp,
} from "lucide-react";

interface CreateOrderModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

const MATERIALS = [
  "Песок",
  "Щебень",
  "Гравий",
  "Грунт",
  "Торф",
  "Чернозём",
  "Асфальт",
  "Бетон",
  "Керамзит",
  "Строительный мусор",
  "Другое",
];

function generateOrderNumber(): string {
  const num = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return `avl-${num}/${mm}/${yy}`;
}

function todayStr(): string {
  return new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface FormState {
  customer: string;
  from: string;
  to: string;
  material: string;
  volume: string;
  volumeUnit: "m3" | "tons";
  pointA: string;
  pointB: string;
  clientRate: string;
  clientRateUnit: "тонн" | "м³" | "час";
  driverRate: string;
  note: string;
}

const empty: FormState = {
  customer: "",
  from: "",
  to: "",
  material: "",
  volume: "",
  volumeUnit: "tons",
  pointA: "",
  pointB: "",
  clientRate: "",
  clientRateUnit: "тонн",
  driverRate: "",
  note: "",
};

export function CreateOrderModal({ onClose, onCreated }: CreateOrderModalProps) {
  const [orderNumber] = useState(generateOrderNumber);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showMap, setShowMap] = useState(false);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.customer.trim()) e.customer = "Обязательное поле";
    if (!form.from.trim()) e.from = "Обязательное поле";
    if (!form.to.trim()) e.to = "Обязательное поле";
    if (!form.material) e.material = "Выберите материал";
    if (!form.volume || Number(form.volume) <= 0) e.volume = "Укажите объём";
    if (!form.pointA.trim()) e.pointA = "Укажите место погрузки";
    if (!form.pointB.trim()) e.pointB = "Укажите место разгрузки";
    if (!form.clientRate || Number(form.clientRate) <= 0) e.clientRate = "Укажите ставку заказчика";
    if (!form.driverRate || Number(form.driverRate) <= 0) e.driverRate = "Укажите ставку водителя";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setDone(true);
    onCreated?.();
    setTimeout(onClose, 1600);
  }

  const hasRoute = form.pointA.trim() && form.pointB.trim();

  const mapSrc = hasRoute
    ? `https://yandex.ru/maps/?rtext=${encodeURIComponent(form.pointA)}~${encodeURIComponent(form.pointB)}&rtt=auto&z=10&l=map&from=api-maps`
    : `https://yandex.ru/maps/?ll=37.618423%2C55.751244&z=10&l=map&from=api-maps`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-accent/5 to-transparent shrink-0">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Новая заявка</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Заполните форму задания</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-1">Заявка создана!</h3>
              <p className="text-sm text-muted-foreground">{orderNumber}</p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* ── Блок: Номер и дата ── */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">
                    Номер заявки
                  </p>
                  <p className="text-xl font-bold text-primary font-mono tracking-wider">{orderNumber}</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm font-medium text-card-foreground">{todayStr()}</p>
                </div>
              </div>

              {/* ── Блок: Стороны ── */}
              <Section icon={<Building2 className="w-4 h-4" />} title="Стороны">
                <Field label="Заказчик" error={errors.customer}>
                  <div className="relative">
                    <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={form.customer}
                      onChange={(e) => set("customer", e.target.value)}
                      placeholder="Наименование заказчика"
                      className={cls(!!errors.customer) + " pl-9"}
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="От кого" error={errors.from}>
                    <input
                      value={form.from}
                      onChange={(e) => set("from", e.target.value)}
                      placeholder="Название организации"
                      className={cls(!!errors.from)}
                    />
                  </Field>
                  <Field label="Кому" error={errors.to}>
                    <input
                      value={form.to}
                      onChange={(e) => set("to", e.target.value)}
                      placeholder="Название организации"
                      className={cls(!!errors.to)}
                    />
                  </Field>
                </div>
              </Section>

              {/* ── Блок: Груз ── */}
              <Section icon={<Package className="w-4 h-4" />} title="Груз">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Материал" error={errors.material}>
                    <div className="relative">
                      <select
                        value={form.material}
                        onChange={(e) => set("material", e.target.value)}
                        className={cls(!!errors.material) + " appearance-none pr-8"}
                      >
                        <option value="">Выберите...</option>
                        {MATERIALS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Общий объём" error={errors.volume}>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={form.volume}
                        onChange={(e) => set("volume", e.target.value)}
                        placeholder="0"
                        className={cls(!!errors.volume) + " flex-1"}
                      />
                      <div className="relative">
                        <select
                          value={form.volumeUnit}
                          onChange={(e) => set("volumeUnit", e.target.value as "m3" | "tons")}
                          className={cls(false) + " appearance-none pl-2 pr-6 w-20 text-xs"}
                        >
                          <option value="tons">тонн</option>
                          <option value="m3">м³</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </Field>
                </div>
              </Section>

              {/* ── Блок: Маршрут ── */}
              <Section icon={<Route className="w-4 h-4" />} title="Маршрут">
                {/* Точка А */}
                <Field label="Место погрузки — Точка А" error={errors.pointA}>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                      A
                    </div>
                    <input
                      value={form.pointA}
                      onChange={(e) => {
                        set("pointA", e.target.value);
                        setShowMap(false);
                      }}
                      placeholder="Наименование места погрузки, адрес"
                      className={cls(!!errors.pointA) + " pl-10"}
                    />
                  </div>
                </Field>

                {/* Точка Б */}
                <Field label="Место разгрузки — Точка Б" error={errors.pointB}>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                      B
                    </div>
                    <input
                      value={form.pointB}
                      onChange={(e) => {
                        set("pointB", e.target.value);
                        setShowMap(false);
                      }}
                      placeholder="Наименование места разгрузки, адрес"
                      className={cls(!!errors.pointB) + " pl-10"}
                    />
                  </div>
                </Field>

                {/* Схема маршрута */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Схема маршрута на карте
                    </p>
                    {hasRoute && (
                      <button
                        onClick={() => setShowMap((v) => !v)}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        {showMap ? "Скрыть карту" : "Показать маршрут"}
                      </button>
                    )}
                  </div>

                  {/* Route preview line */}
                  {hasRoute ? (
                    <div className="bg-muted/30 border border-border rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">A</div>
                          <div className="flex flex-col gap-0.5">
                            {[0,1,2].map((i) => (
                              <div key={i} className="w-0.5 h-1.5 bg-border rounded-full mx-auto" />
                            ))}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">B</div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Погрузка</p>
                            <p className="text-sm font-medium text-card-foreground truncate">{form.pointA}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Разгрузка</p>
                            <p className="text-sm font-medium text-card-foreground truncate">{form.pointB}</p>
                          </div>
                        </div>
                        {!showMap && (
                          <button
                            onClick={() => setShowMap(true)}
                            className="ml-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 flex-shrink-0"
                          >
                            <MapPin className="w-3 h-3" />
                            Карта
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/20 border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <p className="text-xs">Укажите точки А и Б для отображения маршрута</p>
                    </div>
                  )}

                  {/* Yandex Map embed */}
                  {showMap && hasRoute && (
                    <div className="rounded-xl overflow-hidden border border-border relative" style={{ height: 280 }}>
                      {/* Map header */}
                      <div className="absolute top-0 left-0 right-0 z-10 bg-card/90 backdrop-blur-sm px-3 py-2 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[10px]">A</span>
                            <span className="text-muted-foreground truncate max-w-[120px]">{form.pointA}</span>
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white font-bold text-[10px]">B</span>
                            <span className="text-muted-foreground truncate max-w-[120px]">{form.pointB}</span>
                          </span>
                        </div>
                        <a
                          href={`https://yandex.ru/maps/?rtext=${encodeURIComponent(form.pointA)}~${encodeURIComponent(form.pointB)}&rtt=auto`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />
                          Яндекс.Карты
                        </a>
                      </div>
                      <iframe
                        key={form.pointA + form.pointB}
                        src={mapSrc}
                        title="Маршрут на карте"
                        className="w-full h-full"
                        style={{ border: "none", marginTop: 0 }}
                        loading="lazy"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Блок: Условия ── */}
              <Section icon={<ArrowDownUp className="w-4 h-4" />} title="Условия и ставки">

                {/* Ставка заказчика */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                      Ставка заказчика (доход)
                    </p>
                  </div>
                  <Field label="Сумма, ₽ за единицу" error={errors.clientRate}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₽</span>
                        <input
                          type="number"
                          min={0}
                          value={form.clientRate}
                          onChange={(e) => set("clientRate", e.target.value)}
                          placeholder="0"
                          className={cls(!!errors.clientRate) + " pl-7"}
                        />
                      </div>
                      <div className="relative">
                        <select
                          value={form.clientRateUnit}
                          onChange={(e) => set("clientRateUnit", e.target.value as "тонн" | "м³" | "час")}
                          className={cls(false) + " appearance-none pl-3 pr-7 w-24 text-sm"}
                        >
                          <option value="тонн">/ тонн</option>
                          <option value="м³">/ м³</option>
                          <option value="час">/ час</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </Field>
                  {form.clientRate && form.volume && Number(form.clientRate) > 0 && Number(form.volume) > 0 && form.clientRateUnit !== "час" && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Итого с заказчика: ₽{(Number(form.clientRate) * Number(form.volume)).toLocaleString("ru-RU")}
                      {" "}({form.volume} {form.volumeUnit === "tons" ? "тонн" : "м³"} × ₽{form.clientRate})
                    </p>
                  )}
                </div>

                {/* Ставка водителя */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      Ставка водителя (расход)
                    </p>
                  </div>
                  <Field label="Сумма, ₽ за рейс" error={errors.driverRate}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₽</span>
                      <input
                        type="number"
                        min={0}
                        value={form.driverRate}
                        onChange={(e) => set("driverRate", e.target.value)}
                        placeholder="0"
                        className={cls(!!errors.driverRate) + " pl-7"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        / рейс
                      </span>
                    </div>
                  </Field>
                </div>

              </Section>

              {/* ── Блок: Примечание ── */}
              <Section icon={<FileText className="w-4 h-4" />} title="Примечание">
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Любая дополнительная информация по работе: особые требования, условия доступа, контактные лица и т.д."
                  rows={3}
                  className={cls(false) + " resize-none"}
                />
              </Section>

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!done && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-lg text-sm text-card-foreground hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Заявка</p>
                <p className="text-xs font-mono font-bold text-primary">{orderNumber}</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4" />
                    Создать заявку
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cls(hasError: boolean) {
  return `w-full px-3 py-2.5 bg-input-background border rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
    hasError ? "border-red-500 bg-red-500/5" : "border-border"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/20 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <p className="text-xs font-bold text-card-foreground uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}
