import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Home, BarChart3, ClipboardList, CalendarDays, Plus, LogOut, Calendar, ChevronDown } from "lucide-react";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [periodType, setPeriodType] = React.useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const computeWeeks = () => {
    const weeks: string[] = [];
    if (periodType === "week" || periodType === "year") {
      const start = dayjs().startOf("year");
      const end = periodType === "week" ? dayjs() : dayjs().endOf("year");
      let current = start.startOf("week");
      while (current.isBefore(end) || current.isSame(end, "week")) {
        weeks.push(`${current.week()}/${current.year()}`);
        current = current.add(1, "week");
      }
    } else if (periodType === "month") {
      const start = dayjs().startOf("year");
      const currentMonth = dayjs().month();
      for (let m = 0; m <= currentMonth; m++) {
        const month = start.month(m);
        weeks.push(`${month.format("MMM")}/${month.year()}`);
      }
    } else if (periodType === "custom") {
      let current = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      while (current.isBefore(end) || current.isSame(end, "day")) {
        weeks.push(`${current.week()}/${current.year()}`);
        current = current.add(1, "week");
      }
    }
    return weeks;
  };

  const weeks = computeWeeks();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const applyDateRange = () => setShowDateRangePicker(false);

  const intensityColors = {
    I1: "#3b82f6",
    I2: "#2563eb",
    I3: "#facc15",
    I4: "#f97316",
    I5: "#ef4444",
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center transition-all duration-200 shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded flex items-center transition-all duration-200 shadow-md">
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-700 rounded-xl py-2 px-4 mb-6 shadow-inner">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors duration-200 ${
                  isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Выбор периода */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button onClick={() => setPeriodType("week")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={() => setPeriodType("month")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={() => setPeriodType("year")} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(prev => !prev)} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d] flex items-center">
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

        {/* Таблица FASX */}
        <div className="overflow-x-auto w-full p-4 rounded-lg bg-[#1a1a1d] shadow-lg">
          <table className="min-w-[1200px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#222] text-gray-300 px-3 py-2 rounded-tl-lg text-left z-10">Показатель</th>
                {weeks.map((w, i) => (
                  <th key={i} className="sticky top-0 bg-[#222] text-gray-300 px-3 py-2 text-center z-10">{w}</th>
                ))}
                <th className="sticky top-0 bg-[#222] text-gray-300 px-3 py-2 text-center z-10">Total</th>
                <th className="sticky top-0 bg-[#222] text-gray-300 px-3 py-2 text-center rounded-tr-lg z-10">Snitt/Uke</th>
              </tr>
            </thead>
            <tbody>
              {/* Dagsparametere */}
              <tr className="bg-[#222] font-semibold text-gray-300">
                <td colSpan={weeks.length + 3} className="px-3 py-2">Dagsparametere</td>
              </tr>
              {["Syk", "Skadet", "Konkurranse", "Høydedøgn", "På reise", "Fridag"].map((item) => (
                <tr key={item} className="hover:bg-[#2a2a2d]">
                  <td className="bg-[#1a1a1d] px-3 py-1">{item}</td>
                  {weeks.map((w, i) => <td key={i} className="px-2 py-1 text-center">-</td>)}
                  <td className="px-2 py-1 text-center">-</td>
                  <td className="px-2 py-1 text-center">-</td>
                </tr>
              ))}

              {/* Utholdenhet */}
              <tr className="bg-[#222] font-semibold text-gray-300">
                <td colSpan={weeks.length + 3} className="px-3 py-2">Utholdenhet</td>
              </tr>
              {["I1","I2","I3","I4","I5"].map((zone) => (
                <tr key={zone} className="hover:bg-[#2a2a2d]">
                  <td className="bg-[#1a1a1d] px-3 py-1 flex items-center">
                    <span className="w-3 h-3 rounded mr-2" style={{ backgroundColor: intensityColors[zone as keyof typeof intensityColors] }}></span>
                    {zone}
                  </td>
                  {weeks.map((w, i) => <td key={i} className="px-2 py-1 text-center">-</td>)}
                  <td className="px-2 py-1 text-center">-</td>
                  <td className="px-2 py-1 text-center">-</td>
                </tr>
              ))}
              <tr className="bg-[#111] font-semibold text-blue-400">
                <td className="px-3 py-1">Total Utholdenhet</td>
                {weeks.map((w, j) => <td key={j} className="px-2 py-1 text-center">-</td>)}
                <td className="px-2 py-1 text-center">-</td>
                <td className="px-2 py-1 text-center">-</td>
              </tr>

              {/* Bevegelsesformer */}
              <tr className="bg-[#222] font-semibold text-gray-300">
                <td colSpan={weeks.length + 3} className="px-3 py-2">Bevegelsesformer</td>
              </tr>
              {[
                "Løp / skigang",
                "Ski, klassisk",
                "Ski, skøyting",
                "Rulleski, klassisk",
                "Rulleski, skøyting",
                "Sykling",
                "Roing/padling",
                "Annet",
              ].map((form) => (
                <tr key={form} className="hover:bg-[#2a2a2d]">
                  <td className="bg-[#1a1a1d] px-3 py-1">{form}</td>
                  {weeks.map((w, i) => <td key={i} className="px-2 py-1 text-center">-</td>)}
                  <td className="px-2 py-1 text-center">-</td>
                  <td className="px-2 py-1 text-center">-</td>
                </tr>
              ))}
              <tr className="bg-[#111] font-semibold text-blue-400">
                <td className="px-3 py-1">Total Bevegelsesformer</td>
                {weeks.map((w, j) => <td key={j} className="px-2 py-1 text-center">-</td>)}
                <td className="px-2 py-1 text-center">-</td>
                <td className="px-2 py-1 text-center">-</td>
              </tr>

              {/* Общий Total */}
              <tr className="bg-[#111] font-bold text-white">
                <td className="px-3 py-1">Total</td>
                {weeks.map((w, j) => <td key={j} className="px-2 py-1 text-center">-</td>)}
                <td className="px-2 py-1 text-center">-</td>
                <td className="px-2 py-1 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
