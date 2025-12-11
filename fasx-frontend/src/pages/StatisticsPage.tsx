// src/pages/StatisticsPage/StatsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "dayjs/locale/ru";
import { DateRange } from "react-date-range";
import ru from "date-fns/locale/ru";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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

import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";
import { getStatistics, DailyStats } from "../../services/statisticsService";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportType, setReportType] = useState("Общий отчет");
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // --- Загрузка данных с API ---
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStatistics(
          dateRange.startDate.toISOString(),
          dateRange.endDate.toISOString()
        );
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  // --- Общие показатели ---
  const totalDistance = stats.reduce((sum, s) => sum + s.distance, 0);
  const totalDuration = stats.reduce((sum, s) => sum + s.duration, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const totalTrainingDays = stats.reduce((sum, s) => sum + s.trainingDays, 0);
  const totalSessions = stats.reduce((sum, s) => sum + s.sessions, 0);

  // --- Подготовка данных для графиков ---
  const filteredMonths = stats.map(s => dayjs(s.date).format("MMM"));

  const enduranceChartData = stats.map(s => ({
    month: dayjs(s.date).format("MMM"),
    ...Object.fromEntries(s.enduranceZones.map(z => [z.zone, z.value])),
  }));

  const distanceChartData = stats.map(s => ({
    month: dayjs(s.date).format("MMM"),
    ...Object.fromEntries(s.activityTypes.map(a => [a.type, a.distance])),
  }));

  const distanceColors: Record<string,string> = {
    "Лыжи / скейтинг":"#4ade80",
    "Лыжи, классика":"#22d3ee",
    "Роллеры, классика":"#facc15",
    "Роллеры, скейтинг":"#fb923c",
    "Велосипед":"#3b82f6",
  };

  const activeDistanceTypes = distanceChartData.length
    ? Object.keys(distanceChartData[0]).filter(k => k !== "month")
    : [];

  // --- Функции ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { label:"Главная", icon:Home, path:"/daily" },
    { label:"Тренировки", icon:BarChart3, path:"/profile" },
    { label:"Планирование", icon:ClipboardList, path:"/planning" },
    { label:"Статистика", icon:CalendarDays, path:"/statistics" },
  ];

  if (loading) return <p>Загрузка статистики...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
            <h1 className="text-2xl font-bold text-white">Пользователь</h1>
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
          {menuItems.map((item)=>{
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <button key={item.path} onClick={()=>navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive?"text-blue-500":"text-gray-400 hover:text-white"}`}>
              <Icon className="w-6 h-6"/>
              <span>{item.label}</span>
            </button>;
          })}
        </div>

        {/* TOTALS */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totalTrainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totalSessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{hours}:{minutes.toString().padStart(2, "0")}</p></div>
            <div><p className="text-gray-400">Общее расстояние (км)</p><p className="text-xl text-gray-100">{totalDistance.toFixed(1)}</p></div>
          </div>
        </div>

        {/* ГРАФИКИ И ТАБЛИЦЫ */}
        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={[]} />
            <SyncedTable
              title="Зоны выносливости"
              rows={[]}
              columns={filteredMonths}
              formatAsTime
              index={0}
              showBottomTotal={true}
              bottomRowName="Общая выносливость"
            />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <DistanceChart data={distanceChartData} types={activeDistanceTypes} />
            <SyncedTable
              title="Дистанция по видам тренировок"
              rows={activeDistanceTypes.map(t=>({
                param: t,
                color: distanceColors[t],
                months: distanceChartData.map(d=>d[t] || 0),
                total: distanceChartData.reduce((sum,d)=>sum + (d[t]||0),0)
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
