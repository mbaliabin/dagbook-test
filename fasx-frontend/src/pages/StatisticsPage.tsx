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

  // Данные
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
      // 1. Все тренировки
      const workoutsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!workoutsRes.ok) throw new Error("Не загрузить тренировки");
      const allWorkouts = await workoutsRes.json();

      // 2. Daily Information
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Не загрузить daily info");
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

      // Фильтрация по периоду
      const startDay = dayjs(dateRange.startDate).startOf("day");
      const endDay = dayjs(dateRange.endDate).endOf("day");

      const workouts = allWorkouts.filter((w: any) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        return d.isValid() && d.isBetween(startDay, endDay, null, "[]");
      });

      // Totals
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

      // Колонки
      const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
      let cols: string[] = [];

      if (periodType === "week") {
        const year = dayjs().year();
        let week = 1;
        let cur = dayjs(`${year}-01-01`).startOf("week");
        while (cur.year() === year) {
          cols.push(`W${week}`);
          week++;
          cur = cur.add(1, "week");
        }
      } else if (periodType === "month" || periodType === "year") {
        cols = months;
      } else if (periodType === "custom") {
        let cur = dayjs(dateRange.startDate);
        while (cur.isBefore(dateRange.endDate) || cur.isSame(dateRange.endDate, "day")) {
          cols.push(cur.format("DD MMM"));
          cur = cur.add(1, "day");
        }
      }
      setColumns(cols.slice(0, periodType === "custom" ? undefined : 12));

      // Зоны
      const zoneColors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
      const zoneKeys = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };

      const zones = ["I1", "I2", "I3", "I4", "I5"].map(z => {
        const months = cols.map((_, i) => {
          return workouts
            .filter((w: any) => {
              const d = dayjs(w.date);
              if (!d.isValid()) return false;
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return d.month() === i;
            })
            .reduce((sum: number, w: any) => sum + (w[zoneKeys[z as keyof typeof zoneKeys]] || 0), 0);
        });
        return { zone: z, color: zoneColors[z as keyof typeof zoneColors], months };
      });
      setEnduranceZones(zones.map(z => ({ ...z, total: z.months.reduce((a: number, b: number) => a + b, 0) })));

      // Типы активности
      const typeMap: Record<string, string> = {
        XC_Skiing_Skate: "Лыжи / скейтинг",
        XC_Skiing_Classic: "Лыжи, классика",
        RollerSki_Classic: "Роллеры, классика",
        RollerSki_Skate: "Роллеры, скейтинг",
        Bike: "Велосипед",
      };

      const types = [...new Set(workouts.map((w: any) => w.type))];
      const movement = types.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts.filter((w: any) => {
          const d = dayjs(w.date);
          if (!d.isValid()) return false;
          if (periodType === "custom") return d.format("DD MMM") === cols[i];
          return w.type === t && d.month() === i;
        }).length),
      }));
      setMovementTypes(movement.map(m => ({ ...m, total: m.months.reduce((a: number, b: number) => a + b, 0) })));

      // Дистанция
      const distance = types.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts
          .filter((w: any) => {
            const d = dayjs(w.date);
            if (!d.isValid()) return false;
            if (periodType === "custom") return d.format("DD MMM") === cols[i];
            return w.type === t && d.month() === i;
          })
          .reduce((s: number, w: any) => s + (w.distance || 0), 0)
        ),
      }));
      setDistanceByType(distance.map(d => ({ ...d, total: d.months.reduce((a: number, b: number) => a + b, 0) })));

    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [dateRange, periodType]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const filteredMonths = columns;
  const filteredEnduranceZones = enduranceZones.map(z => ({ ...z, months: z.months.slice(0, filteredMonths.length) }));
  const filteredMovementTypes = movementTypes.map(m => ({ ...m, months: m.months.slice(0, filteredMonths.length) }));
  const filteredDistanceTypes = distanceByType.map(d => ({ ...d, months: d.months.slice(0, filteredMonths.length) }));

  const distanceColors: Record<string, string> = {
    "Лыжи / скейтинг": "#4ade80",
    "Лыжи, классика": "#22d3ee",
    "Роллеры, классика": "#facc15",
    "Роллеры, скейтинг": "#fb923c",
    "Велосипед": "#3b82f6",
  };

  const activeDistanceTypes = filteredDistanceTypes.filter(t => t.months.some((v: number) => v > 0)).map(t => t.type);

  const enduranceChartData = filteredMonths.map((month, i) => {
    const obj: any = { month };
    filteredEnduranceZones.forEach(z => obj[z.zone] = z.months[i] ?? 0);
    return obj;
  });

  const distanceChartData = filteredMonths.map((month, i) => {
    const obj: any = { month };
    filteredDistanceTypes.forEach(t => obj[t.type] = t.months[i] ?? 0);
    return obj;
  });

  // Функция для получения значения из dailyInfo
  const getDailyParam = (param: "physical" | "mental" | "sleep_quality" | "pulse", index: number) => {
    if (periodType === "custom") {
      const dateKey = dayjs(dateRange.startDate).add(index, "day").format("YYYY-MM-DD");
      return dailyInfo[dateKey]?.[param] ?? "-";
    }
    // Для месяца/года — среднее
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-[#1f1f22] text-white px-3 py-1 rounded">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>
          <button onClick={() => { setPeriodType("week"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={() => { setPeriodType("month"); setDateRange({ startDate: dayjs().startOf("month").toDate(), endDate: dayjs().endOf("month").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={() => { setPeriodType("year"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(p => !p)} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1"/> Произвольный период
              <ChevronDown className="w-4 h-4 ml-1"/>
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]}
                  onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
                  months={1} direction="horizontal" locale={ru} weekStartsOn={1}
                  moveRangeOnFirstSelection={false} rangeColors={["#3b82f6"]}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={() => { setShowDateRangePicker(false); setPeriodType("custom"); }} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            )}
          </div>
        </div>

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

        {/* ГРАФИКИ И ТАБЛИЦЫ */}
        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={filteredEnduranceZones} />

            {/* ← ТЕПЕРЬ С РЕАЛЬНЫМИ ДАННЫМИ! */}
            <SyncedTable
              title="Параметры дня"
              rows={[
                { param: "Физика", months: columns.map((_, i) => getDailyParam("physical", i)), total: "-" },
                { param: "Психика", months: columns.map((_, i) => getDailyParam("mental", i)), total: "-" },
                { param: "Качество сна", months: columns.map((_, i) => getDailyParam("sleep_quality", i)), total: "-" },
                { param: "Пульс утром", months: columns.map((_, i) => getDailyParam("pulse", i)), total: "-" },
              ]}
              columns={filteredMonths}
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
              columns={filteredMonths}
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
              columns={filteredMonths}
              formatAsTime
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
              columns={filteredMonths}
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