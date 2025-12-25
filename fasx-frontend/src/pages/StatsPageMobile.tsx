import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import {
  BarChart3, ClipboardList, CalendarDays,
  LogOut, Timer, MapPin, Zap, Target,
  ChevronLeft, ChevronRight, Activity, X, ChevronDown
} from "lucide-react";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// API & Components
import { getUserProfile } from "../api/getUserProfile";
import { EnduranceChart } from "../components/StatisticsPage/EnduranceChartMobile";
import { DistanceChart } from "../components/StatisticsPage/DistanceChartMobile";
import { SyncedTable } from "../components/StatisticsPage/SyncedTableMobile";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.locale("ru");

const ZONE_COLORS: Record<string, string> = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
const ZONE_KEYS: Record<string, string> = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };
const ZONE_NAMES = ["I1", "I2", "I3", "I4", "I5"];
const MOVEMENT_TYPE_MAP: Record<string, string> = {
  XC_Skiing_Skate: "Лыжи, св.", XC_Skiing_Classic: "Лыжи, кл.",
  RollerSki_Classic: "Роллеры, кл.", RollerSki_Skate: "Роллеры, кн.",
  Bike: "Вело", Running: "Бег", StrengthTraining: "Сила", Other: "Другое",
};

const NON_DISTANCE_TYPES = ["Сила", "ОФП", "Растяжка", "Йога", "Другое"];

const STATUS_PARAMS = [
    { id: 'skadet', label: 'Травма' }, { id: 'syk', label: 'Болезнь' },
    { id: 'paReise', label: 'В пути' }, { id: 'hoydedogn', label: 'Смена пояса' },
    { id: 'fridag', label: 'Выходной' }, { id: 'konkurranse', label: 'Старт' },
];

const REPORT_TYPES = [
  { id: "zones", label: "Общий отчет" },
  { id: "distance", label: "Анализ дистанции" },
];

