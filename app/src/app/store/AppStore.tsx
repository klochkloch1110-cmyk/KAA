import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { operationsRepository } from "../repositories/operationsRepository";
import { getSupabaseClient } from "../services/supabaseClient";

export type OrderStatus = "draft" | "assigned" | "in_progress" | "completed" | "archived";

export interface AssignedDriver {
  driverId?: string;
  vehicleId?: string;
  name: string;
  vehicle: string;
  vehicleType: string;
  phone: string;
}

export interface AppOrder {
  number: string;
  date: string;
  customer: string;
  from: string;
  to: string;
  material: string;
  volume: number;
  volumeUnit: string;
  pointA: string;
  pointB: string;
  ratePerTrip: number;
  clientRate?: number;
  clientRateUnit?: "тонн" | "м³" | "час";
  drivers: AssignedDriver[];
  tripsCompleted: number;
  tripsTotal: number;
  status: OrderStatus;
  note?: string;
  ocrIssue?: boolean;
}

export interface CreateOrderInput {
  number: string;
  date: string;
  customer: string;
  from: string;
  to: string;
  material: string;
  volume: number | null;
  volumeUnit: string;
  pointA: string;
  pointB: string;
  ratePerTrip: number;
  clientRate: number;
  clientRateUnit: "тонн" | "м³" | "час";
  note?: string;
}

export interface CreateDriverInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories: string[];
  employmentDate: string;
  note?: string;
}

export interface AppTrip {
  id: string;
  driverId?: string;
  vehicleId?: string;
  shiftId?: string;
  orderNumber: string;
  orderCustomer: string;
  driver: string;
  vehicle: string;
  date: string;
  time: string;
  consignmentNoteDriver: string;
  consignmentNoteOCR: string | null;
  volumeDriver: number;
  volumeOCR: number | null;
  status: "submitted" | "verified" | "needs_review";
  ocrStatus: "not_required" | "pending" | "matched" | "mismatch";
  hasPhoto: boolean;
}

export interface SubmitTripInput {
  id: string;
  orderNumber: string;
  time: string;
  consignmentNote: string;
  volume: number;
  volumeUnit: "tons" | "m3";
  hasPhoto: boolean;
  hasOcrMismatch: boolean;
  ocrChecked?: boolean;
  photoDataUrl?: string;
}

export interface AppDocument {
  id: string;
  type: string;
  tripId: string;
  orderId: string;
  driver: string;
  vehicle: string;
  customer: string;
  consignmentNote: string;
  date: string;
  uploadedAt: string;
  ocrStatus: string;
  fileUrl?: string;
}

