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
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown
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
  const [startPeriod, setStartPeriod] = React.useState(dayjs().startOf('month').toDate());
  const [endPeriod, setEndPeriod] = React.useState(dayjs().endOf('month').toDate());
  const [selectedMonth, setSelectedMonth] = React.useState(dayjs());
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2] },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1] },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1] },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0] },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0] },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2] },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1] },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0] },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0] },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0] },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const startMonth = dayjs(startPeriod).month();
  const endMonth = dayjs(endPeriod).month();

  const filteredMonths = months.slice(startMonth, endMonth + 1);
  const filteredEnduranceZones = enduranceZones.map((zone) => ({
    ...zone,
    months: zone.months.slice(startMonth, endMonth + 1),
    total: zone.months.slice(startMonth, endMonth + 1).reduce((a,b) => a+b, 0),
  }));
  const filteredMovementTypes = movementTypes.map((m) => ({
    ...m,
    months: m.months.slice(startMonth, endMonth + 1),
    total: m.months.slice(startMonth, endMonth + 1).reduce((a,b) => a+b, 0),
  }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const onPrevMonth = () => {
    const prev = selectedMonth.subtract(1, 'month');
    setSelectedMonth(prev);
    setStartPeriod(prev.startOf('month').toDate());
    setEndPeriod(prev.endOf('month').toDate());
  };

  const onNextMonth = () => {
    const next = selectedMonth.add(1, 'month');
    setSelectedMonth(next);
    setStartPeriod(next.startOf('month').toDate());
    setEndPeriod(next.endOf('month').toDate());
  };

  const applyDateRange = () => {
    setShowDateRangePicker(false);
  };

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">

            {/* Выбор периода */}
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                className="flex items-center text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onPrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                className="relative bg-[#1f1f22] text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer select-none"
                title="Показать текущий месяц"
              >
                {selectedMonth.format('MMMM YYYY')}
              </div>

              <button
                className="text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const weekStart = dayjs().startOf('isoWeek');
                  const weekEnd = dayjs().endOf('isoWeek');
                  setStartPeriod(weekStart.toDate());
                  setEndPeriod(weekEnd.toDate());
                  setSelectedMonth(weekStart);
                }}
                className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]"
              >
                Текущая неделя
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDateRangePicker(prev => !prev)}
                  className="ml-2 text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d] flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1" /> Произвольный период <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {showDateRangePicker && (
                  <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                    <DateRange
                      onChange={item => {
                        setStartPeriod(item.selection.startDate);
                        setEndPeriod(item.selection.endDate);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={[{ startDate: startPeriod, endDate: endPeriod, key: 'selection' }]}
                      months={1}
                      direction="horizontal"
                      rangeColors={['#3b82f6']}
                      className="text-white"
                      locale={ru}
                      weekStartsOn={1}
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => setShowDateRangePicker(false)}
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={applyDateRange}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex items-center space-x-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
              >
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
        </div>

        {/* Меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.path === "/daily" && location.pathname === "/daily") ||
              (item.path === "/profile" && location.pathname === "/profile") ||
              (item.path !== "/daily" && item.path !== "/profile" && location.pathname === item.path);
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

        {/* Таблицы */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-700 p-2">Зона</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="border border-gray-700 p-2">{m}</th>
                ))}
                <th className="border border-gray-700 p-2">Итого</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnduranceZones.map((z) => (
                <tr key={z.zone}>
                  <td className="border border-gray-700 p-2">{z.zone}</td>
                  {z.months.map((val, idx) => (
                    <td key={idx} className="border border-gray-700 p-2">{val}</td>
                  ))}
                  <td className="border border-gray-700 p-2">{z.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse mt-6">
            <thead>
              <tr>
                <th className="border border-gray-700 p-2">Тип</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="border border-gray-700 p-2">{m}</th>
                ))}
                <th className="border border-gray-700 p-2">Итого</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map((m) => (
                <tr key={m.type}>
                  <td className="border border-gray-700 p-2">{m.type}</td>
                  {m.months.map((val, idx) => (
                    <td key={idx} className="border border-gray-700 p-2">{val}</td>
                  ))}
                  <td className="border border-gray-700 p-2">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
