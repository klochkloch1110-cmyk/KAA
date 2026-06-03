import type { AppOrder, AppShift, AppTrip, AppVehicle } from "../store/AppStore";

export interface DriverVehicleInfo {
  plate: string;
  model: string;
  mileage: number | null;
}

export function samePerson(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return normalize(left) === normalize(right);
}

export function isCurrentDriverRecord(record: { driverId?: string; driver?: string; name?: string }, driverName: string, driverId?: string) {
  return Boolean(
    (driverId && record.driverId === driverId) ||
    samePerson(record.driver ?? record.name, driverName)
  );
}

export function findCurrentShift(shifts: AppShift[], driverName: string, driverId?: string) {
  return shifts.find((shift) => shift.status === "open" && isCurrentDriverRecord(shift, driverName, driverId));
}

export function getCurrentDriverTrips(trips: AppTrip[], driverName: string, driverId?: string) {
  return trips.filter((trip) => isCurrentDriverRecord(trip, driverName, driverId));
}

export function findDriverVehicle(
  vehicles: AppVehicle[],
  currentShift: AppShift | undefined,
  _orders: AppOrder[],
  driverName: string,
  driverId?: string,
): DriverVehicleInfo | null {
  void driverName;
  void driverId;

  if (!currentShift || currentShift.vehicle === "ТС") return null;

  const vehicleId = currentShift.vehicleId;
  const plate = currentShift.vehicle;
  const vehicle = vehicles.find((item) => (
    (vehicleId && item.id === vehicleId) ||
    (plate && samePlate(item.plate, plate))
  ));

  if (vehicle && vehicle.status !== "active") return null;
  if (!vehicle && !plate) return null;

  return {
    plate: vehicle?.plate ?? plate ?? "—",
    model: [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") || "—",
    mileage: vehicle?.currentOdometer ?? currentShift.mileageStart ?? null,
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function samePlate(left: string, right: string) {
  return normalize(left).replace(/\s/g, "") === normalize(right).replace(/\s/g, "");
}
