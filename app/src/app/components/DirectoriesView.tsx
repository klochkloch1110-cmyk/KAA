import { useMemo, useState } from "react";
import { BookOpen, Building2, CheckCircle2, Loader2, MapPin, Package, Plus, Search, User2, X } from "lucide-react";
import { useAppStore } from "../store/AppStore";
import type { DictionaryKind } from "../store/AppStore";
import { useAuth } from "../auth/AuthProvider";

const SECTIONS: { kind: DictionaryKind; title: string; description: string; icon: typeof User2; placeholder: string; subtitleLabel: string; subtitlePlaceholder: string }[] = [
  { kind: "customers", title: "Заказчики", description: "Клиенты, для которых создаются заявки", icon: User2, placeholder: "ООО «Стройком-М»", subtitleLabel: "Примечание", subtitlePlaceholder: "ИНН, контакт или комментарий" },
  { kind: "organizations", title: "Организации", description: "Отправители и получатели груза", icon: Building2, placeholder: "ООО «КарьерСтрой»", subtitleLabel: "Адрес", subtitlePlaceholder: "Адрес или роль организации" },
  { kind: "materials", title: "Материалы", description: "Грузы и единицы измерения", icon: Package, placeholder: "Песок", subtitleLabel: "Единица", subtitlePlaceholder: "тонн или м³" },
  { kind: "locations", title: "Локации", description: "Точки погрузки и разгрузки", icon: MapPin, placeholder: "Карьер №3", subtitleLabel: "Адрес", subtitlePlaceholder: "ул. Каменная 15" },
];

export function DirectoriesView() {
  const { user } = useAuth();
  const { dictionaries, createDictionaryItem, canManageDictionaries } = useAppStore();
  const canManage = canManageDictionaries(user?.role);
  const [activeKind, setActiveKind] = useState<DictionaryKind>("customers");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSection = SECTIONS.find((section) => section.kind === activeKind) ?? SECTIONS[0];
  const Icon = activeSection.icon;

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return dictionaries
      .filter((item) => item.kind === activeKind)
      .filter((item) => !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery) || item.subtitle?.toLowerCase().includes(normalizedQuery));
  }, [activeKind, dictionaries, query]);

  async function handleCreate() {
    if (!canManage) {
      setError("Редактировать справочники может только руководитель или оператор.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Укажите название");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await createDictionaryItem({ kind: activeKind, name: trimmedName, subtitle: subtitle.trim() || undefined });
      setName("");
      setSubtitle("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось добавить значение");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="metal-panel rounded-2xl px-6 py-5 mb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/80">Операционные данные</div>
            <h1 className="text-2xl font-bold text-card-foreground">Справочники</h1>
            <p className="text-sm text-muted-foreground mt-1">Заказчики, организации, материалы и точки для быстрого создания заявок</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по справочнику..."
              className="w-full pl-9 pr-9 py-2.5 bg-input-background border border-border rounded-full text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35 focus:border-primary/45 outline-none transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            const count = dictionaries.filter((item) => item.kind === section.kind).length;
            const isActive = section.kind === activeKind;
            return (
              <button
                key={section.kind}
                onClick={() => { setActiveKind(section.kind); setError(null); }}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${isActive ? "border-primary/35 bg-primary/10 shadow-[0_12px_24px_rgba(47,147,215,0.12)]" : "border-border bg-card hover:bg-secondary/60"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <SectionIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-card-foreground">{section.title}</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 min-w-0">
          <div className="metal-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-card-foreground">{activeSection.title}</h2>
                <p className="text-xs text-muted-foreground">{visibleItems.length} значений</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {visibleItems.length === 0 ? (
                <div className="px-5 py-12 text-center text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-60" />
                  <p className="font-medium text-card-foreground">Нет значений</p>
                  <p className="text-sm mt-1">Добавьте первое значение справа</p>
                </div>
              ) : visibleItems.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-secondary/35 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground truncate">{item.name}</p>
                    {item.subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{item.subtitle}</p>}
                  </div>
                  {item.isActive !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full border ${item.isActive ? "bg-green-500/10 text-green-600 border-green-400/30" : "bg-muted text-muted-foreground border-border"}`}>
                      {item.isActive ? "Активен" : "Отключен"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="metal-panel rounded-2xl p-5 h-fit sticky top-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-card-foreground">Добавить значение</h3>
                <p className="text-xs text-muted-foreground">{canManage ? activeSection.title : "Только просмотр"}</p>
              </div>
            </div>

            {!canManage && (
              <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-700">
                У вашей роли нет прав на изменение справочников. Значения доступны только для просмотра.
              </div>
            )}

            <div className="space-y-4">
              {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
              <Field label="Название">
                <input
                  value={name}
                  onChange={(event) => { setName(event.target.value); setError(null); }}
                  placeholder={activeSection.placeholder}
                  disabled={!canManage}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </Field>
              <Field label={activeSection.subtitleLabel}>
                <input
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  placeholder={activeSection.subtitlePlaceholder}
                  disabled={!canManage}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </Field>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !canManage}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Сохранение...</> : <><CheckCircle2 className="w-4 h-4" /> Добавить</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
