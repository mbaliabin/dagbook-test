import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Home, BarChart3, ClipboardList, CalendarDays, Plus, LogOut, Calendar, ChevronDown } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  const totals = { trainingDays: 83, sessions: 128, time: "178:51", distance: 1240 };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [80, 70, 90, 50, 75, 65, 70] },
    { zone: "I2", color: "#22d3ee", months: [40, 50, 45, 35, 50, 40, 45] },
    { zone: "I3", color: "#facc15", months: [15, 10, 20, 5, 15, 10, 10] },
    { zone: "I4", color: "#fb923c", months: [5, 10, 5, 0, 5, 5, 5] },
    { zone: "I5", color: "#ef4444", months: [0, 0, 5, 0, 0, 0, 0] },
  ];

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  // Helper: compute months based on period type
  const computeColumns = () => {
    if (periodType === "year") return months;
    if (periodType === "month") return months.slice(0, dayjs().month() + 1);
    if (periodType === "week") return Array.from({length: dayjs().week()}, (_, i) => `${i+1} / ${dayjs().year()}`);
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

  // Filter out empty zones/distances
  const filteredEnduranceZones = enduranceZones.filter(z => z.months.some(v => v > 0));
  const filteredDistanceTypes = distanceByType.filter(d => d.distance.some(v => v > 0));

  const distanceColors: Record<string, string> = {
    "Лыжи, к. ст.": "#4ade80",
    "Лыжи, кл. ст.": "#22d3ee",
    "Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c",
    "Бег": "#ef4444",
    "Велосипед": "#3b82f6",
  };

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

  // Prepare data for Chart.js stacked bar
  const enduranceData = {
    labels: filteredMonths,
    datasets: filteredEnduranceZones.map(z => ({
      label: z.zone,
      data: z.months,
      backgroundColor: z.color,
    })),
  };

  const distanceData = {
    labels: filteredMonths,
    datasets: filteredDistanceTypes.map(d => ({
      label: d.type,
      data: d.distance,
      backgroundColor: distanceColors[d.type] || "#888",
    })),
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
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
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* REPORT TYPE */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select className="bg-[#1f1f22] text-white px-3 py-1 rounded" value={reportType} onChange={e => setReportType(e.target.value)}>
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>
          <button onClick={() => setPeriodType("week")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={() => setPeriodType("month")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={() => setPeriodType("year")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={() => setShowDateRangePicker(prev => !prev)} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1"/> Произвольный период <ChevronDown className="w-4 h-4 ml-1"/>
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                  showSelectionPreview moveRangeOnFirstSelection={false} months={1}
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: "selection" }]}
                  direction="horizontal" rangeColors={["#3b82f6"]} className="text-white" locale={ru} weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={() => setShowDateRangePicker(false)} className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300">Отмена</button>
                  <button onClick={applyDateRange} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS */}
        {reportType === "Общий отчет" && (
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Выносливость (Endurance Zones)</h2>
            <Bar data={enduranceData} options={{
              responsive: true,
              plugins: { legend: { position: "top", labels: { color: "#fff" } }, tooltip: { mode: "index", intersect: false } },
              scales: { x: { ticks: { color: "#fff" } }, y: { ticks: { color: "#fff" } } },
              interaction: { mode: "nearest", axis: "x", intersect: false },
              stacked: true
            }}/>
          </div>
        )}

        {reportType === "Общая дистанция" && (
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Дистанция по видам тренировок</h2>
            <Bar data={distanceData} options={{
              responsive: true,
              plugins: { legend: { position: "top", labels: { color: "#fff" } }, tooltip: { mode: "index", intersect: false } },
              scales: { x: { ticks: { color: "#fff" } }, y: { ticks: { color: "#fff" } } },
              interaction: { mode: "nearest", axis: "x", intersect: false },
              stacked: true
            }}/>
          </div>
        )}

      </div>
    </div>
  );
}