export interface AppShift {
  id: string;
  driverId?: string;
  vehicleId?: string;
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

export interface AppDriver {
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

export interface AppVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: string;
  year: number;
  vin: string;
  capacity: number;
  bodyVolume: number | null;
  currentOdometer: number;
  assignedDriver: string;
  status: string;
}

export interface CloseShiftInput {
  closingOdometer: number;
  fuelFilledLiters?: number;
}

export interface OpenShiftInput {
  driverId?: string;
  driverName: string;
  vehicleId?: string;
  vehiclePlate?: string;
}

interface AppStoreValue {
  dataMode: "mock" | "supabase";
  orders: AppOrder[];
  trips: AppTrip[];
  documents: AppDocument[];
  shifts: AppShift[];
  drivers: AppDriver[];
  vehicles: AppVehicle[];
  createOrder: (order: CreateOrderInput) => Promise<void>;
  createDriver: (driver: CreateDriverInput) => Promise<void>;
  assignDrivers: (orderNumber: string, drivers: AssignedDriver[]) => Promise<void> | void;
  advanceOrderStatus: (orderNumber: string) => Promise<void> | void;
  openShift: (input: OpenShiftInput) => Promise<void>;
  updateShiftStatus: (shiftId: string, status: AppShift["status"]) => Promise<void>;
  submitTripReport: (trip: SubmitTripInput) => Promise<void>;
  closeShift: (input: CloseShiftInput) => Promise<void>;
  getDriverOrders: (driverName: string, driverId?: string) => AppOrder[];
  getOrderTrips: (orderNumber: string) => AppTrip[];
}

const DRIVER_NAME = "Иванов Иван Петрович";
const DRIVER_SHORT_NAME = "Иванов И.П.";
const DRIVER_VEHICLE = "А123КС 77";

const initialOrders: AppOrder[] = [
  {
    number: "avl-0001/05/26", date: "23.05.2026",
    customer: "Стройком-М", from: "ООО «КарьерСтрой»", to: "ООО «Стройком-М»",
    material: "Песок", volume: 20, volumeUnit: "тонн",
    pointA: "Карьер №3, ул. Каменная 15", pointB: "Стройка Ленина 45, котлован",
    ratePerTrip: 1500, clientRate: 1200, clientRateUnit: "тонн",
    drivers: [{ name: DRIVER_NAME, vehicle: DRIVER_VEHICLE, vehicleType: "КАМАЗ-6520 (20 т)", phone: "+7 (905) 123-45-67" }],
    tripsCompleted: 2, tripsTotal: 5, status: "in_progress",
    note: "Срочно! Сдача объекта 25 мая.",
  },
  {
    number: "avl-0002/05/26", date: "23.05.2026",
    customer: "БетонСтрой", from: "ООО «КарьерСтрой»", to: "ООО «БетонСтрой»",
    material: "Щебень", volume: 18, volumeUnit: "тонн",
    pointA: "Карьер №1, Промзона", pointB: "Промзона, участок 12",
    ratePerTrip: 1800, clientRate: 980, clientRateUnit: "тонн",
    drivers: [{ name: "Петров Алексей Сергеевич", vehicle: "В456ВО 77", vehicleType: "МАЗ-5516 (20 т)", phone: "+7 (916) 234-56-78" }],
    tripsCompleted: 0, tripsTotal: 4, status: "assigned",
  },
  {
    number: "avl-0003/05/26", date: "23.05.2026",
    customer: "МегаСтрой", from: "ООО «ГрунтПром»", to: "ООО «МегаСтрой»",
    material: "Грунт", volume: 25, volumeUnit: "м³",
    pointA: "Карьер №2, ул. Промышленная", pointB: "ТЦ Галактика, котлован",
    ratePerTrip: 1400, clientRate: 750, clientRateUnit: "м³",
    drivers: [
      { name: DRIVER_SHORT_NAME, vehicle: DRIVER_VEHICLE, vehicleType: "КАМАЗ-6520 (20 т)", phone: "+7 (905) 123-45-67" },
      { name: "Козлов М.Д.", vehicle: "Е234АО 77", vehicleType: "Volvo FH (25 т)", phone: "+7 (903) 456-78-90" },
    ],
    tripsCompleted: 3, tripsTotal: 10, status: "in_progress",
    ocrIssue: true,
  },
  {
    number: "avl-0004/05/26", date: "22.05.2026",
    customer: "Дорстрой", from: "ООО «КарьерСтрой»", to: "ООО «Дорстрой»",
    material: "Песок", volume: 30, volumeUnit: "тонн",
    pointA: "Карьер №3", pointB: "Трасса М7, км 15",
    ratePerTrip: 2000, clientRate: 1500, clientRateUnit: "тонн",
    drivers: [{ name: "Сидоров П.И.", vehicle: "С789НМ 77", vehicleType: "КАМАЗ-65115 (15 т)", phone: "+7 (926) 345-67-89" }],
    tripsCompleted: 6, tripsTotal: 6, status: "completed",
  },
  {
    number: "avl-0005/05/26", date: "22.05.2026",
    customer: "СтройТех", from: "ООО «ГрунтПром»", to: "ООО «СтройТех»",
    material: "Бетон", volume: 22, volumeUnit: "тонн",
    pointA: "Карьер №1", pointB: "Завод №2",
    ratePerTrip: 1600, clientRate: 2200, clientRateUnit: "час",
    drivers: [{ name: "Козлов М.Д.", vehicle: "Е234АО 77", vehicleType: "Volvo FH (25 т)", phone: "+7 (903) 456-78-90" }],
    tripsCompleted: 4, tripsTotal: 4, status: "archived",
  },
];

const initialTrips: AppTrip[] = [
  {
    id: "TRP-001", shiftId: "SHF-MOCK-1", orderNumber: "avl-0001/05/26", orderCustomer: "Стройком-М",
    driver: DRIVER_NAME, vehicle: DRIVER_VEHICLE, date: "2026-05-23", time: "09:15",
    consignmentNoteDriver: "СН-00123", consignmentNoteOCR: "СН-00123",
    volumeDriver: 20, volumeOCR: 20, status: "verified", ocrStatus: "matched", hasPhoto: true,
  },
  {
    id: "TRP-002", shiftId: "SHF-MOCK-1", orderNumber: "avl-0001/05/26", orderCustomer: "Стройком-М",
    driver: DRIVER_NAME, vehicle: DRIVER_VEHICLE, date: "2026-05-23", time: "11:30",
    consignmentNoteDriver: "СН-00124", consignmentNoteOCR: "СН-00124",
    volumeDriver: 19.5, volumeOCR: 20, status: "needs_review", ocrStatus: "mismatch", hasPhoto: true,
  },
  {
    id: "TRP-003", shiftId: "SHF-MOCK-1", orderNumber: "avl-0003/05/26", orderCustomer: "МегаСтрой",
    driver: DRIVER_SHORT_NAME, vehicle: DRIVER_VEHICLE, date: "2026-05-23", time: "13:45",
    consignmentNoteDriver: "СН-00125", consignmentNoteOCR: null,
    volumeDriver: 25, volumeOCR: null, status: "submitted", ocrStatus: "pending", hasPhoto: true,
  },
];

const initialShifts: AppShift[] = [
  {
    id: "SHF-MOCK-1",
    driverId: "mock-driver-1",
    vehicleId: "mock-vehicle-1",
    driver: DRIVER_NAME,
    vehicle: DRIVER_VEHICLE,
    startTime: "08:00",
    endTime: null,
    date: "2026-05-23",
    status: "open",
    tripsCount: 3,
    mileageStart: 152340,
    mileageEnd: null,
    fuelStart: 0,
    fuelEnd: null,
    totalVolume: 64.5,
    earnings: 4400,
  },
];

const initialVehicles: AppVehicle[] = [
  {
    id: "mock-vehicle-1",
    plate: DRIVER_VEHICLE,
    brand: "КАМАЗ",
    model: "6520",
    type: "Самосвал",
    year: 2021,
    vin: "MOCKVIN000000001",
    capacity: 20,
    bodyVolume: null,
    currentOdometer: 152340,
    assignedDriver: DRIVER_NAME,
    status: "active",
  },
];

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AppOrder[]>(operationsRepository.mode === "supabase" ? [] : initialOrders);
  const [trips, setTrips] = useState<AppTrip[]>(operationsRepository.mode === "supabase" ? [] : initialTrips);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [shifts, setShifts] = useState<AppShift[]>(operationsRepository.mode === "supabase" ? [] : initialShifts);
  const [drivers, setDrivers] = useState<AppDriver[]>([]);
  const [vehicles, setVehicles] = useState<AppVehicle[]>(operationsRepository.mode === "supabase" ? [] : initialVehicles);

