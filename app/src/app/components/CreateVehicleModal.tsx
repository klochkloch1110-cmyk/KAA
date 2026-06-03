import { useState } from "react";
import {
  X, Truck, Hash, Calendar, Gauge, Weight, ChevronDown,
  CheckCircle2, AlertTriangle, FileText, Loader2, User,
} from "lucide-react";

interface CreateVehicleModalProps {
  onClose: () => void;
  onCreated?: (vehicle: CreatedVehicle) => void;
}

export interface CreatedVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  vin: string;
  capacity: number;
  bodyVolume: number | null;
  assignedDriver: string;
  status: "active";
}

const VEHICLE_TYPES = [
  { value: "самосвал", label: "Самосвал" },
  { value: "бортовой", label: "Бортовой" },
  { value: "цистерна", label: "Цистерна" },
  { value: "контейнеровоз", label: "Контейнеровоз" },
  { value: "рефрижератор", label: "Рефрижератор" },
  { value: "тягач", label: "Тягач + полуприцеп" },
];

const BRANDS = [
  "КАМАЗ", "МАЗ", "Volvo", "Scania", "Mercedes-Benz",
  "MAN", "DAF", "Renault", "ЛИАЗ", "ГАЗ", "Другое",
];

const REQUIRED_MARK = <span className="text-destructive">*</span>;

function genId() {
  return `VEH-${String(Math.floor(Math.random() * 900) + 100)}`;
}

interface Form {
  plate: string;
  brand: string;
  model: string;
  type: string;
  year: string;
  vin: string;
  capacity: string;
  bodyVolume: string;
  assignedDriver: string;
  note: string;
}

const EMPTY: Form = {
  plate: "",
  brand: "",
  model: "",
  type: "самосвал",
  year: "",
  vin: "",
  capacity: "",
  bodyVolume: "",
  assignedDriver: "",
  note: "",
};

export function CreateVehicleModal({ onClose, onCreated }: CreateVehicleModalProps) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [id] = useState(genId);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.plate.trim()) e.plate = "Укажите госномер";
    if (!form.brand) e.brand = "Выберите марку";
    if (!form.model.trim()) e.model = "Укажите модель";
    if (!form.type) e.type = "Выберите тип ТС";
    if (!form.year || Number(form.year) < 1990 || Number(form.year) > new Date().getFullYear())
      e.year = "Укажите корректный год";
    if (!form.capacity || Number(form.capacity) <= 0) e.capacity = "Укажите грузоподъёмность";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    onCreated?.({
      id,
      plate: form.plate.toUpperCase(),
      brand: form.brand,
      model: form.model,
      type: form.type,
      year: Number(form.year),
      vin: form.vin,
      capacity: Number(form.capacity),
      bodyVolume: form.bodyVolume ? Number(form.bodyVolume) : null,
      assignedDriver: form.assignedDriver,
      status: "active",
    });
    setTimeout(onClose, 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-accent/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Truck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-card-foreground">Новое транспортное средство</h2>
              <p className="text-xs text-muted-foreground">{id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {done ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-1">ТС добавлено!</h3>
              <p className="text-sm text-primary font-mono font-bold">{form.plate.toUpperCase()}</p>
              <p className="text-sm text-muted-foreground mt-1">{form.brand} {form.model}</p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* ── Идентификация ── */}
              <Section icon={<Hash className="w-4 h-4" />} title="Идентификация">
                <Field label="Государственный регистрационный номер" required error={errors.plate}>
                  <div className="relative">
                    <input
                      value={form.plate}
                      onChange={(e) => set("plate", e.target.value.toUpperCase())}
                      placeholder="А 000 АА 00"
                      maxLength={12}
                      className={cls(!!errors.plate) + " font-mono text-base tracking-widest uppercase"}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Формат: А 000 АА 77</p>
                </Field>
                <Field label="VIN-номер">
                  <input
                    value={form.vin}
                    onChange={(e) => set("vin", e.target.value.toUpperCase())}
                    placeholder="XTT6522E0E1234567"
                    maxLength={17}
                    className={cls(false) + " font-mono uppercase tracking-wider"}
                  />
                </Field>
              </Section>

              {/* ── Характеристики ── */}
              <Section icon={<Truck className="w-4 h-4" />} title="Характеристики">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Марка" required error={errors.brand}>
                    <div className="relative">
                      <select
                        value={form.brand}
                        onChange={(e) => set("brand", e.target.value)}
                        className={cls(!!errors.brand) + " appearance-none pr-8"}
                      >
                        <option value="">Выберите...</option>
                        {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Модель" required error={errors.model}>
                    <input
                      value={form.model}
                      onChange={(e) => set("model", e.target.value)}
                      placeholder="6520, FH, Axor..."
                      className={cls(!!errors.model)}
                    />
                  </Field>
                </div>

                <Field label="Тип ТС" required error={errors.type}>
                  <div className="grid grid-cols-3 gap-2">
                    {VEHICLE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set("type", t.value)}
                        className={`py-2 px-2 rounded-xl border-2 text-xs font-semibold text-center transition-all ${
                          form.type === t.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Год выпуска" required error={errors.year}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="number"
                      min={1990}
                      max={new Date().getFullYear()}
                      value={form.year}
                      onChange={(e) => set("year", e.target.value)}
                      placeholder={String(new Date().getFullYear())}
                      className={cls(!!errors.year) + " pl-9"}
                    />
                  </div>
                </Field>
              </Section>

              {/* ── Грузовые параметры ── */}
              <Section icon={<Weight className="w-4 h-4" />} title="Грузовые параметры">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Грузоподъёмность" required error={errors.capacity}>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={form.capacity}
                        onChange={(e) => set("capacity", e.target.value)}
                        placeholder="20"
                        className={cls(!!errors.capacity) + " pr-12"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        тонн
                      </span>
                    </div>
                  </Field>
                  <Field label="Объём кузова">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={form.bodyVolume}
                        onChange={(e) => set("bodyVolume", e.target.value)}
                        placeholder="14"
                        className={cls(false) + " pr-10"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        м³
                      </span>
                    </div>
                  </Field>
                </div>
              </Section>

              {/* ── Закреплённый водитель ── */}
              <Section icon={<User className="w-4 h-4" />} title="Закреплённый водитель">
                <Field label="ФИО водителя (необязательно)">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={form.assignedDriver}
                      onChange={(e) => set("assignedDriver", e.target.value)}
                      placeholder="Иванов Иван Петрович"
                      className={cls(false) + " pl-9"}
                    />
                  </div>
                </Field>
              </Section>

              {/* ── Примечание ── */}
              <Section icon={<FileText className="w-4 h-4" />} title="Примечание">
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Особенности ТС, техническое состояние, ограничения, пробег и т.д."
                  rows={3}
                  className={cls(false) + " resize-none"}
                />
              </Section>

            </div>
          )}
        </div>

        {/* Футер */}
        {!done && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-lg text-sm text-card-foreground hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</>
              ) : (
                <><Truck className="w-4 h-4" /> Добавить ТС</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Вспомогательные ── */
function cls(err: boolean) {
  return `w-full px-3 py-2.5 bg-background border rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
    err ? "border-destructive bg-destructive/5" : "border-border"
  }`;
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label} {required && REQUIRED_MARK}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

function Section({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
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
