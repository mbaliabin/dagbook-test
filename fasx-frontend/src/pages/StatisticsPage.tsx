import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  LogOut, Calendar, ChevronDown, Timer, MapPin, Zap, Target,
  ChevronLeft, ChevronRight, Activity
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
dayjs.extend(isoWeek);
dayjs.locale("ru");

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
  "Бег": "#f87171"
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
  const [showReportTypePicker, setShowReportTypePicker] = useState(false);
  const [periodType, setPeriodType] = useState<"day" | "week" | "month" | "year">("year");

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = useState<any[]>([]);
  const [movementTypes, setMovementTypes] = useState<any[]>([]);
  const [distanceByType, setDistanceByType] = useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = useState<any>({});

  const getIndex = useCallback((date: dayjs.Dayjs): number => {
    const start = dayjs(dateRange.startDate).startOf('day');
    const agg = periodType === 'year' ? 'month' : periodType;
    return date.startOf('day').diff(start, agg as any);
  }, [periodType, dateRange.startDate]);

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

      const dMap: any = {};
      dailyRaw.forEach((e: any) => { dMap[dayjs(e.date).format("YYYY-MM-DD")] = e; });
      setDailyInfo(dMap);

      const filtered = allWorkouts.filter((w: any) =>
        dayjs(w.date).isBetween(dayjs(dateRange.startDate).startOf('day'), dayjs(dateRange.endDate).endOf('day'), null, '[]')
      );

      const dur = filtered.reduce((s: number, w: any) => s + (w.duration || 0), 0);
      const rawDistTotal = filtered.reduce((s: number, w: any) => s + (w.distance || 0), 0);

      setTotals({
        trainingDays: new Set(filtered.map((w: any) => dayjs(w.date).format("YYYY-MM-DD"))).size,
        sessions: filtered.length,
        time: `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}`,
        distance: Number(rawDistTotal.toFixed(1))
      });

      let cols = [];
      let curr = dayjs(dateRange.startDate);
      const agg = periodType === 'year' ? 'month' : periodType;
      while (curr.isBefore(dayjs(dateRange.endDate)) || curr.isSame(dayjs(dateRange.endDate), agg as any)) {
        cols.push(agg === 'day' ? curr.format("DD MMM") : agg === 'week' ? `W${cols.length + 1}` : agg === 'month' ? curr.format("MMM") : curr.format("YYYY"));
        curr = curr.add(1, agg as any);
      }
      setColumns(cols);

      const numCols = cols.length;

      // ЗОНЫ
      const zonesData = ZONE_NAMES.map(z => {
        const ms = new Array(numCols).fill(0);
        filtered.forEach((w: any) => {
          const idx = getIndex(dayjs(w.date));
          if (idx >= 0 && idx < numCols) ms[idx] += (w[ZONE_KEYS[z]] || 0);
        });
        return { zone: z, color: ZONE_COLORS[z], months: ms, total: ms.reduce((a, b) => a + b, 0) };
      });
      setEnduranceZones(zonesData);

      // ДИСТАНЦИЯ: Исключаем Силовую и Другое (как в мобильной версии)
      const distData = Object.keys(MOVEMENT_TYPE_MAP)
        .filter(t => t !== "StrengthTraining" && t !== "Other")
        .map(t => {
          const ms = new Array(numCols).fill(0);
          filtered.forEach((w: any) => {
            if (w.type === t) {
              const idx = getIndex(dayjs(w.date));
              if (idx >= 0 && idx < numCols) ms[idx] += (w.distance || 0);
            }
          });
          const rowSum = ms.reduce((a, b) => a + b, 0);
          return {
            type: MOVEMENT_TYPE_MAP[t],
            months: ms.map(v => Number(v.toFixed(1))),
            total: Number(rowSum.toFixed(1)),
            color: DISTANCE_COLORS[MOVEMENT_TYPE_MAP[t]] || "#94a3b8"
          };
        });
      setDistanceByType(distData);

      // ВРЕМЯ (здесь оставляем все типы)
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

  const getDailyParam = (param: string, index: number) => {
    const start = dayjs(dateRange.startDate).startOf("day").add(index, periodType === 'year' ? 'month' : periodType);
    const end = start.endOf(periodType === 'year' ? 'month' : periodType);
    const relevant = Object.keys(dailyInfo).filter(d => dayjs(d).isBetween(start, end, null, "[]"));

    if (relevant.length === 0) return "-";
    const isStatus = STATUS_PARAMS.some(p => p.id === param);

    if (isStatus) {
      const count = relevant.filter(d => dailyInfo[d].main_param === param).length;
      if (count === 0) return "-";
      return periodType === 'day' ? '+' : count;
    }
    return "-";
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: Activity, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => navigate("/account")}>
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#131316] transition-transform group-hover:scale-105 border border-white/0 group-hover:border-white/10">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 font-bold text-white text-lg">
                  {profile?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1 group-hover:text-blue-400 transition-colors">
                {profile?.name || "Пользователь"}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar size={12} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Statistics analysis</p>
              </div>
            </div>
          </div>

          <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1a1a1d] border border-gray-800 hover:border-red-500/50 hover:text-red-400 text-gray-400 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all">
            <LogOut className="w-4 h-4 mr-2"/> Выйти
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#131316] border border-white/[0.03] py-2 px-4 rounded-xl shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all py-1 w-24 ${isActive ? "text-blue-500" : "text-gray-600 hover:text-gray-300"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}/>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em]`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-4 bg-[#131316] p-3 rounded-xl border border-white/[0.03] shadow-xl">
          <div className="flex items-center bg-black/40 rounded-lg border border-white/[0.05] p-1">
            <button onClick={() => {
                const newMonth = selectedMonth.subtract(1, 'month');
                setSelectedMonth(newMonth);
                setDateRange({ startDate: newMonth.startOf('month').toDate(), endDate: newMonth.endOf('month').toDate() });
            }} className="p-1.5 hover:text-blue-500 transition-colors text-gray-400"><ChevronLeft size={18}/></button>
            <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[130px] text-center text-gray-300">{selectedMonth.format('MMM YYYY')}</span>
            <button onClick={() => {
                const newMonth = selectedMonth.add(1, 'month');
                setSelectedMonth(newMonth);
                setDateRange({ startDate: newMonth.startOf('month').toDate(), endDate: newMonth.endOf('month').toDate() });
            }} className="p-1.5 hover:text-blue-500 transition-colors text-gray-400"><ChevronRight size={18}/></button>
          </div>

          <div className="relative">
            <button onClick={() => setShowReportTypePicker(!showReportTypePicker)}
              className={`flex items-center gap-4 text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg border transition-all ${showReportTypePicker ? 'border-blue-500 bg-blue-600 text-white' : 'border-white/[0.05] bg-[#1a1a1d] text-gray-400 hover:border-white/10'}`}>
              {reportType} <ChevronDown size={14} className={`transition-transform duration-300 ${showReportTypePicker ? 'rotate-180' : ''}`} />
            </button>
            {showReportTypePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowReportTypePicker(false)} />
                <div className="absolute z-50 mt-3 left-0 bg-[#0f0f11] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden w-[220px]">
                  {["Общий отчет", "Общая дистанция"].map((type) => (
                    <button key={type} onClick={() => { setReportType(type); setShowReportTypePicker(false); }}
                      className={`w-full text-left px-5 py-3.5 text-[9px] font-black uppercase tracking-widest transition-all ${reportType === type ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex bg-black/40 p-1 rounded-lg border border-white/[0.05]">
            {["day", "week", "month", "year"].map((t) => (
              <button key={t} onClick={() => setPeriodType(t as any)} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${periodType === t ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-300"}`}>
                {t === "day" ? "День" : t === "week" ? "Нед" : t === "month" ? "Мес" : "Год"}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <button onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border transition-all ${showDateRangePicker ? 'border-blue-500 bg-blue-600 text-white' : 'border-white/[0.05] bg-[#1a1a1d] text-gray-400 hover:border-white/10'}`}>
              <CalendarDays size={14} /> {`${dayjs(dateRange.startDate).format('DD.MM')} — ${dayjs(dateRange.endDate).format('DD.MM')}`} <ChevronDown size={14} />
            </button>
            {showDateRangePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDateRangePicker(false)} />
                <div className="absolute z-50 mt-3 right-0 bg-[#0f0f11] border border-white/[0.08] rounded-xl shadow-2xl p-4 w-[330px]">
                  <DateRange
                    onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
                    ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: 'selection' }]}
                    locale={ru} rangeColors={['#3b82f6']} showDateDisplay={false}
                  />
                  <button onClick={() => setShowDateRangePicker(false)} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest">Применить</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Тренировочные дни', val: totals.trainingDays, icon: CalendarDays },
            { label: 'Всего сессий', val: totals.sessions, icon: Zap },
            { label: 'Общее время', val: totals.time, icon: Timer },
            { label: 'Дистанция (км)', val: `${totals.distance}`, icon: MapPin },
          ].map((stat, i) => (
            <div key={i} className="bg-[#131316] border border-white/[0.03] p-5 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <stat.icon size={14} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight italic">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="space-y-8">
          {reportType === "Общий отчет" ? (
            <>
              <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-8 shadow-xl">
                <EnduranceChart data={columns.map((col, i) => {
                  const obj: any = { month: col };
                  enduranceZones.forEach(z => obj[z.zone] = z.months[i]);
                  return obj;
                })} zones={enduranceZones} />
              </div>

              <div className="grid gap-8">
                <div className="bg-[#131316] border border-white/[0.03] rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                    <Activity size={14} className="text-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest">Параметры дня</span>
                  </div>
                  <SyncedTable
                    rows={STATUS_PARAMS.map(p => {
                      const rowMonths = columns.map((_, i) => getDailyParam(p.id, i));
                      const rowTotal = rowMonths.reduce((acc: number, val: any) => {
                        if (val === "+") return acc + 1;
                        if (typeof val === "number") return acc + val;
                        return acc;
                      }, 0);
                      return { param: p.label, months: rowMonths, total: rowTotal > 0 ? rowTotal : "-" };
                    })}
                    columns={columns} index={0} showBottomTotal={false}
                  />
                </div>

                <div className="bg-[#131316] border border-white/[0.03] rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                    <Target size={14} className="text-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest">Зоны выносливости</span>
                  </div>
                  <SyncedTable rows={enduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total }))} columns={columns} formatAsTime index={1} showBottomTotal={true} />
                </div>

                <div className="bg-[#131316] border border-white/[0.03] rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                    <Timer size={14} className="text-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest">Тип активности (время)</span>
                  </div>
                  <SyncedTable rows={movementTypes.map(m => ({ param: m.type, months: m.months, total: m.total }))} columns={columns} formatAsTime index={2} showBottomTotal={true} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-8 shadow-xl">
                <DistanceChart data={columns.map((col, i) => {
                  const obj: any = { month: col };
                  distanceByType.forEach(d => obj[d.type] = d.months[i]);
                  return obj;
                })} types={distanceByType.filter(d => d.total > 0).map(d => d.type)} />
              </div>
              <div className="bg-[#131316] border border-white/[0.03] rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500"/><span className="text-[10px] font-black uppercase tracking-widest">Дистанция по видам (км)</span>
                </div>
                <SyncedTable rows={distanceByType.map(t => ({ param: t.type, months: t.months, total: t.total }))} columns={columns} index={0} showBottomTotal={true} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}