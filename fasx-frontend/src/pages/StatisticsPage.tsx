import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Plus,
  LogOut,
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
import ru from 'date-fns/locale/ru';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

dayjs.locale("ru");
dayjs.extend(isoWeek);

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<"Год" | "Месяц" | "Неделя">("Год");
  const [selectedDate, setSelectedDate] = React.useState(dayjs());

  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{startDate: Date, endDate: Date} | null>(null);

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

  const displayColumns = React.useMemo(() => {
    if (dateRange) {
      const start = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      const diff = end.diff(start, "day");
      const columns: string[] = [];
      for (let i = 0; i <= diff; i++) {
        columns.push(start.add(i, "day").format("DD.MM"));
      }
      return columns;
    }

    if (periodType === "Год") return months;
    if (periodType === "Месяц") {
      const startOfMonth = selectedDate.startOf("month");
      const weeks: string[] = [];
      const numWeeks = Math.ceil(selectedDate.daysInMonth()/7);
      for (let i = 0; i < numWeeks; i++) {
        weeks.push(`Неделя ${startOfMonth.isoWeek() + i}`);
      }
      return weeks;
    }
    if (periodType === "Неделя") {
      const startOfWeek = selectedDate.startOf("isoWeek");
      return Array.from({ length: 7 }, (_, i) =>
        startOfWeek.add(i, "day").format("DD.MM")
      );
    }
    return [];
  }, [periodType, selectedDate, dateRange]);

  const filteredEnduranceZones = enduranceZones.map((zone) => {
    const data = Array(displayColumns.length).fill(0).map((_, i) => zone.months[i] || 0);
    return { ...zone, months: data, total: data.reduce((a,b)=>a+b,0) };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const data = Array(displayColumns.length).fill(0).map((_, i) => m.months[i] || 0);
    return { ...m, months: data, total: data.reduce((a,b)=>a+b,0) };
  });

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

  const applyDateRange = () => setShowDateRangePicker(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
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
                className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Период и отчет */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <select value={reportType} onChange={(e)=>setReportType(e.target.value)}
            className="px-3 py-1 rounded bg-[#1f1f22] text-white text-sm">
            <option>Общий отчет</option>
          </select>
          <button className={`px-3 py-1 rounded text-sm ${periodType==="Неделя"?"bg-blue-600":"bg-[#1f1f22]"} hover:bg-blue-700`}
            onClick={()=>{setPeriodType("Неделя"); setDateRange(null)}}>Неделя</button>
          <button className={`px-3 py-1 rounded text-sm ${periodType==="Месяц"?"bg-blue-600":"bg-[#1f1f22]"} hover:bg-blue-700`}
            onClick={()=>{setPeriodType("Месяц"); setDateRange(null)}}>Месяц</button>
          <button className={`px-3 py-1 rounded text-sm ${periodType==="Год"?"bg-blue-600":"bg-[#1f1f22]"} hover:bg-blue-700`}
            onClick={()=>{setPeriodType("Год"); setDateRange(null)}}>Год</button>

          {/* Произвольный период */}
          <div className="relative">
            <button onClick={()=>setShowDateRangePicker(prev=>!prev)}
              className="ml-2 text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Произвольный период <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  onChange={item => setDateRange({startDate: item.selection.startDate, endDate: item.selection.endDate})}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={[{ startDate: dateRange?.startDate || new Date(), endDate: dateRange?.endDate || new Date(), key: 'selection' }]}
                  direction="horizontal"
                  rangeColors={['#3b82f6']}
                  className="text-white"
                  locale={ru}
                  weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={()=>setShowDateRangePicker(false)}
                    className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300">Отмена</button>
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
            <div>
              <p className="text-gray-400">Тренировочные дни</p>
              <p className="text-xl text-gray-100">{totals.trainingDays}</p>
            </div>
            <div>
              <p className="text-gray-400">Сессий</p>
              <p className="text-xl text-gray-100">{totals.sessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Время</p>
              <p className="text-xl text-gray-100">{totals.time}</p>
            </div>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayColumns.map((col, i) => {
                  const data: any = { month: col };
                  filteredEnduranceZones.forEach((zone) => (data[zone.zone] = zone.months[i] || 0));
                  return data;
                })}
                barSize={35}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="mt-1">
                              <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: p.fill }}></span>
                              {p.dataKey}: {formatTime(p.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {filteredEnduranceZones.map((zone) => (
                  <Bar key={zone.zone} dataKey={zone.zone} stackId="a" fill={zone.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Таблица выносливости */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Выносливость</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
                {displayColumns.map((m) => (<th key={m} className="p-3 font-medium text-center">{m}</th>))}
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
                  {z.months.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(z.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Таблица активности */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Общая активность</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип активности</th>
                {displayColumns.map((m) => (<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map((m) => (
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 flex items-center gap-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                  {m.months.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
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
