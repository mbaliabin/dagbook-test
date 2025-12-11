// src/pages/StatisticsPage/StatsPage.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, Calendar, ChevronDown,
} from "lucide-react";
import { DateRange } from "react-date-range";
import ru from "date-fns/locale/ru";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

type PeriodType = "week" | "month" | "year" | "custom";

interface Totals {
  trainingDays: number;
  sessions: number;
  time: string;
  distance: number;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<PeriodType>("year");
  const [dateRange, setDateRange] = React.useState({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<Totals | null>(null);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Нет авторизации");
      setLoading(false);
      return;
    }

    try {
      // Получаем все тренировки
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не удалось загрузить тренировки");
      const allWorkouts = await res.json();

      // Получаем daily-инфу (пока просто проверяем, что работает)
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Не удалось загрузить ежедневные данные");
      await dailyRes.json();

      // === КРИТИЧЕСКИЙ ФИКС: безопасная фильтрация тренировок ===
      const startDay = dayjs(dateRange.startDate).startOf("day");
      const endDay = dayjs(dateRange.endDate).endOf("day");

      const workouts = allWorkouts.filter((w: any) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        return d.isValid() && d.isBetween(startDay, endDay, null, "[]");
      });

      // === Totals ===
      const trainingDaysSet = new Set(workouts.map((w: any) => dayjs(w.date).format("YYYY-MM-DD")));
      const totalMinutes = workouts.reduce((s: number, w: any) => s + (w.duration || 0), 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      setTotals({
        trainingDays: trainingDaysSet.size,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: Math.round(workouts.reduce((s: number, w: any) => s + (w.distance || 0), 0)),
      });

      // === Колонки ===
      let cols: string[] = [];
      if (periodType === "year" || periodType === "month") {
        cols = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
      } else if (periodType === "week") {
        const year = dayjs().year();
        let week = 1;
        let cur = dayjs(`${year}-01-01`).startOf("week");
        while (cur.year() === year) {
          cols.push(`W${week}`);
          week++;
          cur = cur.add(1, "week");
        }
      } else if (periodType === "custom") {
        let cur = dayjs(dateRange.startDate);
        const end = dayjs(dateRange.endDate);
        while (cur.isBefore(end) || cur.isSame(end, "day")) {
          cols.push(cur.format("DD MMM"));
          cur = cur.add(1, "day");
        }
      }
      setColumns(cols.slice(0, periodType === "custom" ? undefined : 12));

      // === Зоны выносливости ===
      const zones = ["I1", "I2", "I3", "I4", "I5"];
      const colors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
      const typeMap: Record<string, string> = {
        XC_Skiing_Skate: "Лыжи / скейтинг",
        XC_Skiing_Classic: "Лыжи, классика",
        RollerSki_Classic: "Роллеры, классика",
        RollerSki_Skate: "Роллеры, скейтинг",
        Bike: "Велосипед",
        Running: "Бег",
        StrengthTraining: "Силовая",
        Other: "Другое",
      };

      const enduranceData = zones.map(zone => {
        const key = zone === "I1" ? "zone1Min" :
                    zone === "I2" ? "zone2Min" :
                    zone === "I3" ? "zone3Min" :
                    zone === "I4" ? "zone4Min" : "zone5Min";

        const months = cols.map((_, i) => {
          return workouts
            .filter((w: any) => {
              if (!w?.date) return false;
              const d = dayjs(w.date);
              if (!d.isValid()) return false;
              if (periodType === "custom") {
                return d.format("DD MMM") === cols[i];
              }
              return d.month() === i;
            })
            .reduce((sum: number, w: any) => sum + (w[key] || 0), 0);
        });
        return { zone, color: colors[zone as keyof typeof colors], months };
      });

      const typesSet = [...new Set(workouts.map((w: any) => w.type).filter(Boolean))];
      const movementData = typesSet.map((type: string) => ({
        type: typeMap[type] || type,
        months: cols.map((_, i) => {
          return workouts.filter((w: any) => {
            if (!w?.date) return false;
            const d = dayjs(w.date);
            if (!d.isValid()) return false;
            if (periodType === "custom") return d.format("DD MMM") === cols[i];
            return w.type === type && d.month() === i;
          }).length;
        }),
      }));

      const distanceData = typesSet.map((type: string) => ({
        type: typeMap[type] || type,
        months: cols.map((_, i) => {
          return workouts
            .filter((w: any) => {
              if (!w?.date) return false;
              const d = dayjs(w.date);
              if (!d.isValid()) return false;
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return w.type === type && d.month() === i;
            })
            .reduce((s: number, w: any) => s + (w.distance || 0), 0);
        }),
      }));

      setEnduranceZones(enduranceData);
      setMovementTypes(movementData);
      setDistanceByType(distanceData);
    } catch (err: any) {
      console.error("Ошибка загрузки статистики:", err);
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, periodType]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Подготовка данных для графиков
  const filteredEndurance = enduranceZones.map(z => ({
    ...z,
    months: z.months.slice(0, columns.length),
    total: z.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0),
  }));

