import { Calendar, TrendingUp, DollarSign, Route, CheckCircle2 } from "lucide-react";

interface HistoryItem {
  date: string;
  trips: number;
  earnings: number;
  mileage: number;
}

const mockHistory: HistoryItem[] = [
  {
    date: "2026-05-20",
    trips: 5,
    earnings: 7500,
    mileage: 200,
  },
  {
    date: "2026-05-19",
    trips: 6,
    earnings: 9000,
    mileage: 240,
  },
  {
    date: "2026-05-18",
    trips: 4,
    earnings: 6000,
    mileage: 160,
  },
  {
    date: "2026-05-17",
    trips: 5,
    earnings: 7500,
    mileage: 200,
  },
  {
    date: "2026-05-16",
    trips: 7,
    earnings: 10500,
    mileage: 280,
  },
];

const weekStats = {
  totalTrips: 27,
  totalEarnings: 40500,
  totalMileage: 1080,
  avgPerTrip: 1500,
};

export function DriverHistory() {
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
              <p className="text-2xl font-bold text-accent">₽{(weekStats.totalEarnings / 1000).toFixed(0)}k</p>
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
          {mockHistory.map((item, index) => (
            <div key={index} className="bg-card rounded-lg border border-border p-4 shadow-sm">
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
                  <p className="text-sm font-semibold text-card-foreground">₽{item.earnings / item.trips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Earnings Badge */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-900 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 dark:text-green-400 mb-1">Всего заработано в мае</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">₽117,000</p>
          </div>
          <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
        </div>
      </div>
    </div>
  );
}
