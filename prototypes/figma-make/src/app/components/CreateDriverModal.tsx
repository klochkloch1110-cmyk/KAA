import { useState } from "react";
import {
  X, User, Phone, Mail, CreditCard, Calendar, Hash,
  CheckCircle2, AlertTriangle, Shield, FileText, Loader2,
} from "lucide-react";

interface CreateDriverModalProps {
  onClose: () => void;
  onCreated?: (driver: CreatedDriver) => void;
}

export interface CreatedDriver {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories: string[];
  joinDate: string;
  note: string;
  status: "active";
  vehicle: null;
  tripsThisMonth: number;
  earningsThisMonth: number;
  rating: number;
}

const LICENSE_CATEGORIES = ["B", "C", "CE", "D", "DE"];

const REQUIRED_MARK = <span className="text-destructive">*</span>;

function genId() {
  return `DRV-${String(Math.floor(Math.random() * 900) + 100)}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface Form {
  lastName: string;
  firstName: string;
  patronymic: string;
  birthDate: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories: string[];
  joinDate: string;
  note: string;
}

const EMPTY: Form = {
  lastName: "",
  firstName: "",
  patronymic: "",
  birthDate: "",
  phone: "",
  email: "",
  licenseNumber: "",
  licenseExpiry: "",
  licenseCategories: ["C"],
  joinDate: todayStr(),
  note: "",
};

export function CreateDriverModal({ onClose, onCreated }: CreateDriverModalProps) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [id] = useState(genId);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function toggleCategory(cat: string) {
    setForm((p) => ({
      ...p,
      licenseCategories: p.licenseCategories.includes(cat)
        ? p.licenseCategories.filter((c) => c !== cat)
        : [...p.licenseCategories, cat],
    }));
    setErrors((p) => ({ ...p, licenseCategories: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.lastName.trim()) e.lastName = "Укажите фамилию";
    if (!form.firstName.trim()) e.firstName = "Укажите имя";
    if (!form.phone.trim()) e.phone = "Укажите телефон";
    if (!form.licenseNumber.trim()) e.licenseNumber = "Укажите номер ВУ";
    if (!form.licenseExpiry) e.licenseExpiry = "Укажите срок действия";
    if (form.licenseCategories.length === 0) e.licenseCategories = "Выберите хотя бы одну категорию";
    if (!form.joinDate) e.joinDate = "Укажите дату трудоустройства";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    const fullName = [form.lastName, form.firstName, form.patronymic].filter(Boolean).join(" ");
    onCreated?.({
      id,
      name: fullName,
      phone: form.phone,
      email: form.email,
      birthDate: form.birthDate,
      licenseNumber: form.licenseNumber,
      licenseExpiry: form.licenseExpiry,
      licenseCategories: form.licenseCategories,
      joinDate: form.joinDate,
      note: form.note,
      status: "active",
      vehicle: null,
      tripsThisMonth: 0,
      earningsThisMonth: 0,
      rating: 5.0,
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
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-card-foreground">Новый водитель</h2>
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
              <h3 className="text-xl font-bold text-card-foreground mb-1">Водитель добавлен!</h3>
              <p className="text-sm text-muted-foreground">
                {[form.lastName, form.firstName, form.patronymic].filter(Boolean).join(" ")}
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* ── ФИО ── */}
              <Section icon={<User className="w-4 h-4" />} title="ФИО">
                <Field label="Фамилия" required error={errors.lastName}>
                  <input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Иванов"
                    className={cls(!!errors.lastName)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Имя" required error={errors.firstName}>
                    <input
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="Иван"
                      className={cls(!!errors.firstName)}
                    />
                  </Field>
                  <Field label="Отчество">
                    <input
                      value={form.patronymic}
                      onChange={(e) => set("patronymic", e.target.value)}
                      placeholder="Петрович"
                      className={cls(false)}
                    />
                  </Field>
                </div>
                <Field label="Дата рождения">
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                    className={cls(false)}
                  />
                </Field>
              </Section>

              {/* ── Контакты ── */}
              <Section icon={<Phone className="w-4 h-4" />} title="Контакты">
                <Field label="Телефон" required error={errors.phone}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className={cls(!!errors.phone) + " pl-9"}
                    />
                  </div>
                </Field>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="example@mail.ru"
                      className={cls(false) + " pl-9"}
                    />
                  </div>
                </Field>
              </Section>

              {/* ── Водительское удостоверение ── */}
              <Section icon={<Shield className="w-4 h-4" />} title="Водительское удостоверение">
                <Field label="Серия и номер ВУ" required error={errors.licenseNumber}>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={form.licenseNumber}
                      onChange={(e) => set("licenseNumber", e.target.value)}
                      placeholder="77 АВ 123456"
                      className={cls(!!errors.licenseNumber) + " pl-9 font-mono uppercase"}
                    />
                  </div>
                </Field>
                <Field label="Срок действия ВУ" required error={errors.licenseExpiry}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={form.licenseExpiry}
                      onChange={(e) => set("licenseExpiry", e.target.value)}
                      min={todayStr()}
                      className={cls(!!errors.licenseExpiry) + " pl-9"}
                    />
                  </div>
                </Field>

                {/* Категории */}
                <Field label="Категории ВУ" required error={errors.licenseCategories as string}>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {LICENSE_CATEGORIES.map((cat) => {
                      const active = form.licenseCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`w-12 h-10 rounded-xl border-2 text-sm font-bold transition-all ${
                            active
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {errors.licenseCategories && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.licenseCategories}
                    </div>
                  )}
                </Field>
              </Section>

              {/* ── Трудоустройство ── */}
              <Section icon={<Calendar className="w-4 h-4" />} title="Трудоустройство">
                <Field label="Дата принятия на работу" required error={errors.joinDate}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={form.joinDate}
                      onChange={(e) => set("joinDate", e.target.value)}
                      className={cls(!!errors.joinDate) + " pl-9"}
                    />
                  </div>
                </Field>
              </Section>

              {/* ── Примечание ── */}
              <Section icon={<FileText className="w-4 h-4" />} title="Примечание">
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Дополнительная информация: особые навыки, ограничения, контактное лицо и т.д."
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
                <><User className="w-4 h-4" /> Добавить водителя</>
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
