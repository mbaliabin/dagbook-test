// src/pages/StatisticsPage/StatsPage.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "dayjs/locale/ru";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Plus,
  LogOut,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { DateRange } from "react-date-range";
import ru from "date-fns/locale/ru";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

type PeriodType = "week" | "month" | "year" | "custom";

interface Totals {
  trainingDays: number;
  sessions: number;
  time: string; // "178:51"
  distance: number;
}

interface DailyInfo {
  date: string;
  main_param?: string | null;
  physical?: number;
  mental?: number;
  sleep_quality?: number;
  pulse?: number;
  sleep_duration?: string | null;
  comment?: string | null;
}

interface Workout {
  id: string;
  name: string;
  type: string;
  duration: number;
  distance?: number;
  date: string;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

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

  // Данные
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<Totals | null>(null);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = React.useState<DailyInfo[]>([]);

  // === Загрузка данных ===
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Нет авторизации");
      setLoading(false);
      return;
    }

    const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
    const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

    try {
      // 1. Тренировки
      const workoutsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workouts?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!workoutsRes.ok) throw new Error("Не удалось загрузить тренировки");
      const workouts: Workout[] = await workoutsRes.json();

      // 2. Ежедневная информация — ТЕПЕРЬ РАБОЧИЙ ЭНДПОИНТ!
      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Не удалось загрузить данные по дням");
      const dailyRaw: DailyInfo[] = await dailyRes.json();

      // Приводим даты к локальным дням
      const dailyInfo = dailyRaw.map(d => ({
        ...d,
        date: dayjs(d.date).format("YYYY-MM-DD"),
      }));

      // === Формируем колонки ===
      let cols: string[] = [];
      if (periodType === "week") {
        const year = dayjs(dateRange.startDate).year();
        const start = dayjs(`${year}-01-01`).startOf("week");
        let cur = start;
        let weekNum = 1;
        while (cur.year() === year) {
          cols.push(`W${weekNum}`);
          weekNum++;
          cur = cur.add(1, "week");
        }
      } else if (periodType === "month" || periodType === "year") {
        cols = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
      } else if (periodType === "custom") {
        let cur = dayjs(dateRange.startDate);
        while (cur.isBefore(dateRange.endDate) || cur.isSame(dateRange.endDate, "day")) {
          cols.push(cur.format("DD MMM"));
          cur = cur.add(1, "day");
        }
      }

      // === Подсчёт totals ===
      const trainingDaysSet = new Set(workouts.map(w => dayjs(w.date).format("YYYY-MM-DD")));
      const totalMinutes = workouts.reduce((s, w) => s + w.duration, 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      const totalsData: Totals = {
        trainingDays: trainingDaysSet.size,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: Math.round(workouts.reduce((s, w) => s + (w.distance || 0), 0)),
      };

      // === Зоны выносливости ===
      const zones = ["I1", "I2", "I3", "I4", "I5"];
      const colors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };

      const enduranceData = zones.map(zone => {
        const months = cols.map((_, i) => {
          return workouts
            .filter(w => {
              const d = dayjs(w.date);
              if (periodType === "month" || periodType === "year") return d.month() === i;
              if (periodType === "week") {
                const weekNum = d.week();
                return weekNum === i + 1;
              }
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return false;
            })
            .reduce((sum, w) => {
              const key = zone === "I1" ? "zone1Min" :
                         zone === "I2" ? "zone2Min" :
                         zone === "I3" ? "zone3Min" :
                         zone === "I4" ? "zone4Min" : "zone5Min";
              return sum + ((w as any)[key] || 0);
            }, 0);
        });
        return { zone, color: colors[zone as keyof typeof colors], months };
      });

      // === Типы активности ===
      const typesSet = Array.from(new Set(workouts.map(w => w.type)));
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

      const movementData = typesSet.map(type => {
        const niceName = typeMap[type] || type;
        const months = cols.map((_, i) => {
          return workouts
            .filter(w => w.type === type)
            .filter(w => {
              const d = dayjs(w.date);
              if (periodType === "month" || periodType === "year") return d.month() === i;
              if (periodType === "week") return d.week() === i + 1;
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return false;
            }).length;
        });
        return { type: niceName, months };
      });

      // === Дистанция по типам ===
      const distanceData = typesSet.map(type => {
        const niceName = typeMap[type] || type;
        const months = cols.map((_, i) => {
          return workouts
            .filter(w => w.type === type)
            .filter(w => {
              const d = dayjs(w.date);
              if (periodType === "month" || periodType === "year") return d.month() === i;
              if (periodType === "week") return d.week() === i + 1;
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return false;
            })
            .reduce((s, w) => s + (w.distance || 0), 0);
        });
        return { type: niceName, months };
      });

      // Сохраняем всё
      setTotals(totalsData);
      setColumns(cols);
      setEnduranceZones(enduranceData);
      setMovementTypes(movementData);
      setDistanceByType(distanceData);
      setDailyInfo(dailyInfo);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [dateRange, periodType]);

  // Загружаем при изменении периода/дат
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // === Подготовка данных для графиков ===
  const filteredEnduranceZones = enduranceZones.map(z => ({
    ...z,
    months: z.months.slice(0, columns.length),
    total: z.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0),
  }));

  const filteredMovementTypes = movementTypes.map(m => ({
    ...m,
    months: m.months.slice(0, columns.length),
    total: m.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0),
  }));

  const filteredDistanceTypes = distanceByType.map(d => ({
    ...d,
    months: d.months.slice(0, columns.length),
    total: Math.round(d.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0)),
  }));

  const distanceColors: Record<string, string> = {
    "Лыжи / скейтинг": "#4ade80",
    "Лыжи, классика": "#22d3ee",
    "Роллеры, классика": "#facc15",
    "Роллеры, скейтинг": "#fb923c",
    "Велосипед": "#3b82f6",
    "Бег": "#8b5cf6",
    "Силовая": "#6b7280",
  };

  const activeDistanceTypes = filteredDistanceTypes
    .filter(t => t.months.some((v: number) => v > 0))
    .map(t => t.type);

  const enduranceChartData = columns.map((col, i) => {
    const obj: any = { month: col };
    filteredEnduranceZones.forEach(z => (obj[z.zone] = z.months[i] ?? 0));
    return obj;
  });

  const distanceChartData = columns.map((col, i) => {
    const obj: any = { month: col };
    filteredDistanceTypes.forEach(t => (obj[t.type] = t.months[i] ?? 0));
    return obj;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-xl">
        Загрузка статистики...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400 text-xl">
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-white">{name}</h1>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}
              >
                <Icon className="w-6 h-6" />
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
          <button onClick={() => { setPeriodType("month"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={() => { setPeriodType("year"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(p => !p)} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Произвольный период
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]}
                  onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
                  months={1}
                  direction="horizontal"
                  locale={ru}
                  weekStartsOn={1}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#3b82f6"]}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={() => { setShowDateRangePicker(false); setPeriodType("custom"); }} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOTALS */}
        {totals && (
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
            <div className="flex flex-wrap gap-10 text-sm mt-3">
              <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
              <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
              <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
              <div><p className="text-gray-400">Общее расстояние (км)</p><p className="text-xl text-gray-100">{totals.distance}</p></div>
            </div>
          </div>
        )}

        {/* ГРАФИКИ */}
        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={filteredEnduranceZones} />
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
              formatAsTime={false}
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
              bottomRowName="Общая дистанция"
            />
          </>
        )}
      </div>
    </div>
  );
}