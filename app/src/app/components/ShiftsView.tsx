import { Clock, User, Truck, CheckCircle2, AlertTriangle, Eye, FileText, Package } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";
import { useAppStore } from "../store/AppStore";

interface Shift {
  id: string;
  driver: string;
  vehicle: string;
  startTime: string;
  endTime: string | null;
  date: string;
  status: "open" | "submitted" | "approved" | "needs_review";
  tripsCount: number;
  mileageStart: number;
  mileageEnd: number | null;
  fuelStart: number;
  fuelEnd: number | null;
  totalVolume: number;
  earnings: number;
}

export function ShiftsView() {
  const { shifts, trips, updateShiftStatus } = useAppStore();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const sourceShifts = shifts;
  const selectedShiftTrips = selectedShift
    ? trips.filter((trip) => (
        trip.shiftId === selectedShift.id ||
        (!trip.shiftId && trip.driver === selectedShift.driver && trip.date === selectedShift.date)
      ))
    : [];

  async function handleShiftStatus(status: Shift["status"]) {
    if (!selectedShift) return;
    try {
      await updateShiftStatus(selectedShift.id, status);
      setSelectedShift({ ...selectedShift, status });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось изменить статус смены");
    }
  }

  function displayShiftId(id: string) {
    return id.length > 12 ? id.slice(0, 8) : id;
  }

  const filteredShifts = sourceShifts.filter((shift) => {
    if (filter === "all") return true;
    return shift.status === filter;
  });

  const openShifts = sourceShifts.filter((s) => s.status === "open").length;
  const needsReview = sourceShifts.filter((s) => s.status === "needs_review").length;

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
              Все ({sourceShifts.length})
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Объём</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Пробег</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заправка</th>
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
                      <td className="px-6 py-4 text-sm font-medium text-primary">{displayShiftId(shift.id)}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {new Date(shift.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.driver}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.vehicle}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{duration}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.tripsCount}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{shift.totalVolume.toLocaleString("ru-RU")} т</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {mileage !== null ? `${mileage} км` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {shift.fuelEnd !== null ? `${shift.fuelEnd.toLocaleString("ru-RU")} л` : "—"}
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
                <h2 className="text-xl font-bold text-card-foreground">Смена {displayShiftId(selectedShift.id)}</h2>
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
                        <span className="text-sm text-muted-foreground">Общий объём:</span>
                        <span className="text-sm font-medium text-card-foreground">{selectedShift.totalVolume.toLocaleString("ru-RU")} т</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Заправка:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {selectedShift.fuelEnd !== null ? `${selectedShift.fuelEnd.toLocaleString("ru-RU")} л` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Заработано:</span>
                        <span className="text-sm font-bold text-accent">₽{selectedShift.earnings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Средний доход:</span>
                        <span className="text-sm font-medium text-card-foreground">
                          {selectedShift.tripsCount > 0
                            ? `₽${Math.round(selectedShift.earnings / selectedShift.tripsCount).toLocaleString("ru-RU")} / рейс`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-card-foreground">Рейсы смены</h3>
                    <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {selectedShiftTrips.length}
                    </span>
                  </div>
                  {selectedShiftTrips.length > 0 ? (
                    <div className="divide-y divide-border">
                      {selectedShiftTrips.map((trip) => (
                        <div key={trip.id} className="px-5 py-3 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 md:items-center">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-card-foreground truncate">{trip.orderNumber} · {trip.orderCustomer}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">ТТН {trip.consignmentNoteDriver} · {trip.time}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-card-foreground">
                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                            {trip.volumeDriver.toLocaleString("ru-RU")} т
                          </div>
                          <StatusBadge status={trip.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-5 py-6 text-sm text-muted-foreground text-center">Рейсов по этой смене пока нет.</p>
                  )}
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
                <button
                  onClick={() => void handleShiftStatus("approved")}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                  Одобрить смену
                </button>
              )}
              {selectedShift.status === "submitted" && (
                <button
                  onClick={() => void handleShiftStatus("needs_review")}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                  Вернуть на проверку
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