  async function refreshSupabaseData() {
    if (operationsRepository.mode !== "supabase") return;

    const results = await Promise.allSettled([
      operationsRepository.listOrders(),
      operationsRepository.listTrips(),
      operationsRepository.listDocuments(),
      operationsRepository.listShifts(),
      operationsRepository.listDrivers(),
      operationsRepository.listVehicles(),
    ] as const);

    const [ordersResult, tripsResult, documentsResult, shiftsResult, driversResult, vehiclesResult] = results;

    if (ordersResult.status === "fulfilled") setOrders(ordersResult.value);
    else console.warn("Не удалось обновить заявки из Supabase", ordersResult.reason);

    if (tripsResult.status === "fulfilled") setTrips(tripsResult.value);
    else console.warn("Не удалось обновить рейсы из Supabase", tripsResult.reason);

    if (documentsResult.status === "fulfilled") setDocuments(documentsResult.value);
    else console.warn("Не удалось обновить документы из Supabase", documentsResult.reason);

    if (shiftsResult.status === "fulfilled") setShifts(shiftsResult.value);
    else console.warn("Не удалось обновить смены из Supabase", shiftsResult.reason);

    if (driversResult.status === "fulfilled") setDrivers(driversResult.value);
    else console.warn("Не удалось обновить водителей из Supabase", driversResult.reason);

    if (vehiclesResult.status === "fulfilled") setVehicles(vehiclesResult.value);
    else console.warn("Не удалось обновить автопарк из Supabase", vehiclesResult.reason);
  }

