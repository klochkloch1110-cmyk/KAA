import { useState, useRef } from "react";
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  ScanLine,
  Lock,
  User,
  Building2,
  Hash,
  Package,
  Trash2,
} from "lucide-react";

interface TripReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Данные активного заказа (в реальности пробрасываются через props или context) ── */
const ORDER = {
  number: "avl-0001/05/26",
  date: "23.05.2026",
  driver: "Иванов Иван Петрович",
  customer: "Стройком-М",
  from: "ООО «КарьерСтрой»",
  to: "ООО «Стройком-М»",
  material: "Песок",
  pointA: "Карьер №3, ул. Каменная 15",
  pointB: "Стройка Ленина 45",
  ratePerTrip: "₽1 500",
};

type OcrStatus = "idle" | "scanning" | "match" | "mismatch";

interface OcrResult {
  ttnStatus: OcrStatus;
  ttnRecognized: string;
  volumeStatus: OcrStatus;
  volumeRecognized: string;
}

export function TripReportModal({ isOpen, onClose }: TripReportModalProps) {
  const [ttnNumber, setTtnNumber] = useState("");
  const [volume, setVolume] = useState("");
  const [volumeUnit, setVolumeUnit] = useState<"tons" | "m3">("tons");
  const [photo, setPhoto] = useState<string | null>(null);
  const [ocr, setOcr] = useState<OcrResult>({
    ttnStatus: "idle",
    ttnRecognized: "",
    volumeStatus: "idle",
    volumeRecognized: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      runOcr();
    };
    reader.readAsDataURL(file);
  }

  function runOcr() {
    /* Сброс и запуск сканирования */
    setOcr({ ttnStatus: "scanning", ttnRecognized: "", volumeStatus: "scanning", volumeRecognized: "" });

    setTimeout(() => {
      /* Симуляция OCR: иногда данные совпадают, иногда нет */
      const ttnOk = Math.random() > 0.35;
      const volOk = Math.random() > 0.35;

      const recognizedTtn = ttnOk
        ? ttnNumber || "СН-00126"
        : `СН-00${Math.floor(Math.random() * 900) + 100}`;

      const enteredVol = parseFloat(volume) || 20;
      const recognizedVol = volOk
        ? String(enteredVol)
        : String(+(enteredVol + (Math.random() > 0.5 ? 1.5 : -1.5)).toFixed(1));

      const finalTtnMatch = ttnNumber ? recognizedTtn === ttnNumber : false;
      const finalVolMatch = volume ? recognizedVol === volume : false;

      setOcr({
        ttnStatus: finalTtnMatch ? "match" : "mismatch",
        ttnRecognized: recognizedTtn,
        volumeStatus: finalVolMatch ? "match" : "mismatch",
        volumeRecognized: recognizedVol,
      });
    }, 2400);
  }

  async function handleSubmit() {
    if (!ttnNumber.trim() || !volume) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 2000);
  }

  function handleClose() {
    if (submitting) return;
    setTtnNumber("");
    setVolume("");
    setVolumeUnit("tons");
    setPhoto(null);
    setOcr({ ttnStatus: "idle", ttnRecognized: "", volumeStatus: "idle", volumeRecognized: "" });
    setDone(false);
    onClose();
  }

  const canSubmit = ttnNumber.trim() && volume && !submitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-primary to-accent px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Отчёт о рейсе</h2>
              <p className="text-xs text-white/70">{ORDER.number}</p>
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
            <h3 className="text-xl font-bold text-foreground mb-2">Отчёт отправлен!</h3>
            <p className="text-sm text-muted-foreground mb-4">Данные сохранены и переданы диспетчеру</p>
            {(ocr.ttnStatus === "mismatch" || ocr.volumeStatus === "mismatch") && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 w-full max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Расхождение по OCR</p>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  Руководитель проверит данные в общем отчёте
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* ── 1. Автозаполненные поля ── */}
            <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/50 border-b border-border flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Данные заявки — заполнены автоматически
                </p>
              </div>
              <div className="divide-y divide-border">
                <AutoRow icon={<Hash className="w-3.5 h-3.5" />} label="Дата и номер заявки" value={`${ORDER.date} · ${ORDER.number}`} accent />
                <AutoRow icon={<User className="w-3.5 h-3.5" />} label="ФИО водителя" value={ORDER.driver} />
                <AutoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Заказчик" value={ORDER.customer} />
                <AutoRow icon={<Building2 className="w-3.5 h-3.5" />} label="От кого" value={ORDER.from} />
                <AutoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Кому" value={ORDER.to} />
              </div>
            </div>

            {/* ── Разделитель ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <p className="text-xs text-muted-foreground font-medium">Заполняется водителем</p>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* ── 2. Номер ТТН ── */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Номер ТТН <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={ttnNumber}
                onChange={(e) => {
                  setTtnNumber(e.target.value);
                  if (photo) setOcr((p) => ({ ...p, ttnStatus: "idle", ttnRecognized: "" }));
                }}
                placeholder="Например: СН-00126"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition-all"
              />
              {/* OCR TTN result */}
              <OcrBadge
                status={ocr.ttnStatus}
                label="ТТН"
                entered={ttnNumber}
                recognized={ocr.ttnRecognized}
              />
            </div>

            {/* ── 3. Объём ── */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Объём перевезённого груза <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={volume}
                  onChange={(e) => {
                    setVolume(e.target.value);
                    if (photo) setOcr((p) => ({ ...p, volumeStatus: "idle", volumeRecognized: "" }));
                  }}
                  placeholder="0.0"
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base transition-all"
                />
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setVolumeUnit("tons")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors ${
                      volumeUnit === "tons"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    тонн
                  </button>
                  <div className="w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => setVolumeUnit("m3")}
                    className={`px-4 py-3 text-sm font-semibold transition-colors ${
                      volumeUnit === "m3"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    м³
                  </button>
                </div>
              </div>
              {/* OCR Volume result */}
              <OcrBadge
                status={ocr.volumeStatus}
                label="Объём"
                entered={volume ? `${volume} ${volumeUnit === "tons" ? "тонн" : "м³"}` : ""}
                recognized={ocr.volumeRecognized ? `${ocr.volumeRecognized} ${volumeUnit === "tons" ? "тонн" : "м³"}` : ""}
              />
            </div>

            {/* ── 4. Фото ТТН + OCR ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">
                  Фото ТТН
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(для OCR-сверки)</span>
                </label>
                {photo && (
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setOcr({ ttnStatus: "idle", ttnRecognized: "", volumeStatus: "idle", volumeRecognized: "" });
                    }}
                    className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Удалить
                  </button>
                )}
              </div>

              {/* OCR info banner */}
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <ScanLine className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  После загрузки фото система автоматически сверит номер ТТН и объём.{" "}
                  <strong>Расхождение не блокирует отчёт</strong> — руководитель проверит данные позже.
                </p>
              </div>

              {photo ? (
                <div className="space-y-2">
                  {/* Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={photo} alt="Фото ТТН" className="w-full h-52 object-cover" />
                    {ocr.ttnStatus === "scanning" && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                        <div className="relative w-full px-8">
                          <div className="h-0.5 bg-primary/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-scan-line" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                          <ScanLine className="w-4 h-4 animate-pulse text-primary" />
                          OCR-сканирование...
                        </div>
                      </div>
                    )}
                    {(ocr.ttnStatus === "match" || ocr.ttnStatus === "mismatch") && (
                      <div className="absolute top-2 right-2">
                        <OcrPhotoBadge matched={ocr.ttnStatus === "match" && ocr.volumeStatus === "match"} />
                      </div>
                    )}
                  </div>
                  {/* Retake */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="border border-border rounded-xl p-3 text-center cursor-pointer hover:bg-muted transition-colors">
                      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                      <Camera className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs font-medium text-foreground">Переснять</p>
                    </label>
                    <label className="border border-border rounded-xl p-3 text-center cursor-pointer hover:bg-muted transition-colors">
                      <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      <Upload className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-xs font-medium text-foreground">Другое фото</p>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                    <Camera className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">Камера</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Сделать фото</p>
                  </label>
                  <label className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">Галерея</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Из файлов</p>
                  </label>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex-shrink-0 flex gap-3">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-5 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Отправить отчёт
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-scan-line {
          animation: scan-line 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ── Компонент: строка автозаполненного поля ── */
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
      <span className={`text-xs font-semibold text-right truncate max-w-[55%] ${accent ? "text-primary font-mono" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

/* ── Компонент: статус OCR под полем ввода ── */
function OcrBadge({
  status,
  label,
  entered,
  recognized,
}: {
  status: OcrStatus;
  label: string;
  entered: string;
  recognized: string;
}) {
  if (status === "idle") return null;

  if (status === "scanning") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        <ScanLine className="w-3.5 h-3.5" />
        OCR сканирует документ...
      </div>
    );
  }

  if (status === "match") {
    return (
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-green-700 dark:text-green-400">OCR: данные совпадают</span>
          <span className="text-green-600 dark:text-green-500"> — распознано «{recognized}»</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
      <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="text-xs space-y-0.5">
        <p className="font-semibold text-orange-700 dark:text-orange-400">OCR: расхождение — руководитель проверит</p>
        <p className="text-orange-600 dark:text-orange-300">
          Введено: <strong>{entered || "—"}</strong> · OCR распознал: <strong>{recognized}</strong>
        </p>
      </div>
    </div>
  );
}

/* ── Компонент: бейдж поверх фото ── */
function OcrPhotoBadge({ matched }: { matched: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${
        matched
          ? "bg-green-500/90 text-white"
          : "bg-orange-500/90 text-white"
      }`}
    >
      {matched ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          OCR: ОК
        </>
      ) : (
        <>
          <AlertTriangle className="w-3.5 h-3.5" />
          OCR: проверить
        </>
      )}
    </div>
  );
}
