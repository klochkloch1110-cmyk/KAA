import { useState } from "react";
import {
  User, Phone, Mail, Truck, TrendingUp, Calendar, Award,
  Plus, Hash, Weight, Shield, Star,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CreateDriverModal } from "./CreateDriverModal";
import { CreateVehicleModal } from "./CreateVehicleModal";
import type { CreatedDriver } from "./CreateDriverModal";
import type { CreatedVehicle } from "./CreateVehicleModal";

/* ── Типы ── */
interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories?: string[];
  vehicle: string | null;
  status: string;
  tripsThisMonth: number;
  earningsThisMonth: number;
  rating: number;
  joinDate: string;
}

interface Vehicle {
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
  status: string;
}

/* ── Мок-данные: водители ── */
const MOCK_DRIVERS: Driver[] = [
  {
    id: "DRV-001", name: "Иванов Иван Петрович",
    phone: "+7 (999) 123-45-67", email: "ivanov@avl84.ru",
    licenseNumber: "77 АВ 123456", licenseExpiry: "2027-08-15",
    licenseCategories: ["C", "CE"],
    vehicle: "А123КС 77", status: "active",
    tripsThisMonth: 78, earningsThisMonth: 117000, rating: 4.8,
    joinDate: "2024-01-15",
  },
  {
    id: "DRV-002", name: "Петров Алексей Сергеевич",
    phone: "+7 (999) 234-56-78", email: "petrov@avl84.ru",
    licenseNumber: "77 ВС 234567", licenseExpiry: "2026-12-20",
    licenseCategories: ["C"],
    vehicle: "В456ВО 77", status: "active",
    tripsThisMonth: 65, earningsThisMonth: 97500, rating: 4.6,
    joinDate: "2024-03-10",
  },
  {
    id: "DRV-003", name: "Сидоров Пётр Иванович",
    phone: "+7 (999) 345-67-89", email: "sidorov@avl84.ru",
    licenseNumber: "77 СД 345678", licenseExpiry: "2028-05-10",
    licenseCategories: ["C", "CE", "D"],
    vehicle: "С789НМ 77", status: "service",
    tripsThisMonth: 0, earningsThisMonth: 0, rating: 4.9,
    joinDate: "2023-06-20",
  },
  {
    id: "DRV-004", name: "Васильев Дмитрий Александрович",
    phone: "+7 (999) 456-78-90", email: "vasiliev@avl84.ru",
    licenseNumber: "77 ЕР 456789", licenseExpiry: "2027-03-15",
    licenseCategories: ["C"],
    vehicle: "Д012РТ 77", status: "active",
    tripsThisMonth: 52, earningsThisMonth: 78000, rating: 4.5,
    joinDate: "2024-05-01",
  },
  {
    id: "DRV-005", name: "Михайлов Сергей Петрович",
    phone: "+7 (999) 567-89-01", email: "mikhailov@avl84.ru",
    licenseNumber: "77 ЖК 567890", licenseExpiry: "2025-11-30",
    licenseCategories: ["C", "CE"],
    vehicle: null, status: "inactive",
    tripsThisMonth: 0, earningsThisMonth: 0, rating: 4.3,
    joinDate: "2023-09-12",
  },
];

