import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, Calendar, ChevronDown, Timer, MapPin, Zap, Target
} from "lucide-react";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// API & Components
import { getUserProfile } from "../api/getUserProfile";
import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

// --- КОНСТАНТЫ ---
const ZONE_COLORS: Record<string, string> = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
const ZONE_KEYS: Record<string, string> = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };
const ZONE_NAMES = ["I1", "I2", "I3", "I4", "I5"];
const MOVEMENT_TYPE_MAP: Record<string, string> = {
  XC_Skiing_Skate: "Лыжи, свободный стиль",
  XC_Skiing_Classic: "Лыжи, классический стиль",
  RollerSki_Classic: "Лыжероллеры, классика",
  RollerSki_Skate: "Лыжероллеры, конек",
  Bike: "Велосипед",
  Running: "Бег",
  StrengthTraining: "Силовая",
  Other: "Другое",
};
const DISTANCE_COLORS: Record<string, string> = {
  "Лыжи, свободный стиль": "#4ade80",
  "Лыжи, классический стиль": "#22d3ee",
  "Лыжероллеры, классика": "#facc15",
  "Лыжероллеры, конек": "#fb923c",
  "Велосипед": "#3b82f6",
};
const STATUS_PARAMS = [
    { id: 'skadet', label: 'Травма' },
    { id: 'syk', label: 'Болезнь' },
    { id: 'paReise', label: 'В пути' },
    { id: 'hoydedogn', label: 'Смена пояса' },
    { id: 'fridag', label: 'Выходной' },
    { id: 'konkurranse', label: 'Старт' },
];

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [reportType, setReportType] = useState("Общий отчет");
  const [periodType, setPeriodType] = useState<"day" | "week" | "month" | "year">("year");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Данные расчетов
  const [totals, setTotals] = useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = useState<any[]>([]);
  const [movementTypes, setMovementTypes] = useState<any[]>([]);
  const [distanceByType, setDistanceByType] = useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = useState<any>({});

  // Вспомогательная функция индекса (твоя логика)
  const getIndex = useCallback((date: dayjs.Dayjs): number => {
    const start = dayjs(dateRange.startDate).startOf('day');
    const agg = periodType === 'year' ? 'month' : periodType;
    return date.startOf('day').diff(start, agg as any);
  }, [periodType, dateRange.startDate]);

  // ГЛАВНАЯ ФУНКЦИЯ ЗАГРУЗКИ (Твоя логика + новый UI)
  const loadAllData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const [prof, workoutsRes, dailyRes] = await Promise.all([
        getUserProfile(),
        fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setProfile(prof);
      const allWorkouts = await workoutsRes.json();
      const dailyRaw = await dailyRes.json();

      // Мапим Daily Info
      const dMap: any = {};
      dailyRaw.forEach((e: any) => { dMap[dayjs(e.date).format("YYYY-MM-DD")] = e; });
      setDailyInfo(dMap);

      // Фильтр тренировок
      const filtered = allWorkouts.filter((w: any) =>
        dayjs(w.date).isBetween(dayjs(dateRange.startDate).startOf('day'), dayjs(dateRange.endDate).endOf('day'), null, '[]')
      );

      // Итоги
      const dur = filtered.reduce((s: number, w: any) => s + (w.duration || 0), 0);
      setTotals({
        trainingDays: new Set(filtered.map((w: any) => dayjs(w.date).format("YYYY-MM-DD"))).size,
        sessions: filtered.length,
        time: `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}`,
        distance: Math.round(filtered.reduce((s: number, w: any) => s + (w.distance || 0), 0))
      });

      // Формируем колонки таблицы
      let cols = [];
      let curr = dayjs(dateRange.startDate);
      const agg = periodType === 'year' ? 'month' : periodType;
      while (curr.isBefore(dayjs(dateRange.endDate)) || curr.isSame(dayjs(dateRange.endDate), agg as any)) {
        cols.push(agg === 'day' ? curr.format("DD MMM") : agg === 'week' ? `W${cols.length + 1}` : agg === 'month' ? curr.format("MMM") : curr.format("YYYY"));
        curr = curr.add(1, agg as any);
      }
      setColumns(cols);

      // Расчет зон и типов (Endurance & Distance)
      const numCols = cols.length;
      const zonesData = ZONE_NAMES.map(z => {
        const ms = new Array(numCols).fill(0);
        filtered.forEach((w: any) => {
          const idx = getIndex(dayjs(w.date));
          if (idx >= 0 && idx < numCols) ms[idx] += (w[ZONE_KEYS[z]] || 0);
        });
        return { zone: z, color: ZONE_COLORS[z], months: ms, total: ms.reduce((a, b) => a + b, 0) };
      });
      setEnduranceZones(zonesData);

      const distData = Object.keys(MOVEMENT_TYPE_MAP).map(t => {
        const ms = new Array(numCols).fill(0);
        filtered.forEach((w: any) => {
          if (w.type === t) {
            const idx = getIndex(dayjs(w.date));
            if (idx >= 0 && idx < numCols) ms[idx] += (w.distance || 0);
          }
        });
        return { type: MOVEMENT_TYPE_MAP[t], months: ms.map(v => Math.round(v)), total: Math.round(ms.reduce((a, b) => a + b, 0)), color: DISTANCE_COLORS[MOVEMENT_TYPE_MAP[t]] };
      });
      setDistanceByType(distData);

      // Movement Types (Время)
      const moveData = Object.keys(MOVEMENT_TYPE_MAP).map(t => {
        const ms = new Array(numCols).fill(0);
        filtered.forEach((w: any) => {
          if (w.type === t) {
            const idx = getIndex(dayjs(w.date));
            if (idx >= 0 && idx < numCols) ms[idx] += (w.duration || 0);
          }
        });
        return { type: MOVEMENT_TYPE_MAP[t], months: ms, total: ms.reduce((a, b) => a + b, 0) };
      });
      setMovementTypes(moveData);

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [dateRange, periodType, getIndex, navigate]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Вспомогательная функция для Daily Param (твоя логика)
  const getDailyParam = (param: string, index: number) => {
    const start = dayjs(dateRange.startDate).startOf("day").add(index, periodType === 'year' ? 'month' : periodType);
    const end = start.endOf(periodType === 'year' ? 'month' : periodType);
    const relevant = Object.keys(dailyInfo).filter(d => dayjs(d).isBetween(start, end, null, "[]"));

    if (relevant.length === 0) return "-";
    const isStatus = STATUS_PARAMS.some(p => p.id === param);

    if (isStatus) {
      const count = relevant.filter(d => dailyInfo[d].main_param === param).length;
      return count > 0 ? (periodType === 'day' ? '+' : count) : '';
    }
    return "-"; // Для краткости оставил только статусы
  };

  // Данные для графиков
  const enduranceChartData = useMemo(() => columns.map((col, i) => {
    const obj: any = { month: col };
    enduranceZones.forEach(z => obj[z.zone] = z.months[i]);
    return obj;
  }), [columns, enduranceZones]);

  const distanceChartData = useMemo(() => columns.map((col, i) => {
    const obj: any = { month: col };
    distanceByType.forEach(d => obj[d.type] = d.months[i]);
    return obj;
  }), [columns, distanceByType]);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : (profile?.name?.charAt(0) || "U")}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-all font-semibold shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1f1f22] border border-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-colors">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl mb-6 shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-xs transition-colors py-1 w-20 ${isActive ? "text-blue-500 font-bold" : "text-gray-500 hover:text-white"}`}>
                <Icon className="w-5 h-5 mb-1"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div className="bg-[#1a1a1d] border border-gray-800 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="bg-[#0f0f0f] border border-gray-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg outline-none">
              <option>Общий отчет</option>
              <option>Общая дистанция</option>
            </select>
            <div className="flex bg-[#0f0f0f] p-1 rounded-lg border border-gray-700">
              {["day", "week", "month", "year"].map((t) => (
                <button key={t} onClick={() => setPeriodType(t as any)} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${periodType === t ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-white"}`}>
                  {t === "day" ? "День" : t === "week" ? "Неделя" : t === "month" ? "Месяц" : "Год"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(!showDateRangePicker)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d]">
              <Calendar size={14} className="text-blue-500" />
              {dayjs(dateRange.startDate).format("DD.MM.YY")} - {dayjs(dateRange.endDate).format("DD.MM.YY")}
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 right-0 bg-[#1a1a1d] border border-gray-800 rounded-2xl shadow-2xl p-4">
                <DateRange ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]} onChange={(i: any) => setDateRange({ startDate: i.selection.startDate, endDate: i.selection.endDate })} locale={ru} rangeColors={["#3b82f6"]} />
                <button onClick={() => setShowDateRangePicker(false)} className="w-full mt-4 bg-blue-600 py-2 rounded-lg font-bold text-white">Применить</button>
              </div>
            )}
          </div>
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Тренировочные дни', val: totals.trainingDays, icon: CalendarDays },
            { label: 'Всего сессий', val: totals.sessions, icon: Zap },
            { label: 'Общее время', val: totals.time, icon: Timer },
            { label: 'Дистанция (км)', val: totals.distance, icon: MapPin },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1d] border border-gray-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <stat.icon size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* CHARTS & TABLES */}
        <div className="space-y-6">
          {reportType === "Общий отчет" ? (
            <>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><EnduranceChart data={enduranceChartData} zones={enduranceZones} /></div>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Параметры дня" rows={STATUS_PARAMS.map(p => ({ param: p.label, months: columns.map((_, i) => getDailyParam(p.id, i)), total: "-" }))} columns={columns} index={0} showBottomTotal={false} />
              </div>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Зоны выносливости" rows={enduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total }))} columns={columns} formatAsTime index={1} showBottomTotal={true} />
              </div>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Тип активности (время)" rows={movementTypes.map(m => ({ param: m.type, months: m.months, total: m.total }))} columns={columns} formatAsTime index={2} showBottomTotal={true} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><DistanceChart data={distanceChartData} types={distanceByType.filter(d => d.total > 0).map(d => d.type)} /></div>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Дистанция по видам (км)" rows={distanceByType.map(t => ({ param: t.type, months: t.months, total: t.total }))} columns={columns} index={0} showBottomTotal={true} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}