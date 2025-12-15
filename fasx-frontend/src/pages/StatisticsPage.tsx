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

// ИМПОРТ ФУНКЦИИ ПРОФИЛЯ
import { getUserProfile } from "../api/getUserProfile";

// Предполагаем, что компоненты EnduranceChart, DistanceChart, SyncedTable импортируются корректно
import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

// --- КОНСТАНТЫ И ТИПЫ ДАННЫХ ---
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

type PeriodType = "day" | "week" | "month" | "year";

interface Workout {
  date: string;
  duration: number; // Минуты
  distance: number; // Километры
  type: string;
  zone1Min: number;
  zone2Min: number;
  zone3Min: number;
  zone4Min: number;
  zone5Min: number;
}

const ZONE_COLORS: Record<string, string> = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
const ZONE_KEYS: Record<string, keyof Workout> = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };
const ZONE_NAMES = ["I1", "I2", "I3", "I4", "I5"];

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

const STATUS_PARAMS: { id: string, label: string }[] = [
    { id: 'skadet', label: 'Травма' },
    { id: 'syk', label: 'Болезнь' },
    { id: 'paReise', label: 'В пути' },
    { id: 'hoydedogn', label: 'Смена часового пояса' },
    { id: 'fridag', label: 'Выходной' },
    { id: 'konkurranse', label: 'Соревнование' },
];