  useEffect(() => {
    if (operationsRepository.mode !== "supabase") return;

    void refreshSupabaseData();

    let unsubscribe: (() => void) | undefined;
    void getSupabaseClient().then((supabase) => {
      const subscription = supabase?.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") void refreshSupabaseData();
        if (event === "SIGNED_OUT") {
          setOrders([]);
          setTrips([]);
          setDocuments([]);
          setShifts([]);
          setDrivers([]);
          setVehicles([]);
        }
      });
      unsubscribe = () => subscription?.data.subscription.unsubscribe();
    });

    return () => unsubscribe?.();
  }, []);

  const value = useMemo<AppStoreValue>(() => ({
    dataMode: operationsRepository.mode,
    orders,
    trips,
    documents,
    shifts,
    drivers,
    vehicles,
    async createOrder(order) {
      const optimisticOrder: AppOrder = {
        ...order,
        volume: order.volume ?? 0,
        drivers: [],
        tripsCompleted: 0,
        tripsTotal: 1,
        status: "draft",
      };

      setOrders((prev) => [optimisticOrder, ...prev]);

      try {
        await operationsRepository.createOrder(order);
        await refreshSupabaseData().catch((error) => {
          console.warn("Заявка создана, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        setOrders((prev) => prev.filter((item) => item.number !== order.number));
        throw error;
      }
    },
    async createDriver(driver) {
      await operationsRepository.createDriver(driver);
      await refreshSupabaseData();
    },
    async assignDrivers(orderNumber, drivers) {
      setOrders((prev) => prev.map((order) => (
        order.number === orderNumber
          ? { ...order, drivers, status: drivers.length > 0 ? "assigned" : "draft" }
          : order
      )));

      try {
        await operationsRepository.assignDrivers(orderNumber, drivers);
        await refreshSupabaseData().catch((error) => {
          console.warn("Назначение сохранено, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        await refreshSupabaseData();
        throw error;
      }
    },
    async advanceOrderStatus(orderNumber) {
      const nextByStatus: Partial<Record<OrderStatus, OrderStatus>> = {
        draft: "assigned",
        assigned: "in_progress",
        in_progress: "completed",
        completed: "archived",
      };
      const currentOrder = orders.find((order) => order.number === orderNumber);
      const nextStatus = currentOrder ? nextByStatus[currentOrder.status] : undefined;
      if (!nextStatus) return;

      setOrders((prev) => prev.map((order) => (
        order.number === orderNumber
          ? { ...order, status: nextStatus }
          : order
      )));

      try {
        await operationsRepository.updateOrderStatus(orderNumber, nextStatus);
        await refreshSupabaseData().catch((error) => {
          console.warn("Статус заявки сохранён, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        await refreshSupabaseData();
        throw error;
      }
    },
    async openShift(input) {
      const existingOpenShift = shifts.find((shift) => (
        shift.status === "open" &&
        (input.driverId ? shift.driverId === input.driverId : sameDriver(shift.driver, input.driverName))
      ));
      if (existingOpenShift) throw new Error("У водителя уже есть открытая смена");

      const assignedVehicle = vehicles.find((vehicle) => (
        (input.vehicleId && vehicle.id === input.vehicleId) ||
        (input.vehiclePlate && sameDriver(vehicle.plate, input.vehiclePlate))
      ));
      const now = new Date();
      const optimisticShift: AppShift = {
        id: `SHF-${Date.now()}`,
        driverId: input.driverId,
        vehicleId: input.vehicleId ?? assignedVehicle?.id,
        driver: input.driverName,
        vehicle: input.vehiclePlate ?? assignedVehicle?.plate ?? "ТС",
        startTime: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        endTime: null,
        date: now.toISOString().slice(0, 10),
        status: "open",
        tripsCount: 0,
        mileageStart: assignedVehicle?.currentOdometer ?? 0,
        mileageEnd: null,
        fuelStart: 0,
        fuelEnd: null,
        totalVolume: 0,
        earnings: 0,
      };

      setShifts((prev) => [optimisticShift, ...prev]);

      try {
        await operationsRepository.openShift(input);
        await refreshSupabaseData().catch((error) => {
          console.warn("Смена открыта, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        setShifts((prev) => prev.filter((shift) => shift.id !== optimisticShift.id));
        throw error;
      }
    },
    async updateShiftStatus(shiftId, status) {
      const previous = shifts;
      setShifts((prev) => prev.map((shift) => (
        shift.id === shiftId ? { ...shift, status } : shift
      )));

      try {
        await operationsRepository.updateShiftStatus(shiftId, status);
        await refreshSupabaseData().catch((error) => {
          console.warn("Статус смены сохранён, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        setShifts(previous);
        throw error;
      }
    },
    async submitTripReport(trip) {
      const order = orders.find((item) => item.number === trip.orderNumber);
      const driver = order?.drivers[0];
      const currentShift = shifts.find((shift) => shift.status === "open" && sameDriver(shift.driver, driver?.name ?? DRIVER_NAME));
      const optimisticTrip: AppTrip = {
        id: trip.id,
        shiftId: currentShift?.id,
        orderNumber: trip.orderNumber,
        orderCustomer: order?.customer ?? "Заявка",
        driver: driver?.name ?? DRIVER_NAME,
        vehicle: driver?.vehicle ?? DRIVER_VEHICLE,
        date: new Date().toISOString().slice(0, 10),
        time: trip.time,
        consignmentNoteDriver: trip.consignmentNote,
        consignmentNoteOCR: trip.ocrChecked && !trip.hasOcrMismatch ? trip.consignmentNote : null,
        volumeDriver: trip.volume,
        volumeOCR: trip.ocrChecked && !trip.hasOcrMismatch ? trip.volume : null,
        status: trip.hasOcrMismatch ? "needs_review" : "submitted",
        ocrStatus: trip.ocrChecked ? (trip.hasOcrMismatch ? "mismatch" : "matched") : "not_required",
        hasPhoto: trip.hasPhoto,
      };
      setTrips((prev) => [optimisticTrip, ...prev]);
      setOrders((prev) => prev.map((item) => (
        item.number === trip.orderNumber
          ? {
              ...item,
              status: item.status === "assigned" ? "in_progress" : item.status,
              tripsCompleted: item.tripsCompleted + 1,
              ocrIssue: item.ocrIssue || trip.hasOcrMismatch,
            }
          : item
      )));

      try {
        await operationsRepository.submitTripReport(trip);
        await refreshSupabaseData().catch((error) => {
          console.warn("Рейсовый отчёт отправлен, но обновить данные из Supabase не удалось", error);
        });
      } catch (error) {
        setTrips((prev) => prev.filter((item) => item.id !== optimisticTrip.id));
        setOrders((prev) => prev.map((item) => (
          item.number === trip.orderNumber
            ? {
                ...item,
                status: item.status === "in_progress" && order?.status === "assigned" ? "assigned" : item.status,
                tripsCompleted: Math.max(0, item.tripsCompleted - 1),
                ocrIssue: order?.ocrIssue ?? item.ocrIssue,
              }
            : item
        )));
        throw error;
      }
    },
    async closeShift(input) {
      const openShift = shifts.find((shift) => shift.status === "open");
      if (operationsRepository.mode === "mock" && openShift) {
        const relatedTrips = trips.filter((trip) => sameDriver(trip.driver, openShift.driver));
        const now = new Date();
        setShifts((prev) => prev.map((shift) => (
          shift.id === openShift.id
            ? {
                ...shift,
              status: "submitted",
              endTime: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
              mileageEnd: input.closingOdometer,
              fuelEnd: input.fuelFilledLiters ?? shift.fuelEnd,
              tripsCount: relatedTrips.length,
              totalVolume: relatedTrips.reduce((sum, trip) => sum + trip.volumeDriver, 0),
              earnings: relatedTrips.reduce((sum, trip) => {
                  const order = orders.find((item) => item.number === trip.orderNumber);
                  return sum + (order?.ratePerTrip ?? 0);
                }, 0),
              }
            : shift
        )));
        setVehicles((prev) => prev.map((vehicle) => (
          vehicle.id === openShift.vehicleId || vehicle.plate === openShift.vehicle
            ? { ...vehicle, currentOdometer: input.closingOdometer }
            : vehicle
        )));
        return;
      }

      await operationsRepository.closeShift(input);
      await refreshSupabaseData();
    },
    getDriverOrders(driverName, driverId) {
      return orders.filter((order) =>
        ["assigned", "in_progress"].includes(order.status) &&
        order.drivers.some((driver) => driver.driverId === driverId || sameDriver(driver.name, driverName))
      );
    },
    getOrderTrips(orderNumber) {
      return trips.filter((trip) => trip.orderNumber === orderNumber);
    },
  }), [documents, drivers, orders, shifts, trips, vehicles]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
}

function sameDriver(left: string, right: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
  const a = normalize(left);
  const b = normalize(right);
  return a === b;
}
