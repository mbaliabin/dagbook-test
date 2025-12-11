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

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<PeriodType>("year");

  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });

  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [totals, setTotals] = React.useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = React.useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = React.useState<Record<string, any>>({});

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
      const workoutsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!workoutsRes.ok) throw new Error("Ошибка загрузки тренировок");
      const allWorkouts = await workoutsRes.json();

      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Ошибка загрузки daily info");
      const dailyRaw = await dailyRes.json();

      const dailyMap: Record<string, any> = {};
      dailyRaw.forEach((entry: any) => {
        const key = dayjs(entry.date).format("YYYY-MM-DD");
        dailyMap[key] = {
          physical: entry.physical ?? null,
          mental: entry.mental ?? null,
          sleep_quality: entry.sleep_quality ?? null,
          pulse: entry.pulse ?? null,
        };
      });
      setDailyInfo(dailyMap);

      const startDay = dayjs(dateRange.startDate).startOf("day");
      const endDay = dayjs(dateRange.endDate).endOf("day");

      const workouts = allWorkouts.filter((w: any) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        return d.isValid() && d.isBetween(startDay, endDay, null, "[]");
      });

      const daysSet = new Set(workouts.map((w: any) => dayjs(w.date).format("YYYY-MM-DD")));
      const totalMin = workouts.reduce((s: number, w: any) => s + (w.duration || 0), 0);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;

      setTotals({
        trainingDays: daysSet.size,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: Math.round(workouts.reduce((s: number, w: any) => s + (w.distance || 0), 0)),
      });

      // === КОЛОНКИ ===
      let cols: string[] = [];

      if (periodType === "week") {
        const year = dayjs().year();
        const firstDayOfYear = dayjs(`${year}-01-01`);
        const firstWeekStart = firstDayOfYear.startOf("week");
        let current = firstWeekStart;
        let weekNum = 1;

        while (current.year() === year || (current.year() === year + 1 && weekNum === 1)) {
          cols.push(`W${weekNum}`);
          weekNum++;
          current = current.add(1, "week");
        }
      } else if (periodType === "month" || periodType === "year") {
        cols = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
      } else if (periodType === "custom") {
        let current = dayjs(dateRange.startDate);
        while (current.isBefore(dateRange.endDate) || current.isSame(dateRange.endDate, "day")) {
          cols.push(current.format("DD MMM"));
          current = current.add(1, "day");
        }
      }

      setColumns(cols);

      // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: какой индекс у даты ===
      const getIndexForDate = (date: dayjs.Dayjs): number => {
        if (periodType === "week") {
          const year = dayjs().year();
          const firstWeekStart = dayjs(`${year}-01-01`).startOf("week");
          return Math.max(0, Math.floor(date.diff(firstWeekStart, "week")));
        } else if (periodType === "custom") {
          return date.diff(dayjs(dateRange.startDate).startOf("day"), "day");
        } else {
          return date.month();
        }
      };

      // === Зоны выносливости ===
      const zoneColors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
      const zoneKeys = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };

      const enduranceData = ["I1", "I2", "I3", "I4", "I5"].map(z => ({
        zone: z,
        color: zoneColors[z as keyof typeof zoneColors],
        months: cols.map((_, i) => {
          return workouts
            .filter(w => {
              const d = dayjs(w.date);
              return d.isValid() && getIndexForDate(d) === i;
            })
            .reduce((sum: number, w: any) => sum + (w[zoneKeys[z as keyof typeof zoneKeys]] || 0), 0);
        }),
      }));

      // === Типы активности и дистанция ===
      const typeMap: Record<string, string> = {
        XC_Skiing_Skate: "Лыжи / скейтинг",
        XC_Skiing_Classic: "Лыжи, классика",
        RollerSki_Classic: "Роллеры, классика",
        RollerSki_Skate: "Роллеры, скейтинг",
        Bike: "Велосипед",
      };

      const types = [...new Set(workouts.map((w: any) => w.type))];

      const movementData = types.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts.filter(w => {
          const d = dayjs(w.date);
          return d.isValid() && getIndexForDate(d) === i;
        }).length),
      }));

      const distanceData = types.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts
          .filter(w => {
            const d = dayjs(w.date);
            return d.isValid() && getIndexForDate(d) === i;
          })
          .reduce((s: number, w: any) => s + (w.distance || 0), 0)
        ),
      }));

      setEnduranceZones(enduranceData.map(z => ({ ...z, total: z.months.reduce((a: number, b: number) => a + b, 0) })));
      setMovementTypes(movementData.map(m => ({ ...m, total: m.months.reduce((a: number, b: number) => a + b, 0) })));
      setDistanceByType(distanceData.map(d => ({ ...d, total: d.months.reduce((a: number, b: number) => a + b, 0) })));

    } catch (err: any) {
      setError(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [dateRange, periodType]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // === Остальное без изменений ===
  const filteredEnduranceZones = enduranceZones.map(z => ({ ...z, months: z.months.slice(0, columns.length) }));
  const filteredMovementTypes = movementTypes.map(m => ({ ...m, months: m.months.slice(0, columns.length) }));
  const filteredDistanceTypes = distanceByType.map(d => ({ ...d, months: d.months.slice(0, columns.length) }));

  const distanceColors: Record<string, string> = {
    "Лыжи / скейтинг": "#4ade80",
    "Лыжи, классика": "#22d3ee",
    "Роллеры, классика": "#facc15",
    "Роллеры, скейтинг": "#fb923c",
    "Велосипед": "#3b82f6",
  };

  const activeDistanceTypes = filteredDistanceTypes.filter(t => t.months.some((v: number) => v > 0)).map(t => t.type);

  const enduranceChartData = columns.map((col, i) => {
    const obj: any = { month: col };
    filteredEnduranceZones.forEach(z => obj[z.zone] = z.months[i] ?? 0);
    return obj;
  });

  const distanceChartData = columns.map((col, i) => {
    const obj: any = { month: col };
    filteredDistanceTypes.forEach(t => obj[t.type] = t.months[i] ?? 0);
    return obj;
  });

  const getDailyParam = (param: "physical" | "mental" | "sleep_quality" | "pulse", index: number) => {
    if (periodType === "custom") {
      const dateKey = dayjs(dateRange.startDate).add(index, "day").format("YYYY-MM-DD");
      return dailyInfo[dateKey]?.[param] ?? "-";
    }
    if (periodType === "week") {
      const year = dayjs().year();
      const weekStart = dayjs(`${year}-01-01`).startOf("week").add(index, "week");
      const weekEnd = weekStart.endOf("week");
      const dates = Object.keys(dailyInfo).filter(d => dayjs(d).isBetween(weekStart, weekEnd, null, "[]"));
      if (dates.length === 0) return "-";
      const sum = dates.reduce((s, d) => s + (dailyInfo[d][param] || 0), 0);
      return Math.round(sum / dates.length);
    }
    const monthDates = Object.keys(dailyInfo).filter(d => dayjs(d).month() === index);
    if (monthDates.length === 0) return "-";
    const sum = monthDates.reduce((s, d) => s + (dailyInfo[d][param] || 0), 0);
    return Math.round(sum / monthDates.length);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400 text-xl">Ошибка: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER, MENU, FILTERS — как у тебя */}
        {/* ... (оставь как было, только кнопки с setPeriodType и setDateRange) */}

        {/* TOTALS */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
            <div><p className="text-gray-400">Общее расстояние (км)</p><p className="text-xl text-gray-100">{totals.distance}</p></div>
          </div>
        </div>

        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={filteredEnduranceZones} />

            <SyncedTable
              title="Параметры дня"
              rows={[
                { param: "Физика", months: columns.map((_, i) => getDailyParam("physical", i)), total: "-" },
                { param: "Психика", months: columns.map((_, i) => getDailyParam("mental", i)), total: "-" },
                { param: "Качество сна", months: columns.map((_, i) => getDailyParam("sleep_quality", i)), total: "-" },
                { param: "Пульс утром", months: columns.map((_, i) => getDailyParam("pulse", i)), total: "-" },
              ]}
              columns={columns}
              index={0}
              showBottomTotal={false}
            />

            <SyncedTable
              title="Зоны выносливости"
              rows={filteredEnduranceZones.map(z => ({
                param: z.zone,
                color: z.color,
                months: z.months,
                total: z.total,
              }))}
              columns={columns}
              formatAsTime
              index={1}
              showBottomTotal={true}
              bottomRowName="Общая выносливость"
            />

            <SyncedTable
              title="Тип активности"
              rows={filteredMovementTypes.map(m => ({
                param: m.type,
                months: m.months,
                total: m.total,
              }))}
              columns={columns}
              index={2}
              showBottomTotal={true}
              bottomRowName="Общее по видам активности"
            />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <DistanceChart data={distanceChartData} types={activeDistanceTypes} />
            <SyncedTable
              title="Дистанция по видам тренировок"
              rows={filteredDistanceTypes.map(t => ({
                param: t.type,
                color: distanceColors[t.type] || "#888",
                months: t.months,
                total: t.total,
              }))}
              columns={columns}
              index={0}
              showBottomTotal={true}
              bottomRowName="Общая пройденная дистанция"
            />
          </>
        )}
      </div>
    </div>
  );
}