export default function StatsPageMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [activeReport, setActiveReport] = useState("zones");
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [grouping, setGrouping] = useState<"day" | "week" | "month" | "year">("month");

  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });

  const [loading, setLoading] = useState(true);
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);

  const [totals, setTotals] = useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = useState<any[]>([]);
  const [movementTypes, setMovementTypes] = useState<any[]>([]);
  const [distanceByType, setDistanceByType] = useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = useState<any>({});

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getIndex = useCallback((date: dayjs.Dayjs): number => {
    const start = dayjs(dateRange.startDate).startOf('day');
    return date.diff(start, grouping);
  }, [grouping, dateRange.startDate]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const [prof, workoutsRes, dailyRes] = await Promise.all([
        getUserProfile(),
        fetch(`${BASE_URL}/api/workouts/user`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`, { headers: { Authorization: `Bearer ${token}` } })
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

      // ИТОГО В КАРТОЧКАХ: Один знак, если нужно. Например 1631.4 или 1631
      const totalDist = filtered.reduce((s: number, w: any) => s + (w.distance || 0), 0);
      setTotals({
        trainingDays: new Set(filtered.map((w: any) => dayjs(w.date).format("YYYY-MM-DD"))).size,
        sessions: filtered.length,
        time: `${Math.floor(dur / 60)}ч ${dur % 60}м`,
        distance: Number(totalDist.toFixed(1))
      });

      let cols = [];
      let curr = dayjs(dateRange.startDate);
      while (curr.isBefore(dayjs(dateRange.endDate)) || curr.isSame(dayjs(dateRange.endDate), grouping)) {
        if (grouping === 'day') cols.push(curr.format("DD.MM"));
        else if (grouping === 'week') cols.push(`W${curr.isoWeek()}`);
        else if (grouping === 'month') cols.push(curr.format("MMM"));
        else if (grouping === 'year') cols.push(curr.format("YYYY"));
        curr = curr.add(1, grouping);
        if (cols.length > 400) break;
      }
      setColumns(cols);

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

      // --- ТАБЛИЦА ДИСТАНЦИИ: Округление до 1 знака без нулей ---
      const distData = Object.keys(MOVEMENT_TYPE_MAP)
        .filter(t => !NON_DISTANCE_TYPES.includes(MOVEMENT_TYPE_MAP[t]))
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
            // Округляем до 1 знака и убираем лишний ноль через Number()
            months: ms.map(v => Number(v.toFixed(1))),
            total: Number(rowSum.toFixed(1))
          };
        })
        .filter(d => d.total > 0);

      setDistanceByType(distData);

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
  }, [dateRange, grouping, getIndex, navigate, BASE_URL]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const getDailyParam = (param: string, index: number) => {
    const start = dayjs(dateRange.startDate).startOf("day").add(index, grouping);
    const end = start.endOf(grouping);
    const relevant = Object.keys(dailyInfo).filter(d => dayjs(d).isBetween(start, end, null, "[]"));
    if (relevant.length === 0) return "-";
    const count = relevant.filter(d => dailyInfo[d].main_param === param).length;
    return count === 0 ? "-" : (grouping === 'day' ? "+" : count);
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планы", icon: ClipboardList, path: "/planning" },
    { label: "Статы", icon: Activity, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 pb-32 font-sans overflow-x-hidden">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-md border-b border-white/[0.03] px-3 py-2 flex items-center gap-2">
          <div className="shrink-0" onClick={() => navigate("/account")}>
            <div className="w-8 h-8 rounded-full border border-white/10 bg-blue-600 flex items-center justify-center overflow-hidden active:scale-90 transition-transform">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : <span className="text-white text-[10px] font-black">{profile?.name?.charAt(0)}</span>}
            </div>
          </div>

          <div
            className="flex-1 flex items-center gap-2 bg-[#131316] border border-white/[0.05] p-2 rounded-xl active:bg-white/[0.02] transition-colors overflow-hidden"
            onClick={() => setShowCalendarSheet(true)}
          >
            <CalendarDays size={14} className="text-blue-500 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate">
                {dayjs(dateRange.startDate).format('DD MMM')} — {dayjs(dateRange.endDate).format('DD MMM YYYY')}
              </span>
              <span className="text-[6px] font-bold text-gray-500 uppercase leading-none">Диапазон анализа</span>
            </div>
            <ChevronDown size={12} className="text-gray-600 ml-auto shrink-0" />
          </div>

          <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="p-2 text-gray-600 active:text-red-500 transition-colors shrink-0">
            <LogOut size={16} />
          </button>
      </div>

      <div className="p-3 space-y-4">
        {/* ПЕРЕКЛЮЧАТЕЛИ */}
        <div className="bg-[#131316] border border-white/[0.03] rounded-2xl p-2.5 space-y-2.5 shadow-xl">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.05]">
            {["day", "week", "month", "year"].map((t) => (
              <button key={t} onClick={() => setGrouping(t as any)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${grouping === t ? "bg-blue-600 text-white shadow-lg" : "text-gray-600"}`}>
                {t === "day" ? "День" : t === "week" ? "Нед" : t === "month" ? "Мес" : "Год"}
              </button>
            ))}
          </div>

          <div className="relative">
            <button onClick={() => setShowReportMenu(!showReportMenu)} className="w-full flex items-center justify-between bg-white/[0.02] border border-white/[0.05] px-4 py-3 rounded-xl active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{REPORT_TYPES.find(r => r.id === activeReport)?.label}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-600 transition-transform ${showReportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showReportMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowReportMenu(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 origin-top">
                  {REPORT_TYPES.map((type) => (
                    <button key={type.id} onClick={() => { setActiveReport(type.id); setShowReportMenu(false); }} className={`w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.03] last:border-0 active:bg-blue-600/10 transition-colors ${activeReport === type.id ? "bg-white/[0.03]" : ""}`}>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${activeReport === type.id ? "text-blue-500" : "text-gray-400"}`}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Тренировки', val: totals.sessions, icon: Zap, color: 'text-blue-500' },
            { label: 'Дистанция', val: `${totals.distance} км`, icon: MapPin, color: 'text-emerald-500' },
            { label: 'Дни', val: totals.trainingDays, icon: CalendarDays, color: 'text-purple-500' },
            { label: 'Время', val: totals.time, icon: Timer, color: 'text-amber-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#131316] border border-white/[0.03] p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <stat.icon size={11} className={stat.color} />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
              </div>
              <div className="text-sm font-black text-white italic truncate">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        {activeReport === "zones" ? (
          <div className="space-y-4">
            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl p-5 shadow-xl overflow-hidden">
              <div className="h-48 w-full">
                <EnduranceChart data={columns.map((col, i) => {
                  const obj: any = { month: col };
                  enduranceZones.forEach(z => obj[z.zone] = z.months[i]);
                  return obj;
                })} zones={enduranceZones} />
              </div>
            </div>

            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 border-b border-white/[0.05] flex items-center gap-2 bg-white/[0.01]">
                <Activity size={11} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Параметры дня</span>
              </div>
              <SyncedTable
                rows={STATUS_PARAMS.map(p => {
                    const rowVals = columns.map((_, i) => getDailyParam(p.id, i));
                    const totalCount = rowVals.reduce((acc: number, v: any) => {
                        if (v === "+") return acc + 1;
                        if (typeof v === "number") return acc + v;
                        return acc;
                    }, 0);
                    return { param: p.label, months: rowVals, total: totalCount > 0 ? totalCount : "-" };
                })}
                columns={columns} index={0} showBottomTotal={false}
              />
            </div>

            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 border-b border-white/[0.05] flex items-center gap-2 bg-white/[0.01]">
                <Target size={11} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Зоны выносливости</span>
              </div>
              <SyncedTable rows={enduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total }))} columns={columns} formatAsTime index={1} showBottomTotal={true} />
            </div>

            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 border-b border-white/[0.05] flex items-center gap-2 bg-white/[0.01]">
                <Timer size={11} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Тип активности (время)</span>
              </div>
              <SyncedTable rows={movementTypes.map(m => ({ param: m.type, months: m.months, total: m.total }))} columns={columns} formatAsTime index={2} showBottomTotal={true} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl p-5 shadow-xl overflow-hidden">
              <div className="h-48 w-full">
                <DistanceChart
                  data={columns.map((col, i) => {
                    const obj: any = { month: col };
                    distanceByType.forEach(d => obj[d.type] = d.months[i]);
                    return obj;
                  })}
                  types={distanceByType.map(d => d.type)}
                />
              </div>
            </div>

            <div className="bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 border-b border-white/[0.05] flex items-center gap-2 bg-white/[0.01]">
                <MapPin size={11} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Дистанция по видам (км)</span>
              </div>
              <SyncedTable
                rows={distanceByType.map(t => ({ param: t.type, months: t.months, total: t.total }))}
                columns={columns}
                index={0}
                showBottomTotal={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* ШТОРКА КАЛЕНДАРЯ */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${showCalendarSheet ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCalendarSheet(false)} />
        <div className={`absolute bottom-0 left-0 right-0 w-full bg-[#1a1a1e] rounded-t-[32px] border-t border-white/10 transition-transform duration-500 ${showCalendarSheet ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-white/10 rounded-full" /></div>
          <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-white">Выбор диапазона</h4>
            <button onClick={() => setShowCalendarSheet(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-gray-400 active:scale-90 transition-transform"><X size={16} /></button>
          </div>
          <div className="p-4 flex justify-center mobile-date-range-wrapper min-h-[380px]">
            <DateRange
              onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
              ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: 'selection' }]}
              locale={ru} rangeColors={['#3b82f6']} showDateDisplay={false} months={1} direction="vertical"
            />
          </div>
          <div className="p-6 bg-white/[0.02] border-t border-white/5 pb-10">
            <button onClick={() => { setShowCalendarSheet(false); loadAllData(); }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all">Применить изменения</button>
          </div>
        </div>
      </div>

      {/* BOTTOM MENU */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-[#131316]/95 backdrop-blur-md border border-white/10 p-1 rounded-xl flex justify-around shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all ${isActive ? "bg-blue-600/10 text-blue-500" : "text-gray-600"}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}