/* ── Мок-данные: ТС ── */
const MOCK_VEHICLES: Vehicle[] = [
  { id: "VEH-001", plate: "А123КС 77", brand: "КАМАЗ", model: "6520", type: "самосвал", year: 2021, vin: "XTC652000L1234567", capacity: 20, bodyVolume: 14, assignedDriver: "Иванов И.П.", status: "active" },
  { id: "VEH-002", plate: "В456ВО 77", brand: "МАЗ", model: "5516", type: "самосвал", year: 2020, vin: "Y3M551600L7654321", capacity: 20, bodyVolume: 13, assignedDriver: "Петров А.С.", status: "active" },
  { id: "VEH-003", plate: "С789НМ 77", brand: "КАМАЗ", model: "65115", type: "самосвал", year: 2019, vin: "XTC651150K9876543", capacity: 15, bodyVolume: 10, assignedDriver: "Сидоров П.И.", status: "service" },
  { id: "VEH-004", plate: "Д012РТ 77", brand: "Volvo", model: "FH", type: "тягач", year: 2022, vin: "YV2RT40A1LA123456", capacity: 25, bodyVolume: null, assignedDriver: "Васильев Д.А.", status: "active" },
  { id: "VEH-005", plate: "Е234АО 77", brand: "Scania", model: "R500", type: "самосвал", year: 2023, vin: "XLER4X20005123456", capacity: 25, bodyVolume: 16, assignedDriver: "", status: "active" },
];

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:   { label: "Активен",        cls: "bg-green-500/10 text-green-600 border-green-400/30" },
  service:  { label: "На ТО",          cls: "bg-orange-500/10 text-orange-600 border-orange-400/30" },
  inactive: { label: "Неактивен",      cls: "bg-muted text-muted-foreground border-border" },
};

type Tab = "drivers" | "vehicles";

