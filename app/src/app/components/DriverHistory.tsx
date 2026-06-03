import { Calendar, TrendingUp, DollarSign, Route, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useAppStore } from "../store/AppStore";
import { getCurrentDriverTrips, isCurrentDriverRecord } from "../utils/driverData";

interface HistoryItem {
  date: string;
  trips: number;
  earnings: number;
  mileage: number;
}

export function DriverHistory() {
  const { user } = useAuth();
  const { orders, trips, shifts } = useAppStore();
  const driverName = user?.fullName ?? "Водитель";
  const driverId = user?.id;
  const driverTrips = getCurrentDriverTrips(trips, driverName, driverId);
  const driverShifts = shifts.filter((shift) => isCurrentDriverRecord(shift, driverName, driverId));
  const history = buildHistory(driverTrips.map((trip) => ({
    date: trip.date,
    orderNumber: trip.orderNumber,
  })), driverShifts, (orderNumber) => orders.find((order) => order.number === orderNumber)?.ratePerTrip ?? 0);
  const weekStart = startOfWeek(new Date());
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const weekItems = history.filter((item) => new Date(`${item.date}T00:00:00`) >= weekStart);
  const monthItems = history.filter((item) => new Date(`${item.date}T00:00:00`) >= monthStart);
  const weekStats = summarize(weekItems);
  const monthStats = summarize(monthItems);

  return (
    <div className="h-screen bg-background overflow-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-accent p-6 text-white">
        <h1 className="text-2xl font-bold">История</h1>
        <p className="text-sm opacity-90 mt-1">Ваши смены и заработок</p>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-4">
        {/* Week Summary */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            За эту неделю
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Рейсов</p>
              <p className="text-2xl font-bold text-primary">{weekStats.totalTrips}</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 border border-accent/20">
              <p className="text-xs text-muted-foreground mb-1">Заработано</p>
              <p className="text-2xl font-bold text-accent">₽{weekStats.totalEarnings.toLocaleString("ru-RU")}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Пробег</p>
              <p className="text-2xl font-bold text-card-foreground">{weekStats.totalMileage} км</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Средний доход</p>
              <p className="text-2xl font-bold text-card-foreground">₽{weekStats.avgPerTrip}</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground px-1">Последние смены</h3>
          {history.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-card-foreground">Истории смен пока нет</p>
              <p className="text-xs text-muted-foreground mt-1">Здесь появятся реальные рейсы и закрытые смены водителя.</p>
            </div>
          ) : history.map((item) => (
            <div key={item.date} className="bg-card rounded-lg border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {new Date(item.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("ru-RU", {
                        weekday: "long",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">₽{item.earnings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{item.trips} рейсов</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Route className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Рейсы</p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{item.trips}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Пробег</p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{item.mileage} км</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Средн.</p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">₽{item.trips > 0 ? Math.round(item.earnings / item.trips).toLocaleString("ru-RU") : 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Earnings Badge */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-900 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 dark:text-green-400 mb-1">Всего заработано за месяц</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">₽{monthStats.totalEarnings.toLocaleString("ru-RU")}</p>
          </div>
          <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
        </div>
      </div>
    </div>
  );
}

function buildHistory(
  trips: Array<{ date: string; orderNumber: string }>,
  shifts: Array<{ date: string; mileageStart: number; mileageEnd: number | null }>,
  getRate: (orderNumber: string) => number,
): HistoryItem[] {
  const byDate = new Map<string, HistoryItem>();

  for (const trip of trips) {
    const item = byDate.get(trip.date) ?? { date: trip.date, trips: 0, earnings: 0, mileage: 0 };
    item.trips += 1;
    item.earnings += getRate(trip.orderNumber);
    byDate.set(trip.date, item);
  }

  for (const shift of shifts) {
    const item = byDate.get(shift.date) ?? { date: shift.date, trips: 0, earnings: 0, mileage: 0 };
    if (shift.mileageEnd !== null) item.mileage += Math.max(0, shift.mileageEnd - shift.mileageStart);
    byDate.set(shift.date, item);
  }

  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function summarize(items: HistoryItem[]) {
  const totalTrips = items.reduce((sum, item) => sum + item.trips, 0);
  const totalEarnings = items.reduce((sum, item) => sum + item.earnings, 0);
  const totalMileage = items.reduce((sum, item) => sum + item.mileage, 0);
  return {
    totalTrips,
    totalEarnings,
    totalMileage,
    avgPerTrip: totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0,
  };
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start;
}