  const filteredMovement = movementTypes.map(m => ({
    ...m,
    months: m.months.slice(0, columns.length),
    total: m.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0),
  }));

  const filteredDistance = distanceByType.map(d => ({
    ...d,
    months: d.months.slice(0, columns.length).map(Math.round),
    total: Math.round(d.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0)),
  }));

  const enduranceChartData = columns.map((c, i) => {
    const obj: any = { month: c };
    filteredEndurance.forEach(z => (obj[z.zone] = z.months[i] ?? 0));
    return obj;
  });

  const distanceChartData = columns.map((c, i) => {
    const obj: any = { month: c };
    filteredDistance.forEach(t => (obj[t.type] = t.months[i] ?? 0));
    return obj;
  });

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка статистики...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400 text-xl">Ошибка: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gray-600 w-16 h-16 rounded-full" />
            <h1 className="text-3xl font-bold">{name}</h1>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Добавить тренировку
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2">
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>

        {/* TOTALS */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-[#1a1a1d] p-6 rounded-lg">
              <p className="text-gray-400 text-sm">Тренировочные дни</p>
              <p className="text-4xl font-bold text-white">{totals.trainingDays}</p>
            </div>
            <div className="bg-[#1a1a1d] p-6 rounded-lg">
              <p className="text-gray-400 text-sm">Сессий</p>
              <p className="text-4xl font-bold text-white">{totals.sessions}</p>
            </div>
            <div className="bg-[#1a1a1d] p-6 rounded-lg">
              <p className="text-gray-400 text-sm">Время</p>
              <p className="text-4xl font-bold text-white">{totals.time}</p>
            </div>
            <div className="bg-[#1a1a1d] p-6 rounded-lg">
              <p className="text-gray-400 text-sm">Дистанция (км)</p>
              <p className="text-4xl font-bold text-white">{totals.distance}</p>
            </div>
          </div>
        )}

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4 items-center">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-[#1f1f22] px-4 py-2 rounded">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>
          <button onClick={() => { setPeriodType("year"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className={`px-4 py-2 rounded ${periodType === "year" ? "bg-blue-600" : "bg-[#1f1f22]"}`}>Год</button>
          <button onClick={() => { setPeriodType("month"); setDateRange({ startDate: dayjs().startOf("month").toDate(), endDate: dayjs().endOf("month").toDate() }); }} className={`px-4 py-2 rounded ${periodType === "month" ? "bg-blue-600" : "bg-[#1f1f22]"}`}>Месяц</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(v => !v)} className="px-4 py-2 rounded bg-[#1f1f22] flex items-center gap-2">
              <Calendar size={20} /> Произвольный период <ChevronDown size={20} />
            </button>
            {showDateRangePicker && (
              <div className="absolute top-full mt-2 z-50 bg-[#1a1a1d] rounded shadow-xl p-4">
                <DateRange
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]}
                  onChange={(item: any) => {
                    setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate });
                    setPeriodType("custom");
                  }}
                  locale={ru}
                  weekStartsOn={1}
                />
                <button onClick={() => setShowDateRangePicker(false)} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">Применить</button>
              </div>
            )}
          </div>
        </div>

        {/* Графики и таблицы */}
        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={filteredEndurance} />
            <SyncedTable title="Зоны выносливости" rows={filteredEndurance.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total }))} columns={columns} formatAsTime index={1} showBottomTotal bottomRowName="Общая выносливость" />
            <SyncedTable title="Тип активности" rows={filteredMovement.map(m => ({ param: m.type, months: m.months, total: m.total }))} columns={columns} index={2} showBottomTotal bottomRowName="Всего тренировок" />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <DistanceChart data={distanceChartData} types={filteredDistance.map(t => t.type)} />
            <SyncedTable title="Дистанция по видам" rows={filteredDistance.map(t => ({ param: t.type, months: t.months, total: t.total }))} columns={columns} showBottomTotal bottomRowName="Общая дистанция" />
          </>
        )}
      </div>
    </div>
  );
}