export function DriversView() {
  const [tab, setTab] = useState<Tab>("drivers");
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showCreateDriver, setShowCreateDriver] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);

  function handleDriverCreated(d: CreatedDriver) {
    setDrivers((prev) => [
      {
        id: d.id, name: d.name, phone: d.phone, email: d.email,
        licenseNumber: d.licenseNumber, licenseExpiry: d.licenseExpiry,
        licenseCategories: d.licenseCategories,
        vehicle: null, status: "active",
        tripsThisMonth: 0, earningsThisMonth: 0, rating: 5.0,
        joinDate: d.joinDate,
      },
      ...prev,
    ]);
  }

  function handleVehicleCreated(v: CreatedVehicle) {
    setVehicles((prev) => [
      {
        id: v.id, plate: v.plate, brand: v.brand, model: v.model,
        type: v.type, year: v.year, vin: v.vin,
        capacity: v.capacity, bodyVolume: v.bodyVolume,
        assignedDriver: v.assignedDriver, status: "active",
      },
      ...prev,
    ]);
  }

  const activeDrivers = drivers.filter((d) => d.status === "active").length;
  const totalTrips = drivers.reduce((s, d) => s + d.tripsThisMonth, 0);
  const totalEarnings = drivers.reduce((s, d) => s + d.earningsThisMonth, 0);
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;

  return (
    <div className="flex-1 overflow-auto bg-background">

      {/* ── Шапка ── */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Персонал и Транспорт</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Водители и транспортные средства</p>
            </div>
            <div className="flex items-center gap-2">
              {tab === "drivers" ? (
                <button
                  onClick={() => setShowCreateDriver(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Новый водитель
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateVehicle(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Новое ТС
                </button>
              )}
            </div>
          </div>

          {/* Табы */}
          <div className="flex border-b border-border -mb-px gap-1">
            <button
              onClick={() => setTab("drivers")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "drivers"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Водители
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === "drivers" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {drivers.length}
              </span>
            </button>
            <button
              onClick={() => setTab("vehicles")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === "vehicles"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck className="w-4 h-4" />
              Транспорт
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === "vehicles" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {vehicles.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">

        {/* ══════════ ВКЛАДКА: ВОДИТЕЛИ ══════════ */}
        {tab === "drivers" && (
          <>
            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<User className="w-5 h-5 text-primary" />} label="Всего водителей" value={String(drivers.length)} />
              <StatCard icon={<Truck className="w-5 h-5 text-green-600" />} label="На линии" value={String(activeDrivers)} accent="green" />
              <StatCard icon={<TrendingUp className="w-5 h-5 text-accent" />} label="Рейсов в месяц" value={String(totalTrips)} />
              <StatCard icon={<Award className="w-5 h-5 text-accent" />} label="Выплачено" value={`₽${(totalEarnings / 1000).toFixed(0)}k`} accent="accent" />
            </div>

            {/* Сетка водителей */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drivers.map((driver) => {
                const s = STATUS_LABEL[driver.status] ?? STATUS_LABEL.inactive;
                const licenseDate = new Date(driver.licenseExpiry);
                const expiringSoon = licenseDate < new Date(Date.now() + 90 * 86400000);
                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    {/* Шапка карточки */}
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                            {driver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <h3 className="font-bold text-card-foreground text-sm leading-tight">{driver.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{driver.id}</p>
                            {driver.licenseCategories && (
                              <div className="flex gap-1 mt-1">
                                {driver.licenseCategories.map((c) => (
                                  <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg border font-semibold ${s.cls}`}>{s.label}</span>
                      </div>
                    </div>

                    {/* Тело карточки */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-card-foreground">{driver.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        {driver.vehicle
                          ? <span className="text-primary font-mono font-semibold">{driver.vehicle}</span>
                          : <span className="italic text-muted-foreground">Не назначено</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className={`text-xs ${expiringSoon ? "text-orange-500 font-semibold" : "text-muted-foreground"}`}>
                          ВУ до {licenseDate.toLocaleDateString("ru-RU")}
                          {expiringSoon && " ⚠"}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Рейсов</p>
                          <p className="text-base font-bold text-card-foreground">{driver.tripsThisMonth}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Заработано</p>
                          <p className="text-base font-bold text-accent">₽{(driver.earningsThisMonth / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-base font-bold text-card-foreground">{driver.rating}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════ ВКЛАДКА: ТРАНСПОРТ ══════════ */}
        {tab === "vehicles" && (
          <>
            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Truck className="w-5 h-5 text-primary" />} label="Всего ТС" value={String(vehicles.length)} />
              <StatCard icon={<Truck className="w-5 h-5 text-green-600" />} label="На линии" value={String(activeVehicles)} accent="green" />
              <StatCard icon={<Weight className="w-5 h-5 text-accent" />} label="Ср. грузоподъёмность" value={`${(vehicles.reduce((s, v) => s + v.capacity, 0) / vehicles.length).toFixed(0)} т`} />
              <StatCard icon={<Hash className="w-5 h-5 text-muted-foreground" />} label="На ТО" value={String(vehicles.filter((v) => v.status === "service").length)} />
            </div>

            {/* Сетка ТС */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => {
                const s = STATUS_LABEL[v.status] ?? STATUS_LABEL.inactive;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    {/* Шапка */}
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xl font-bold font-mono text-primary tracking-wider">{v.plate}</p>
                          <p className="text-sm font-semibold text-card-foreground mt-0.5">{v.brand} {v.model}</p>
                          <p className="text-xs text-muted-foreground">{v.id} · {v.year} г.</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-lg border font-semibold ${s.cls}`}>{s.label}</span>
                      </div>
                    </div>

                    {/* Тело */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="w-3.5 h-3.5" />
                          Тип
                        </span>
                        <span className="font-semibold text-card-foreground capitalize">{v.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Weight className="w-3.5 h-3.5" />
                          Грузоподъёмность
                        </span>
                        <span className="font-semibold text-card-foreground">{v.capacity} тонн</span>
                      </div>
                      {v.bodyVolume != null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Hash className="w-3.5 h-3.5" />
                            Объём кузова
                          </span>
                          <span className="font-semibold text-card-foreground">{v.bodyVolume} м³</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-3.5 h-3.5" />
                          Водитель
                        </span>
                        {v.assignedDriver
                          ? <span className="font-semibold text-card-foreground text-xs">{v.assignedDriver}</span>
                          : <span className="italic text-muted-foreground text-xs">Не закреплён</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Детальная панель: Водитель ── */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {selectedDriver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-card-foreground">{selectedDriver.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedDriver.id}</p>
                  {selectedDriver.licenseCategories && (
                    <div className="flex gap-1 mt-1">
                      {selectedDriver.licenseCategories.map((c) => (
                        <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-xl text-muted-foreground">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock title="Контакты">
                  <InfoRow label="Телефон" value={selectedDriver.phone} />
                  <InfoRow label="Email" value={selectedDriver.email || "—"} />
                  <InfoRow label="ТС" value={selectedDriver.vehicle ?? "Не назначено"} mono />
                </InfoBlock>
                <InfoBlock title="ВУ">
                  <InfoRow label="Номер" value={selectedDriver.licenseNumber} mono />
                  <InfoRow label="Действителен до" value={new Date(selectedDriver.licenseExpiry).toLocaleDateString("ru-RU")} />
                  <InfoRow label="На работе с" value={new Date(selectedDriver.joinDate).toLocaleDateString("ru-RU")} />
                </InfoBlock>
              </div>
              <InfoBlock title="Показатели месяца">
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-background rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Рейсов</p>
                    <p className="text-2xl font-bold text-card-foreground">{selectedDriver.tripsThisMonth}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Заработано</p>
                    <p className="text-2xl font-bold text-accent">₽{selectedDriver.earningsThisMonth.toLocaleString("ru-RU")}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Рейтинг</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <p className="text-2xl font-bold text-card-foreground">{selectedDriver.rating}</p>
                    </div>
                  </div>
                </div>
              </InfoBlock>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button onClick={() => setSelectedDriver(null)} className="px-5 py-2.5 border border-border rounded-lg text-sm text-card-foreground hover:bg-muted transition-colors">Закрыть</button>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md text-sm">Редактировать</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Детальная панель: ТС ── */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between shrink-0">
              <div>
                <p className="text-2xl font-bold font-mono text-primary">{selectedVehicle.plate}</p>
                <p className="text-sm font-semibold text-card-foreground">{selectedVehicle.brand} {selectedVehicle.model} · {selectedVehicle.year} г.</p>
                <p className="text-xs text-muted-foreground">{selectedVehicle.id}</p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-xl text-muted-foreground">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <InfoBlock title="Характеристики">
                <InfoRow label="Тип" value={selectedVehicle.type} />
                <InfoRow label="Грузоподъёмность" value={`${selectedVehicle.capacity} тонн`} />
                {selectedVehicle.bodyVolume != null && <InfoRow label="Объём кузова" value={`${selectedVehicle.bodyVolume} м³`} />}
                {selectedVehicle.vin && <InfoRow label="VIN" value={selectedVehicle.vin} mono />}
              </InfoBlock>
              <InfoBlock title="Назначение">
                <InfoRow label="Закреплён" value={selectedVehicle.assignedDriver || "Не закреплён"} />
              </InfoBlock>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0">
              <button onClick={() => setSelectedVehicle(null)} className="px-5 py-2.5 border border-border rounded-lg text-sm text-card-foreground hover:bg-muted transition-colors">Закрыть</button>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md text-sm">Редактировать</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модалы создания ── */}
      {showCreateDriver && (
        <CreateDriverModal
          onClose={() => setShowCreateDriver(false)}
          onCreated={handleDriverCreated}
        />
      )}
      {showCreateVehicle && (
        <CreateVehicleModal
          onClose={() => setShowCreateVehicle(false)}
          onCreated={handleVehicleCreated}
        />
      )}
    </div>
  );
}

/* ── Вспомогательные компоненты ── */
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: "green" | "accent" }) {
  return (
    <div className={`rounded-xl border p-5 ${
      accent === "green" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
      : accent === "accent" ? "bg-accent/5 border-accent/20"
      : "bg-card border-border"
    }`}>
      <div className="flex items-center justify-between mb-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className={`text-2xl font-bold ${accent === "green" ? "text-green-700 dark:text-green-400" : accent === "accent" ? "text-accent" : "text-card-foreground"}`}>{value}</p>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-semibold text-card-foreground text-right truncate ${mono ? "font-mono text-primary" : ""}`}>{value}</span>
    </div>
  );
}