type DailyParamKey = "physical" | "mental" | "sleep_quality" | "pulse" | "main_param" | "sleep_duration";

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // СОСТОЯНИЯ, КАК В PROFILEPAGE:
  const [name, setName] = React.useState("Загрузка...");
  const [loadingProfile, setLoadingProfile] = React.useState(true);

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

  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);

  const [dailyInfo, setDailyInfo] = React.useState<Record<string, Record<DailyParamKey, any>> | {}>({});

  // -----------------------------------------------------------
  // 1. ЛОГИКА ЗАГРУЗКИ ИМЕНИ ПОЛЬЗОВАТЕЛЯ
  // -----------------------------------------------------------
  const fetchProfile = async () => {
    try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
    } catch (err) {
        console.error("Ошибка профиля:", err);
        setError("Не удалось загрузить профиль");
        setName("Ошибка!");
        if (err instanceof Error && err.message.includes("авторизации")) {
             navigate('/login');
        }
    } finally {
        setLoadingProfile(false);
    }
  };


  // -----------------------------------------------------------
  // 2. ЛОГИКА УПРАВЛЕНИЯ ПЕРИОДОМ
  // -----------------------------------------------------------
  const handlePeriodChange = (newPeriodType: PeriodType) => {
    setPeriodType(newPeriodType);

    const today = dayjs();
    let newStartDate: dayjs.Dayjs;
    let newEndDate: dayjs.Dayjs;

    switch (newPeriodType) {
        case "day":
            newStartDate = today.startOf('day');
            newEndDate = today.endOf('day');
            break;

        case "week":
            newStartDate = today.startOf('week');
            newEndDate = today.endOf('week');
            break;

        case "month":
            newStartDate = today.startOf('month');
            newEndDate = today.endOf('month');
            break;

        case "year":
            newStartDate = today.startOf('year');
            newEndDate = today.endOf('year');
            break;
    }

    setDateRange({
        startDate: newStartDate.toDate(),
        endDate: newEndDate.toDate(),
    });
  };

  // Инициализация при первом рендере: Установка Года по умолчанию и загрузка имени
  React.useEffect(() => {
      handlePeriodChange("year");
      fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------
  // 3. ФУНКЦИЯ ДЛЯ ОПРЕДЕЛЕНИЯ ИНДЕКСА ПЕРИОДА
  // -----------------------------------------------------------

  const getIndex = React.useCallback((date: dayjs.Dayjs): number => {
      const periodStartDayClean = dayjs(dateRange.startDate).startOf('day');
      const workoutDateClean = date.startOf('day');

      const actualAggregationType = periodType === 'year' ? 'month' : periodType;

      if (actualAggregationType === "day") {
          return workoutDateClean.diff(periodStartDayClean, "day");
      } else if (actualAggregationType === "week") {
          const periodStartWeek = periodStartDayClean.startOf('week');
          return workoutDateClean.diff(periodStartWeek, 'week');
      } else if (actualAggregationType === "month") {
          return workoutDateClean.diff(periodStartDayClean, 'month');
      } else {
          return workoutDateClean.diff(periodStartDayClean, 'year');
      }
  }, [periodType, dateRange.startDate]);

  // -----------------------------------------------------------
  // 4. ФУНКЦИЯ ЗАГРУЗКИ И РАСЧЕТА ДАННЫХ
  // -----------------------------------------------------------

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
        const periodStartDay = dayjs(dateRange.startDate).startOf("day");
        const periodEndDay = dayjs(dateRange.endDate).endOf("day");

        const [workoutsRes, dailyRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(
                `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${periodStartDay.format("YYYY-MM-DD")}&end=${periodEndDay.format("YYYY-MM-DD")}`,
                { headers: { Authorization: `Bearer ${token}` } }
            ),
        ]);

        if (!workoutsRes.ok) throw new Error("Ошибка загрузки тренировок");
        if (!dailyRes.ok) throw new Error("Ошибка загрузки daily info");

        const allWorkouts: Workout[] = await workoutsRes.json();
        const dailyRaw = await dailyRes.json();

        // Обработка daily info
        const dailyMap: Record<string, Record<DailyParamKey, any>> = {};
        dailyRaw.forEach((entry: any) => {
            const key = dayjs(entry.date).format("YYYY-MM-DD");
            dailyMap[key] = {
                physical: entry.physical ?? null,
                mental: entry.mental ?? null,
                sleep_quality: entry.sleep_quality ?? null,
                pulse: entry.pulse ?? null,
                main_param: entry.main_param ?? null,
                sleep_duration: entry.sleep_duration ?? null,
            };
        });
        setDailyInfo(dailyMap);

        // Фильтрация тренировок по диапазону
        const workouts = allWorkouts.filter((w) => {
            if (!w?.date) return false;

            const workoutDayStart = dayjs(w.date).startOf('day');

            return (
                workoutDayStart.isValid() &&
                (workoutDayStart.isAfter(periodStartDay) || workoutDayStart.isSame(periodStartDay, 'day')) &&
                (workoutDayStart.isBefore(periodEndDay) || workoutDayStart.isSame(periodEndDay, 'day'))
            );
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

        // 3. ФОРМИРОВАНИЕ КОЛОНОК
        let cols: string[] = [];
        let current = periodStartDay;

        const actualAggregationType = periodType === 'year' ? 'month' : periodType;

        if (actualAggregationType === "day") {
             while (current.isBefore(periodEndDay) || current.isSame(periodEndDay, "day")) {
                 cols.push(current.format("DD MMM"));
                 current = current.add(1, "day");
             }
        } else if (actualAggregationType === "week") {
             let currentWeekStart = periodStartDay.startOf('week');
             let weekNum = 1;
             while (currentWeekStart.isBefore(periodEndDay) || currentWeekStart.isSame(periodEndDay, "week")) {
                 cols.push(`W${weekNum}`);
                 currentWeekStart = currentWeekStart.add(1, 'week');
                 weekNum++;
             }
        } else if (actualAggregationType === "month") {
             let currentMonthStart = periodStartDay.startOf('month');
             while (currentMonthStart.isBefore(periodEndDay) || currentMonthStart.isSame(periodEndDay, "month")) {
                 cols.push(currentMonthStart.format("MMM"));
                 currentMonthStart = currentMonthStart.add(1, 'month');
             }
        } else if (actualAggregationType === "year") {
             let currentYearStart = periodStartDay.startOf('year');
             while (currentYearStart.isBefore(periodEndDay) || currentYearStart.isSame(periodEndDay, "year")) {
                 cols.push(currentYearStart.format("YYYY"));
                 currentYearStart = currentYearStart.add(1, 'year');
             }
        }
        setColumns(cols);

        const numPeriods = cols.length;
        if (numPeriods === 0) {
            setEnduranceZones([]);
            setMovementTypes([]);
            setDistanceByType([]);
            setLoading(false);
            return;
        }

        // 4. РАСЧЕТ ДАННЫХ ПО ПЕРИОДАМ
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
                zone: z as any,
                color: ZONE_COLORS[z],
                months: months,
            };
        });

        // >>> ИСПОЛЬЗУЕМ ВСЕ КЛЮЧИ ТИПОВ ДЛЯ ОТОБРАЖЕНИЯ ВСЕХ СТРОК <<<
        const allPossibleTypes = Object.keys(MOVEMENT_TYPE_MAP);

        // Расчет Movement Data (Время)
        const movementData = allPossibleTypes.map(t => {
            const typeName = MOVEMENT_TYPE_MAP[t] || t;
            const months = new Array(numPeriods).fill(0);

            workouts.forEach(w => {
                if (w.type === t) {
                    const d = dayjs(w.date);
                    if (d.isValid()) {
                        const index = getIndex(d);
                        if (index >= 0 && index < numPeriods) {
                            months[index] += (w.duration || 0);
                        }
                    }
                }
            });
            const total = months.reduce((a, b) => a + b, 0);

            return {
                type: typeName,
                months: months,
                total: total,
            };
        });

        // Расчет Distance Data (Дистанция)
        const distanceData = allPossibleTypes.map(t => {
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
            const total = months.reduce((a, b) => a + b, 0);

            return {
                type: typeName,
                months: months.map(v => Math.round(v)),
                total: Math.round(total),
            };
        });

        setEnduranceZones(enduranceData.map(z => ({ ...z, total: z.months.reduce((a, b) => a + b, 0) })));

        // Устанавливаем ВСЕ типы активности (даже с total=0), чтобы они отображались в таблице
        setMovementTypes(movementData);

        setDistanceByType(distanceData.map(d => ({
            ...d,
            color: DISTANCE_COLORS[d.type]
        })));

    } catch (err: any) {
        setError(err.message || "Ошибка загрузки данных");
    } finally {
        setLoading(false);
    }
  }, [dateRange, periodType, getIndex, navigate, dailyInfo]);


  React.useEffect(() => { loadData(); }, [loadData]);

  // Мемоизация и фильтрация данных для рендера
  const filteredEnduranceZones = React.useMemo(() => enduranceZones.map(z => ({ ...z, months: z.months.slice(0, columns.length) })), [enduranceZones, columns]);

  // MovementTypes теперь содержит ВСЕ типы, даже если total=0
  const filteredMovementTypes = React.useMemo(() => movementTypes.map(m => ({ ...m, months: m.months.slice(0, columns.length) })), [movementTypes, columns]);

  // DistanceByType теперь содержит ВСЕ типы
  const filteredDistanceTypes = React.useMemo(() => distanceByType.map(d => ({ ...d, months: d.months.slice(0, columns.length) })), [distanceByType, columns]);

  const activeDistanceTypes = React.useMemo(() => {
    // Для графика мы фильтруем только те типы, где есть данные
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

  /**
   * МЕТОД: Вычисление ежедневного параметра
   */
  const getDailyParam = React.useCallback((param: DailyParamKey | string, index: number) => {

    const isStatusParam = STATUS_PARAMS.some(p => p.id === param);
    const periodStartDay = dayjs(dateRange.startDate).startOf("day");
    const periodEndDay = dayjs(dateRange.endDate).endOf("day");

    const dailyKeys = Object.keys(dailyInfo);
    let relevantDates: string[] = [];

    const actualAggregationType = periodType === 'year' ? 'month' : periodType;

    if (actualAggregationType === "day") {
        const targetDate = periodStartDay.add(index, "day").format("YYYY-MM-DD");
        relevantDates = dailyKeys.filter(d => d === targetDate);
    } else if (actualAggregationType === "week") {
      const weekStart = periodStartDay.startOf("week").add(index, "week");
      const weekEnd = weekStart.endOf("week");
      relevantDates = dailyKeys.filter(d => dayjs(d).isBetween(weekStart, weekEnd, null, "[]") && dayjs(d).isBetween(periodStartDay, periodEndDay, null, "[]"));
    } else if (actualAggregationType === "month") {
      const monthStart = periodStartDay.startOf("month").add(index, "month");
      const monthEnd = monthStart.endOf("month");
      relevantDates = dailyKeys.filter(d => dayjs(d).isBetween(monthStart, monthEnd, null, "[]") && dayjs(d).isBetween(periodStartDay, periodEndDay, null, "[]"));
    } else { // year
      const yearStart = periodStartDay.startOf("year").add(index, "year");
      const yearEnd = yearStart.endOf("year");
      relevantDates = dailyKeys.filter(d => dayjs(d).isBetween(yearStart, yearEnd, null, "[]") && dayjs(d).isBetween(periodStartDay, periodEndDay, null, "[]"));
    }

    if (relevantDates.length === 0) return isStatusParam ? '' : "-";

    // 1. ЛОГИКА ДЛЯ СТАТУСНЫХ ПАРАМЕТРОВ
    if (isStatusParam) {
      const count = relevantDates.filter(d => dailyInfo[d].main_param === param).length;

      if (actualAggregationType === "day") {
          return count > 0 ? '+' : '';
      }
      return count > 0 ? `${count}` : '';
    }

    // 2. ЛОГИКА ДЛЯ ЧИСЛОВЫХ ПАРАМЕТРОВ (СРЕДНЕЕ)
    const values = relevantDates.map(d => dailyInfo[d][param as DailyParamKey]).filter(v => typeof v === 'number' && v !== 0);

    if (values.length === 0) return "-";

    const sum = values.reduce((s, v) => s + v, 0);

    return Math.round(sum / values.length);
  }, [dateRange, dailyInfo, periodType]);


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

  // Ждем загрузку профиля И основные данные
  if (loading || loadingProfile) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;
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
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-[#1f1f22] text-white px-3 py-1 rounded">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>

          {/* КНОПКИ ПЕРИОДА С ПОДСВЕТКОЙ */}
          {["day", "week", "month", "year"].map((type) => (
              <button
                  key={type}
                  onClick={() => handlePeriodChange(type as PeriodType)}
                  className={`px-3 py-1 rounded text-sm transition-colors
                              ${periodType === type
                                  ? "bg-blue-600 text-white"
                                  : "bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]"
                              }`}
              >
                  {type === "day" ? "День" : type === "week" ? "Неделя" : type === "month" ? "Месяц" : "Год"}
              </button>
          ))}

          <div className="relative">
            <button onClick={() => { setTempRange(dateRange); setShowDateRangePicker(true); }} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1"/> Выбрать период
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

          {/* ОТОБРАЖЕНИЕ ТЕКУЩЕГО ВЫБРАННОГО ПЕРИОДА */}
          <div className="ml-4 text-sm text-gray-400 p-1 border border-gray-700 rounded-md">
            Период: **{dayjs(dateRange.startDate).format("DD MMM YYYY")}** &ndash; **{dayjs(dateRange.endDate).format("DD MMM YYYY")}**
          </div>

        </div>

        {/* TOTALS */}
        <div>
          <h1 className="2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
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
            {/* График зон выносливости (Время) */}
            <EnduranceChart data={enduranceChartData} zones={filteredEnduranceZones} />

            {/* ТАБЛИЦА ПАРАМЕТРОВ ДНЯ */}
            <SyncedTable
              title="Параметры дня"
              rows={[
                ...STATUS_PARAMS.map(p => ({
                    param: p.label,
                    months: columns.map((_, i) => getDailyParam(p.id, i)),
                    total: "-",
                })),
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

            {/* Тип активности — ВРЕМЯ (Отображаются ВСЕ типы) */}
            <SyncedTable
              title="Тип активности"
              rows={filteredMovementTypes.map(m => ({
                param: m.type,
                months: m.months,
                total: m.total,
              }))}
              columns={columns}
              formatAsTime
              index={2}
              showBottomTotal={true}
              bottomRowName="Общее время"
            />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            {/* График дистанции по видам (Километры) */}
            <DistanceChart data={distanceChartData} types={activeDistanceTypes} />

            {/* ТАБЛИЦА: Удалено поле 'color' и отображаются ВСЕ типы */}
            <SyncedTable
              title="Дистанция по видам тренировок (км)"
              rows={filteredDistanceTypes.map(t => ({
                param: t.type,
                // color: t.color, // Удалено
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