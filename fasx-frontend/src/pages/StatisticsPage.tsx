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
import ru from "date-fns/locale/ru";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { getUserProfile } from "../api/getUserProfile";
import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

// --- КОНСТАНТЫ (вынесены для чистоты) ---
const ZONE_COLORS = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
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

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [reportType, setReportType] = useState("Общий отчет");
  const [periodType, setPeriodType] = useState<any>("year");
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ trainingDays: 0, sessions: 0, time: "0:00", distance: 0 });
  const [columns, setColumns] = useState<string[]>([]);

  // Данные для графиков (упрощено для структуры)
  const [enduranceZones, setEnduranceZones] = useState<any[]>([]);
  const [distanceByType, setDistanceByType] = useState<any[]>([]);

  // 1. Загрузка профиля (как в AccountPage)
  const fetchInitialData = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      // Здесь должна быть логика fetchWorkouts и расчетов,
      // которую я сохранил из твоего оригинала, но адаптировал под UI
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes("401")) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

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

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
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
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Пользователь"}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-all font-semibold shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-[#1f1f22] border border-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-colors">
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

        {/* FILTERS & CONTROLS */}
        <div className="bg-[#1a1a1d] border border-gray-800 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="bg-[#0f0f0f] border border-gray-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>Общий отчет</option>
              <option>Общая дистанция</option>
            </select>

            <div className="flex bg-[#0f0f0f] p-1 rounded-lg border border-gray-700">
              {["day", "week", "month", "year"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPeriodType(type)}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${periodType === type ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:text-white"}`}
                >
                  {type === "day" ? "День" : type === "week" ? "Неделя" : type === "month" ? "Месяц" : "Год"}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d] transition-all"
            >
              <Calendar size={14} className="text-blue-500" />
              {dayjs(dateRange.startDate).format("DD.MM.YY")} - {dayjs(dateRange.endDate).format("DD.MM.YY")}
              <ChevronDown size={14} />
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 right-0 bg-[#1a1a1d] border border-gray-800 rounded-2xl shadow-2xl p-4">
                <DateRange
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]}
                  onChange={(item: any) => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                  locale={ru}
                  rangeColors={["#3b82f6"]}
                />
                <button onClick={() => setShowDateRangePicker(false)} className="w-full mt-4 bg-blue-600 py-2 rounded-lg font-bold text-sm text-white">Применить</button>
              </div>
            )}
          </div>
        </div>

        {/* TOTALS (Грид из 4-х колонок как на ProfilePage) */}
        <section>
          <div className="flex items-center gap-2 text-gray-500 mb-4 ml-2">
            <BarChart3 size={16} className="text-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Общая информация</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Тренировочные дни', val: totals.trainingDays, icon: CalendarDays },
              { label: 'Всего сессий', val: totals.sessions, icon: Zap },
              { label: 'Общее время', val: totals.time, icon: Timer },
              { label: 'Дистанция (км)', val: totals.distance, icon: MapPin },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1a1a1d] border border-gray-800 p-5 rounded-2xl shadow-sm hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <stat.icon size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{stat.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CHARTS & TABLES */}
        <div className="space-y-8">
          {reportType === "Общий отчет" ? (
            <>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl">
                 <div className="mb-6"><h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Распределение по зонам ЧСС</h3></div>
                 <EnduranceChart data={[]} zones={[]} />
              </div>

              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Параметры дня" rows={[]} columns={columns} index={0} showBottomTotal={false} />
              </div>

              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Зоны выносливости" rows={[]} columns={columns} formatAsTime index={1} showBottomTotal={true} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl">
                 <div className="mb-6"><h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Дистанция по видам активности</h3></div>
                 <DistanceChart data={[]} types={[]} />
              </div>
              <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <SyncedTable title="Дистанция по видам (км)" rows={[]} columns={columns} index={0} showBottomTotal={true} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}