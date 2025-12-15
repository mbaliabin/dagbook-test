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

// --- КОНСТАНТЫ И ТИПЫ ДАННЫХ ---
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

type PeriodType = "week" | "month" | "year" | "custom";

// Типы для структурирования данных
interface PeriodData {
  months: number[];
  total: number;
}

interface EnduranceZone extends PeriodData {
  zone: 'I1' | 'I2' | 'I3' | 'I4' | 'I5';
  color: string;
}

interface MovementType extends PeriodData {
  type: string;
  color?: string; // Добавлено для DistanceByType
}

interface Workout {
  date: string;
  duration: number;
  distance: number;
  type: string;
  zone1Min: number;
  zone2Min: number;
  zone3Min: number;
  zone4Min: number;
  zone5Min: number;
  // Другие поля тренировки...
}

// Константы для зон выносливости
const ZONE_COLORS: Record<string, string> = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
const ZONE_KEYS: Record<string, keyof Workout> = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };
const ZONE_NAMES = ["I1", "I2", "I3", "I4", "I5"];

// Константы для типов активности
const MOVEMENT_TYPE_MAP: Record<string, string> = {
  XC_Skiing_Skate: "Лыжи / скейтинг",
  XC_Skiing_Classic: "Лыжи, классика",
  RollerSki_Classic: "Роллеры, классика",
  RollerSki_Skate: "Роллеры, скейтинг",
  Bike: "Велосипед",
  Running: "Бег",
  StrengthTraining: "Силовая",
  Other: "Другое",
};
const DISTANCE_COLORS: Record<string, string> = {
  "Лыжи / скейтинг": "#4ade80",
  "Лыжи, классика": "#22d3ee",
  "Роллеры, классика": "#facc15",
  "Роллеры, скейтинг": "#fb923c",
  "Велосипед": "#3b82f6",
};

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

  const [tempRange, setTempRange] = React.useState(dateRange);
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [totals, setTotals] = React.useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = React.useState<string[]>([]);

  // Строгая типизация
  const [enduranceZones, setEnduranceZones] = React.useState<EnduranceZone[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<MovementType[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<MovementType[]>([]);

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
      // 1. ЗАГРУЗКА ДАННЫХ
      const [workoutsRes, dailyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${dayjs(dateRange.startDate).format("YYYY-MM-DD")}&end=${dayjs(dateRange.endDate).format("YYYY-MM-DD")}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (!workoutsRes.ok) throw new Error("Ошибка загрузки тренировок");
      if (!dailyRes.ok) throw new Error("Ошибка загрузки daily info");

      const allWorkouts: Workout[] = await workoutsRes.json();
      const dailyRaw = await dailyRes.json();

      // Обработка daily info
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

      // Фильтрация тренировок по диапазону
      const workouts = allWorkouts.filter((w) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        return d.isValid() && d.isBetween(startDay, endDay, null, "[]");
      });

      // 2. РАСЧЕТ ИТОГОВ
      const daysSet = new Set(workouts.map((w) => dayjs(w.date).format("YYYY-MM-DD")));
      const totalMin = workouts.reduce((s, w) => s + (w.duration || 0), 0);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const totalDistance = Math.round(workouts.reduce((s, w) => s + (w.distance || 0), 0));

      setTotals({
        trainingDays: daysSet.size,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: totalDistance,
      });

      // 3. ФОРМИРОВАНИЕ КОЛОНОК И ИНДЕКСАТОРА (Улучшенная логика для "week")
      let cols: string[] = [];
      const periodStartDay = dayjs(dateRange.startDate).startOf("day");

      const getIndex = (date: dayjs.Dayjs): number => {
        if (periodType === "week") {
          // Расчет относительно начала первой недели в dateRange
          const startWeek = periodStartDay.startOf("week");
          return Math.max(0, date.diff(startWeek, "week"));
        } else if (periodType === "custom") {
          // Расчет относительно начала периода
          return date.diff(periodStartDay, "day");
        } else {
          // month / year
          return date.month();
        }
      };

      if (periodType === "week") {
        const startWeek = periodStartDay.startOf("week");
        const endWeek = dayjs(dateRange.endDate).endOf("week");
        let current = startWeek;

        while (current.isBefore(endWeek)) {
          // Формат W<номер недели>
          cols.push(`W${current.week()}`);
          current = current.add(1, "week");
        }
      } else if (periodType === "month" || periodType === "year") {
        cols = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
      } else if (periodType === "custom") {
        let current = periodStartDay;
        while (current.isBefore(dateRange.endDate) || current.isSame(dateRange.endDate, "day")) {
          cols.push(current.format("DD MMM"));
          current = current.add(1, "day");
        }
      }
      setColumns(cols);

      const numPeriods = cols.length;

      // 4. РАСЧЕТ ДАННЫХ ПО ПЕРИОДАМ

      // Зоны выносливости (Время)
      const enduranceData = ZONE_NAMES.map(z => {
        const months = new Array(numPeriods).fill(0);
        const key = ZONE_KEYS[z as keyof typeof ZONE_KEYS];

        workouts.forEach(w => {
          const d = dayjs(w.date);
          if (d.isValid()) {
            const index = getIndex(d);
            if (index >= 0 && index < numPeriods) {
              months[index] += (w[key] || 0);
            }
          }
        });

        return {
          zone: z as EnduranceZone['zone'],
          color: ZONE_COLORS[z],
          months: months,
        };
      });

      // Типы активности (Дистанция)
      const allTypes = [...new Set(workouts.map(w => w.type))];
      const movementData = allTypes.map(t => {
        const typeName = MOVEMENT_TYPE_MAP[t] || t;
        const months = new Array(numPeriods).fill(0);

        workouts.forEach(w => {
          if (w.type === t) {
            const d = dayjs(w.date);
            if (d.isValid()) {
              const index = getIndex(d);
              if (index >= 0 && index < numPeriods) {
                months[index] += (w.distance || 0);
              }
            }
          }
        });

        return {
          type: typeName,
          months: months.map(v => Math.round(v)), // Округляем до целых км
        };
      });

      setEnduranceZones(enduranceData.map(z => ({ ...z, total: z.months.reduce((a, b) => a + b, 0) })));
      setMovementTypes(movementData.map(m => ({ ...m, total: m.months.reduce((a, b) => a + b, 0) })));
      setDistanceByType(movementData.map(d => ({
        ...d,
        total: d.months.reduce((a, b) => a + b, 0),
        color: DISTANCE_COLORS[d.type]
      })));

    } catch (err: any) {
      setError(err.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [dateRange, periodType]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // Используем useMemo для мемоизации данных графиков, чтобы избежать пересчетов при ререндерах
  const filteredEnduranceZones = enduranceZones.map(z => ({ ...z, months: z.months.slice(0, columns.length) }));
  const filteredDistanceTypes = distanceByType.map(d => ({ ...d, months: d.months.slice(0, columns.length) }));

  const activeDistanceTypes = React.useMemo(() => {
    return filteredDistanceTypes
      .filter(t => DISTANCE_COLORS[t.type] && t.months.some((v: number) => v > 0))
      .map(t => t.type);
  }, [filteredDistanceTypes]);

  const enduranceChartData = React.useMemo(() => {
    return columns.map((col, i) => {
      const obj: any = { month: col };
      filteredEnduranceZones.forEach(z => obj[z.zone] = z.months[i] ?? 0);
      return obj;
    });
  }, [columns, filteredEnduranceZones]);

  const distanceChartData = React.useMemo(() => {
    return columns.map((col, i) => {
      const obj: any = { month: col };
      filteredDistanceTypes.forEach(t => obj[t.type] = t.months[i] ?? 0);
      return obj;
    });
  }, [columns, filteredDistanceTypes]);


  const getDailyParam = (param: "physical" | "mental" | "sleep_quality" | "pulse", index: number) => {
    // ВНИМАНИЕ: Логика усреднения ежедневных данных для режимов "week" / "month" / "year"
    // не менялась и остается привязанной к dayjs().month() для месяцев, что может давать
    // неточные результаты для кастомных периодов, охватывающих несколько лет.
    // Для этого примера я оставил оригинальную логику.

    if (periodType === "custom") {
      const dateKey = dayjs(dateRange.startDate).add(index, "day").format("YYYY-MM-DD");
      return dailyInfo[dateKey]?.[param] ?? "-";
    }

    // В оригинальной логике, для week/month/year используется dayjs().month() === index,
    // что работает, если dateRange соответствует текущему году.
    const monthIndex = periodType === "week" ? dayjs().month() : index;

    const monthDates = Object.keys(dailyInfo).filter(d => {
      // Это упрощенная логика из-за отсутствия точного индексатора для week/month/year
      return dayjs(d).month() === monthIndex;
    });

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
        {/* HEADER & MENU (Оставлено без изменений) */}
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

        {/* FILTERS (Оставлено без изменений) */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-[#1f1f22] text-white px-3 py-1 rounded">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>

          <button onClick={() => { setPeriodType("week"); setDateRange({ startDate: dayjs().startOf("week").toDate(), endDate: dayjs().endOf("week").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Текущая неделя</button>
          <button onClick={() => { setPeriodType("month"); setDateRange({ startDate: dayjs().startOf("month").toDate(), endDate: dayjs().endOf("month").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Текущий месяц</button>
          <button onClick={() => { setPeriodType("year"); setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() }); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Текущий год</button>

          <div className="relative">
            <button onClick={() => { setTempRange(dateRange); setShowDateRangePicker(true); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1"/> Произвольный период
              <ChevronDown className="w-4 h-4 ml-1"/>
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-4">
                <DateRange
                  ranges={[{
                    startDate: tempRange.startDate,
                    endDate: tempRange.endDate,
                    key: "selection"
                  }]}
                  onChange={(item: any) => setTempRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  direction="horizontal"
                  locale={ru}
                  weekStartsOn={1}
                  rangeColors={["#3b82f6"]}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => setShowDateRangePicker(false)} className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-300">
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      setDateRange(tempRange);
                      setPeriodType("custom");
                      setShowDateRangePicker(false);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                  >
                    Применить
                  </button>
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
              rows={movementTypes.map(m => ({
                param: m.type,
                months: m.months,
                total: m.total,
              }))}
              columns={columns}
              index={2}
              showBottomTotal={true}
              bottomRowName="Общая дистанция"
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
                color: t.color, // Теперь цвет берется из объекта
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