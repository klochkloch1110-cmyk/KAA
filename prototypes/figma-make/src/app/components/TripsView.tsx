import { Search, Filter, AlertTriangle, CheckCircle2, Clock, Eye, FileImage, Download } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

interface Trip {
  id: string;
  orderId: string;
  orderCustomer: string;
  driver: string;
  vehicle: string;
  date: string;
  time: string;
  consignmentNoteDriver: string;
  consignmentNoteOCR: string | null;
  volumeDriver: number;
  volumeOCR: number | null;
  status: string;
  ocrStatus: string;
  photoUrl?: string;
}

const mockTrips: Trip[] = [
  {
    id: "TRP-001",
    orderId: "ORD-001",
    orderCustomer: "Стройком-М",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    date: "2026-05-21",
    time: "09:15",
    consignmentNoteDriver: "СН-00123",
    consignmentNoteOCR: "СН-00123",
    volumeDriver: 20,
    volumeOCR: 20,
    status: "verified",
    ocrStatus: "matched",
  },
  {
    id: "TRP-002",
    orderId: "ORD-001",
    orderCustomer: "Стройком-М",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    date: "2026-05-21",
    time: "11:30",
    consignmentNoteDriver: "СН-00124",
    consignmentNoteOCR: "СН-00124",
    volumeDriver: 19.5,
    volumeOCR: 20,
    status: "needs_review",
    ocrStatus: "mismatch",
  },
  {
    id: "TRP-003",
    orderId: "ORD-001",
    orderCustomer: "Стройком-М",
    driver: "Иванов И.П.",
    vehicle: "А123КС 77",
    date: "2026-05-21",
    time: "13:45",
    consignmentNoteDriver: "СН-00125",
    consignmentNoteOCR: null,
    volumeDriver: 20,
    volumeOCR: null,
    status: "submitted",
    ocrStatus: "pending",
  },
  {
    id: "TRP-004",
    orderId: "ORD-002",
    orderCustomer: "БетонСтрой",
    driver: "Петров А.С.",
    vehicle: "В456ВО 77",
    date: "2026-05-21",
    time: "10:20",
    consignmentNoteDriver: "СН-00128",
    consignmentNoteOCR: "СН-00126",
    volumeDriver: 25,
    volumeOCR: 25,
    status: "needs_review",
    ocrStatus: "mismatch",
  },
  {
    id: "TRP-005",
    orderId: "ORD-004",
    orderCustomer: "Дорстрой",
    driver: "Сидоров П.И.",
    vehicle: "С789НМ 77",
    date: "2026-05-20",
    time: "14:30",
    consignmentNoteDriver: "СН-00127",
    consignmentNoteOCR: "СН-00127",
    volumeDriver: 30,
    volumeOCR: 30,
    status: "verified",
    ocrStatus: "matched",
  },
];

