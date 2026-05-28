import { Fuel, TrendingUp, Calendar, Search, Filter, Plus, Truck, DollarSign } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

interface FuelRecord {
  id: string;
  date: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  fuelType: string;
  station: string;
  receiptNumber?: string;
  verified: boolean;
}

const mockFuelRecords: FuelRecord[] = [
  {
    id: "FUEL-001",
    date: "2026-05-21T09:30:00",
    vehicleId: "VEH-001",
    vehiclePlate: "А123КС 77",
    driverName: "Иванов И.П.",
    liters: 180,
    pricePerLiter: 52.5,
    totalCost: 9450,
    mileage: 152340,
    fuelType: "ДТ",
    station: "Роснефть №45",
    receiptNumber: "R-00012345",
    verified: true,
  },
  {
    id: "FUEL-002",
    date: "2026-05-20T14:15:00",
    vehicleId: "VEH-002",
    vehiclePlate: "В456МН 77",
    driverName: "Петров А.С.",
    liters: 200,
    pricePerLiter: 52.0,
    totalCost: 10400,
    mileage: 98560,
    fuelType: "ДТ",
    station: "Лукойл №12",
    receiptNumber: "L-98765",
    verified: true,
  },
  {
    id: "FUEL-003",
    date: "2026-05-20T08:00:00",
    vehicleId: "VEH-003",
    vehiclePlate: "С789ТР 77",
    driverName: "Сидоров М.К.",
    liters: 175,
    pricePerLiter: 51.8,
    totalCost: 9065,
    mileage: 145200,
    fuelType: "ДТ",
    station: "Газпром №8",
    verified: false,
  },
  {
    id: "FUEL-004",
    date: "2026-05-19T16:45:00",
    vehicleId: "VEH-001",
    vehiclePlate: "А123КС 77",
    driverName: "Иванов И.П.",
    liters: 190,
    pricePerLiter: 52.3,
    totalCost: 9937,
    mileage: 151890,
    fuelType: "ДТ",
    station: "Роснефть №45",
    receiptNumber: "R-00012210",
    verified: true,
  },
];

const statistics = {
  totalLiters: 745,
  totalCost: 38852,
  avgPricePerLiter: 52.15,
  avgConsumption: 28.5,
};

export function FuelView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);

  const filteredRecords = mockFuelRecords.filter((record) => {
    const matchesSearch =
      record.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.station.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && record.verified) ||
      (filterVerified === "unverified" && !record.verified);

    return matchesSearch && matchesVerified;
  });

  return (
    <div className="flex-1 overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Топливо</h1>
            <p className="text-sm text-muted-foreground mt-1">Учёт заправок и расхода топлива</p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить заправку
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Fuel className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего литров</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.totalLiters}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Общая стоимость</p>
                <p className="text-xl font-bold text-card-foreground">₽{statistics.totalCost.toLocaleString("ru-RU")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Средняя цена за литр</p>
                <p className="text-xl font-bold text-card-foreground">₽{statistics.avgPricePerLiter.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Средний расход (л/100км)</p>
                <p className="text-xl font-bold text-card-foreground">{statistics.avgConsumption}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border-b border-border px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по номеру, водителю, АЗС..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Verification Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterVerified("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterVerified("verified")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === "verified"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Проверено
            </button>
            <button
              onClick={() => setFilterVerified("unverified")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVerified === "unverified"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Не проверено
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Дата</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Автомобиль</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Водитель</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Литры</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Сумма</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">АЗС</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">
                        {new Date(record.date).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{record.vehiclePlate}</p>
                      <p className="text-xs text-muted-foreground">{record.fuelType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{record.driverName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-card-foreground">{record.liters} л</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-accent">₽{record.totalCost.toLocaleString("ru-RU")}</p>
                      <p className="text-xs text-muted-foreground">₽{record.pricePerLiter}/л</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-card-foreground">{record.station}</p>
                  </td>
                  <td className="px-6 py-4">
                    {record.verified ? (
                      <StatusBadge status="verified" />
                    ) : (
                      <StatusBadge status="needs_review" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Заправка {selectedRecord.id}</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm opacity-90">
                {new Date(selectedRecord.date).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle and Driver */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Автомобиль</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Водитель</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.driverName}</p>
                </div>
              </div>

              {/* Fuel Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Тип топлива</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedRecord.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Количество</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedRecord.liters} л</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Цена за литр</span>
                  <span className="text-sm font-medium text-card-foreground">₽{selectedRecord.pricePerLiter}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Общая стоимость</span>
                  <span className="text-lg font-bold text-accent">₽{selectedRecord.totalCost.toLocaleString("ru-RU")}</span>
                </div>
              </div>

              {/* Station and Receipt */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">АЗС</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.station}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Номер чека</p>
                  <p className="font-medium text-card-foreground">{selectedRecord.receiptNumber || "—"}</p>
                </div>
              </div>

              {/* Mileage */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Пробег на момент заправки</p>
                <p className="font-medium text-card-foreground">{selectedRecord.mileage.toLocaleString("ru-RU")} км</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Статус проверки</p>
                {selectedRecord.verified ? (
                  <StatusBadge status="verified" />
                ) : (
                  <StatusBadge status="needs_review" />
                )}
              </div>

              {/* Actions */}
              {!selectedRecord.verified && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                    Подтвердить
                  </button>
                  <button className="flex-1 bg-destructive text-destructive-foreground rounded-lg py-3 font-medium hover:opacity-90 transition-opacity">
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
