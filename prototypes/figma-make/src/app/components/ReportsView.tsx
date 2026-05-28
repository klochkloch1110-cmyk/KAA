import { Download, Calendar, TrendingUp, DollarSign, Truck, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const tripsData = [
  { day: "Пн", trips: 28, earnings: 42000 },
  { day: "Вт", trips: 32, earnings: 48000 },
  { day: "Ср", trips: 25, earnings: 37500 },
  { day: "Чт", trips: 30, earnings: 45000 },
  { day: "Пт", trips: 35, earnings: 52500 },
  { day: "Сб", trips: 20, earnings: 30000 },
  { day: "Вс", trips: 15, earnings: 22500 },
];

const vehicleData = [
  { vehicle: "А123КС 77", trips: 78, earnings: 117000 },
  { vehicle: "В456ВО 77", trips: 65, earnings: 97500 },
  { vehicle: "С789НМ 77", trips: 52, earnings: 78000 },
  { vehicle: "Д012РТ 77", trips: 45, earnings: 67500 },
];

export function ReportsView() {
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-21");

  const totalTrips = tripsData.reduce((sum, d) => sum + d.trips, 0);
  const totalEarnings = tripsData.reduce((sum, d) => sum + d.earnings, 0);
  const avgPerTrip = totalEarnings / totalTrips;

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Отчёты и аналитика</h1>
              <p className="text-sm text-muted-foreground mt-1">Статистика и экспорт данных</p>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Период:</span>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <span className="text-sm text-muted-foreground">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-input-background border border-border rounded-lg text-card-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="w-4 h-4" />
              Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Всего рейсов</p>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{totalTrips}</p>
            <p className="text-xs text-muted-foreground mt-1">За выбранный период</p>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Общая выручка</p>
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">₽{(totalEarnings / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground mt-1">За выбранный период</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Средний доход</p>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">₽{avgPerTrip.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">За рейс</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Активных ТС</p>
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-card-foreground">{vehicleData.length}</p>
            <p className="text-xs text-muted-foreground mt-1">В работе</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trips Chart */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Рейсы по дням недели
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tripsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="trips" fill="#3b9dd8" name="Рейсов" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings Chart */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Выручка по дням
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tripsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `₽${value.toLocaleString()}`}
                />
                <Line type="monotone" dataKey="earnings" stroke="#5fb3b3" strokeWidth={2} name="Выручка" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Performance */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Производительность автопарка
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Транспортное средство
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Рейсов выполнено
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Заработано
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Средний доход
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Доля от общей выручки
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicleData.map((vehicle, index) => {
                  const share = (vehicle.earnings / totalEarnings) * 100;
                  return (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">{vehicle.vehicle}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{vehicle.trips}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-accent">
                        ₽{vehicle.earnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        ₽{Math.round(vehicle.earnings / vehicle.trips).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-card-foreground min-w-12 text-right">
                            {share.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-primary" />
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="font-semibold text-card-foreground mb-1">Отчёт по рейсам</h4>
            <p className="text-sm text-muted-foreground">Полный список рейсов за период</p>
          </button>
          <button className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-accent" />
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h4 className="font-semibold text-card-foreground mb-1">Финансовый отчёт</h4>
            <p className="text-sm text-muted-foreground">Выручка и расходы по статьям</p>
          </button>
          <button className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8 text-orange-600" />
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-orange-600 transition-colors" />
            </div>
            <h4 className="font-semibold text-card-foreground mb-1">Отчёт по автопарку</h4>
            <p className="text-sm text-muted-foreground">Пробег, топливо, техобслуживание</p>
          </button>
        </div>
      </div>
    </div>
  );
}
