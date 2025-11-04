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
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);
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

  const dayParams = [
    { param: "Травма", months: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0] },
    { param: "Болезнь", months: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0] },
    { param: "Выходной", months: [2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1] },
    { param: "Соревнования", months: [0, 1, 0, 2, 1, 1, 2, 1, 1, 0, 0, 0] },
    { param: "В пути", months: [1, 0, 1, 0, 1, 2, 1, 1, 0, 1, 1, 0] },
  ];

  const computeColumns = () => {
    if (periodType === "week") {
      const today = dayjs();
      const weeks = [];
      for (let i = 1; i <= today.week(); i++) weeks.push(`Неделя ${i}`);
      return weeks;
    }
    if (periodType === "month") {
      const today = dayjs();
      return months.slice(0, today.month()+1);
    }
    if (periodType === "year") return months;
    if (periodType === "custom") {
      const start = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      const result: string[] = [];
      let current = start.startOf("day");
      while (current.isBefore(end) || current.isSame(end, "day")) {
        result.push(current.format("DD MMM"));
        current = current.add(1, "day");
      }
      return result;
    }
    return months;
  };

  const filteredMonths = computeColumns();

  const filteredEnduranceZones = enduranceZones.map((z) => {
    const sliceLength = Math.min(z.months.length, filteredMonths.length);
    return {...z, months: z.months.slice(0, sliceLength), total: z.months.slice(0, sliceLength).reduce((a,b)=>a+b,0)};
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const sliceLength = Math.min(m.months.length, filteredMonths.length);
    return {...m, months: m.months.slice(0, sliceLength), total: m.months.slice(0, sliceLength).reduce((a,b)=>a+b,0)};
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
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
              <button key={item.path} onClick={() => navigate(item.path)}
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

        {/* Период и отчёт */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select className="bg-[#1f1f22] text-white px-3 py-1 rounded" value={reportType} onChange={e => setReportType(e.target.value)}>
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
                  showSelectionPreview
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

        {/* TOTALSUM */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">TOTALSUM</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">83</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">128</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">178:51</p></div>
          </div>
        </div>

        {/* Объединённая таблица */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Общие показатели</h2>
          <table className="min-w-[900px] text-sm border-collapse">
            <thead className="sticky top-0 bg-[#222] z-20">
              <tr className="text-gray-400 text-left">
                <th className="p-3 sticky left-0 bg-[#222] z-30">Показатель</th>
                {filteredMonths.map(m => <th key={m} className="p-3 text-center font-medium">{m}</th>)}
                <th className="p-3 text-center font-medium bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {/* Параметры дня */}
              {dayParams.map(row => {
                const vals = row.months.slice(0, filteredMonths.length);
                const total = vals.reduce((a,b)=>a+b,0);
                return (
                  <tr key={row.param} className="border-t border-[#2a2a2a] hover:bg-[#252525]/50">
                    <td className="p-3 sticky left-0 bg-[#1a1a1a] font-medium">{row.param}</td>
                    {vals.map((v,i)=><td key={i} className="p-3 text-center">{v>0?v:"-"}</td>)}
                    <td className="p-3 text-center font-medium bg-[#1f1f1f]">{total}</td>
                  </tr>
                )
              })}

              {/* Зоны выносливости */}
              {filteredEnduranceZones.map(z => (
                <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/50">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a] font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor:z.color}}></span>
                    {z.zone}
                  </td>
                  {z.months.map((v,i)=><td key={i} className="p-3 text-center">{v}</td>)}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{z.total}</td>
                </tr>
              ))}

              {/* Формы активности */}
              {filteredMovementTypes.map(m => (
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/50">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a] font-medium">{m.type}</td>
                  {m.months.map((v,i)=><td key={i} className="p-3 text-center">{v}</td>)}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
