import { Clock, User, Truck, CheckCircle2, AlertTriangle, Eye, Calendar } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface Shift {
  id: string;
  driver: string;
  vehicle: string;
  startTime: string;
  endTime: string | null;
  date: string;
  status: string;
  tripsCount: number;
  mileageStart: number;
  mileageEnd: number | null;
  fuelStart: number;
  fuelEnd: number | null;
  earnings: number;
}

const mockShifts: Shift[] = [
  {
    id: "SHF-001",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    startTime: "08:00",
    endTime: null,
    date: "2026-05-21",
    status: "open",
    tripsCount: 3,
    mileageStart: 152340,
    mileageEnd: null,
    fuelStart: 180,
    fuelEnd: null,
    earnings: 4500,
  },
  {
    id: "SHF-002",
    driver: "Петров А.С.",
    vehicle: "В456ВО 77",
    startTime: "07:30",
    endTime: null,
    date: "2026-05-21",
    status: "open",
    tripsCount: 1,
    mileageStart: 98765,
    mileageEnd: null,
    fuelStart: 200,
    fuelEnd: null,
    earnings: 1800,
  },
  {
    id: "SHF-003",
    driver: "Сидоров П.И.",
    vehicle: "С789НМ 77",
    startTime: "08:30",
    endTime: "17:45",
    date: "2026-05-20",
    status: "submitted",
    tripsCount: 6,
    mileageStart: 187543,
    mileageEnd: 187723,
    fuelStart: 150,
    fuelEnd: 95,
    earnings: 12000,
  },
  {
    id: "SHF-004",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    startTime: "08:15",
    endTime: "18:00",
    date: "2026-05-20",
    status: "approved",
    tripsCount: 5,
    mileageStart: 152140,
    mileageEnd: 152340,
    fuelStart: 250,
    fuelEnd: 180,
    earnings: 7500,
  },
  {
    id: "SHF-005",
    driver: "Петров А.С.",
    vehicle: "В456ВО 77",
    startTime: "07:45",
    endTime: "16:30",
    date: "2026-05-19",
    status: "needs_review",
    tripsCount: 4,
    mileageStart: 98565,
    mileageEnd: 98765,
    fuelStart: 300,
    fuelEnd: 200,
    earnings: 7200,
  },
];

export function ShiftsView() {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredShifts = mockShifts.filter((shift) => {
    if (filter === "all") return true;
    return shift.status === filter;
  });

  const openShifts = mockShifts.filter((s) => s.status === "open").length;
  const needsReview = mockShifts.filter((s) => s.status === "needs_review").length;

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Смены</h1>
              <p className="text-sm text-muted-foreground mt-1">Учёт рабочих смен водителей</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все ({mockShifts.length})
            </button>
            <button
              onClick={() => setFilter("open")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "open"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Clock className="w-4 h-4" />
              Открыты ({openShifts})
            </button>
            <button
              onClick={() => setFilter("submitted")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "submitted"
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Отправлены
            </button>
            <button
              onClick={() => setFilter("needs_review")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "needs_review"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Требует проверки ({needsReview})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "approved"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Одобрены
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">№ Смены</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Водитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТС</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Рейсов</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Пробег</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заработано</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredShifts.map((shift) => {
                  const mileage = shift.mileageEnd ? shift.mileageEnd - shift.mileageStart : null;
                  const duration = shift.endTime
                    ? `${shift.startTime} - ${shift.endTime}`
                    : `${shift.startTime} (в работе)`;

                  return (
                    <tr key={shift.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-primary">{shift.id}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {new Date(shift.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.driver}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.vehicle}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{duration}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.tripsCount}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {mileage !== null ? `${mileage} км` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent">₽{shift.earnings.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={shift.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedShift(shift)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Смена {selectedShift.id}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedShift.driver} • {new Date(selectedShift.date).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedShift.status} />
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">₽{selectedShift.earnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Заработано</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Водитель и ТС
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Водитель:</span>
                        <span className="text-sm font-medium text-card-foreground">{selectedShift.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ТС:</span>
                        <span className="text-sm font-medium text-card-foreground">{selectedShift.vehicle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      Время работы
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Начало:</span>
                        <span className="text-sm font-medium text-card-foreground">{selectedShift.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Окончание:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {selectedShift.endTime || <span className="italic">В работе</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-600" />
                      Пробег
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Начало смены:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {selectedShift.mileageStart.toLocaleString()} км
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Конец смены:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {selectedShift.mileageEnd
                            ? `${selectedShift.mileageEnd.toLocaleString()} км`
                            : "—"}
                        </span>
                      </div>
                      {selectedShift.mileageEnd && (
                        <div className="pt-3 border-t border-border">
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-card-foreground">Пройдено:</span>
                            <span className="text-sm font-bold text-primary">
                              {(selectedShift.mileageEnd - selectedShift.mileageStart).toLocaleString()} км
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Рейсы и заработок</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Рейсов:</span>
                        <span className="text-sm font-medium text-card-foreground">{selectedShift.tripsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Заработано:</span>
                        <span className="text-sm font-bold text-accent">₽{selectedShift.earnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Средний доход:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          ₽{Math.round(selectedShift.earnings / selectedShift.tripsCount).toLocaleString()} / рейс
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedShift(null)}
                className="px-5 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
              >
                Закрыть
              </button>
              {selectedShift.status === "submitted" && (
                <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md">
                  Одобрить смену
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