export function TripsView() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesFilter = filter === "all" || trip.status === filter || trip.ocrStatus === filter;
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.consignmentNoteDriver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const needsReviewCount = mockTrips.filter((t) => t.status === "needs_review").length;
  const pendingOCRCount = mockTrips.filter((t) => t.ocrStatus === "pending").length;
  const verifiedCount = mockTrips.filter((t) => t.status === "verified").length;

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Рейсы</h1>
              <p className="text-sm text-muted-foreground mt-1">Управление и проверка рейсов</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по номеру, водителю или ТТН..."
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все ({mockTrips.length})
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
              Требует проверки ({needsReviewCount})
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "verified"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Проверено ({verifiedCount})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "pending"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Clock className="w-4 h-4" />
              Ожидание OCR ({pendingOCRCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">№ Рейса</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заказ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Водитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТС</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Дата/Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТТН (водитель)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ТТН (OCR)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Объём</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">OCR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrips.map((trip) => {
                  const hasOCRMismatch = trip.ocrStatus === "mismatch";
                  return (
                    <tr
                      key={trip.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        hasOCRMismatch ? "bg-orange-50/50 dark:bg-orange-950/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-primary">{trip.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-card-foreground">{trip.orderId}</p>
                          <p className="text-xs text-muted-foreground">{trip.orderCustomer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{trip.driver}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{trip.vehicle}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        <div>
                          <p>{new Date(trip.date).toLocaleDateString("ru-RU")}</p>
                          <p className="text-xs text-muted-foreground">{trip.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-card-foreground">{trip.consignmentNoteDriver}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {trip.consignmentNoteOCR ? (
                          <span
                            className={`font-mono ${
                              hasOCRMismatch ? "text-orange-600 font-semibold" : "text-card-foreground"
                            }`}
                          >
                            {trip.consignmentNoteOCR}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-card-foreground">{trip.volumeDriver} т</span>
                          {trip.volumeOCR !== null && trip.volumeOCR !== trip.volumeDriver && (
                            <span className="text-xs text-orange-600">OCR: {trip.volumeOCR} т</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trip.ocrStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTrip(trip)}
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

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Детали рейса {selectedTrip.id}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date(selectedTrip.date).toLocaleDateString("ru-RU")} в {selectedTrip.time}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Driver Data */}
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-5 border border-blue-200 dark:border-blue-900">
                    <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <FileImage className="w-5 h-5 text-blue-600" />
                      Данные водителя
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Номер ТТН:</span>
                        <span className="font-mono font-bold text-card-foreground text-lg">
                          {selectedTrip.consignmentNoteDriver}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Объём:</span>
                        <span className="font-bold text-card-foreground text-lg">{selectedTrip.volumeDriver} т</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <h3 className="font-semibold text-card-foreground mb-4">Информация о заказе</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Заказ:</span>
                        <span className="font-medium text-card-foreground">{selectedTrip.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Заказчик:</span>
                        <span className="font-medium text-card-foreground">{selectedTrip.orderCustomer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Водитель:</span>
                        <span className="font-medium text-card-foreground">{selectedTrip.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ТС:</span>
                        <span className="font-medium text-card-foreground">{selectedTrip.vehicle}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - OCR Data */}
                <div className="space-y-6">
                  <div
                    className={`rounded-lg p-5 border ${
                      selectedTrip.ocrStatus === "matched"
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                        : selectedTrip.ocrStatus === "mismatch"
                        ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                        : "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900"
                    }`}
                  >
                    <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      {selectedTrip.ocrStatus === "matched" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : selectedTrip.ocrStatus === "mismatch" ? (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                      Результат OCR
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Номер ТТН:</span>
                        <span
                          className={`font-mono font-bold text-lg ${
                            selectedTrip.ocrStatus === "mismatch" ? "text-orange-600" : "text-card-foreground"
                          }`}
                        >
                          {selectedTrip.consignmentNoteOCR || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Объём:</span>
                        <span
                          className={`font-bold text-lg ${
                            selectedTrip.volumeOCR !== selectedTrip.volumeDriver
                              ? "text-orange-600"
                              : "text-card-foreground"
                          }`}
                        >
                          {selectedTrip.volumeOCR !== null ? `${selectedTrip.volumeOCR} т` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Статус OCR:</span>
                        <StatusBadge status={selectedTrip.ocrStatus} />
                      </div>
                    </div>
                  </div>

                  {/* Photo Preview */}
                  <div className="bg-muted/30 rounded-lg p-5 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-card-foreground">Фото ТТН</h3>
                      <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        Скачать
                      </button>
                    </div>
                    <div className="bg-muted/50 rounded-lg aspect-[4/3] flex items-center justify-center border border-border">
                      <FileImage className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-5 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
              >
                Закрыть
              </button>
              {selectedTrip.status === "needs_review" && (
                <>
                  <button className="px-5 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Отклонить
                  </button>
                  <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Одобрить рейс
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
