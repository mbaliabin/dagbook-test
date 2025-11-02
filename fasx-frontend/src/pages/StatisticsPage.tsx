import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
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
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  // Генерация массива недель с начала года
  const generateWeeks = () => {
    const startOfYear = dayjs("2025-01-01");
    const endOfYear = dayjs("2025-12-31");
    const totalWeeks = endOfYear.diff(startOfYear, "week") + 1;
    return Array.from({ length: totalWeeks }, (_, i) => `${i + 1} неделя`);
  };

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", data: [10,8,12,9,11,14,13,10,8,5,3,2] },
    { zone: "I2", color: "#22d3ee", data: [5,6,7,3,4,5,6,3,4,2,1,1] },
    { zone: "I3", color: "#facc15", data: [2,1,1,1,2,1,1,1,0,1,0,1] },
    { zone: "I4", color: "#fb923c", data: [1,1,2,0,1,1,0,0,1,0,0,0] },
    { zone: "I5", color: "#ef4444", data: [0,0,1,0,0,0,0,0,1,0,1,0] },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", data: [4,5,3,0,0,0,0,0,1,2,3,2] },
    { type: "Лыжи, классика", data: [3,4,2,0,0,0,0,0,0,1,2,1] },
    { type: "Роллеры, классика", data: [0,0,0,3,5,6,7,5,4,3,2,0] },
    { type: "Роллеры, скейтинг", data: [0,0,0,2,6,7,8,6,5,3,2,0] },
    { type: "Велосипед", data: [0,0,0,1,2,3,4,3,2,1,0,0] },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Генерация списка колонок по типу периода
  const getColumns = () => {
    if (periodType === "month") return months;
    if (periodType === "week") return generateWeeks();
    if (periodType === "year" || periodType === "custom")
      return months; // пока для упрощения
    return [];
  };

  const columns = getColumns();

  // Преобразование данных под выбранный период
  const filteredEnduranceZones = enduranceZones.map((zone) => {
    const dataLength = periodType === "week" ? 10 : 12; // имитация данных на 10 недель
    const fakeData = Array.from({ length: dataLength }, () =>
      Math.floor(Math.random() * 15)
    );
    const arr = periodType === "week" ? fakeData : zone.data;
    const total = arr.reduce((a, b) => a + b, 0);
    return { ...zone, data: arr, total };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const dataLength = periodType === "week" ? 10 : 12;
    const fakeData = Array.from({ length: dataLength }, () =>
      Math.floor(Math.random() * 15)
    );
    const arr = periodType === "week" ? fakeData : m.data;
    const total = arr.reduce((a, b) => a + b, 0);
    return { ...m, data: arr, total };
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const applyDateRange = () => setShowDateRangePicker(false);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${
                  isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Кнопки выбора периода */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            className="bg-[#1f1f22] text-white px-3 py-1 rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option>Общий отчет</option>
          </select>
          <button onClick={() => setPeriodType("week")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={() => setPeriodType("month")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={() => setPeriodType("year")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(prev => !prev)} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Произвольный период <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: 'selection' }]}
                  direction="horizontal"
                  rangeColors={['#3b82f6']}
                  className="text-white"
                  locale={ru}
                  weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={() => setShowDateRangePicker(false)} className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300">Отмена</button>
                  <button onClick={applyDateRange} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Таблица выносливости */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Выносливость ({periodType === "week" ? "по неделям" : "по месяцам"})</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
                {columns.map((c) => (<th key={c} className="p-3 font-medium text-center">{c}</th>))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnduranceZones.map((z) => (
                <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 flex items-center gap-3 sticky left-0 bg-[#1a1a1a]">
                    <div className="w-5 h-5 rounded-md" style={{ backgroundColor: z.color }}></div>
                    {z.zone}
                  </td>
                  {z.data.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(z.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Таблица активности */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Форма активности</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип активности</th>
                {columns.map((c) => (<th key={c} className="p-3 font-medium text-center">{c}</th>))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map((m) => (
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                  {m.data.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
