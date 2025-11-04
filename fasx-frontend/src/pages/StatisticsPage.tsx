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
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
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

  const totals = { trainingDays: 83, sessions: 128, time: "178:51" };
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

  const computeWeekColumns = () => {
    const today = dayjs();
    const currentWeek = today.week();
    const weeks: string[] = [];
    for (let i = 1; i <= currentWeek; i++) weeks.push(`Неделя ${i}`);
    return weeks;
  };

  const computeMonthColumns = () => {
    const today = dayjs();
    const currentMonth = today.month();
    return months.slice(0, currentMonth + 1);
  };

  const computeColumns = () => {
    if (periodType === "week") return computeWeekColumns();
    if (periodType === "month") return computeMonthColumns();
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

  const filteredEnduranceZones = enduranceZones.map((zone) => {
    const sliceLength = Math.min(zone.months.length, filteredMonths.length);
    return { ...zone, months: zone.months.slice(0, sliceLength), total: zone.months.slice(0, sliceLength).reduce((a,b)=>a+b,0) };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const sliceLength = Math.min(m.months.length, filteredMonths.length);
    return { ...m, months: m.months.slice(0, sliceLength), total: m.months.slice(0, sliceLength).reduce((a,b)=>a+b,0) };
  });

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
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
            <div><h1 className="text-2xl font-bold text-white">{name}</h1></div>
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

        {/* Выбор отчета и периода */}
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
                  showSelectionPreview moveRangeOnFirstSelection={false} months={1}
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: 'selection' }]}
                  direction="horizontal" rangeColors={['#3b82f6']} className="text-white" locale={ru} weekStartsOn={1}
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
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonths.map((month,i)=>{
                const data: any = { month };
                filteredEnduranceZones.forEach(z=>data[z.zone]=z.months[i]??0);
                return data;
              })} barSize={35}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip content={({ active, payload }: any) => {
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
                }}/>
                {filteredEnduranceZones.map(z=>(
                  <Bar key={z.zone} dataKey={z.zone} stackId="a" fill={z.color} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Таблицы с одним скроллом */}
        <div className="overflow-x-auto mt-6">

          {/* Заголовки таблиц */}
          <div className="flex gap-10 mb-2">
            <h2 className="text-lg font-semibold text-gray-100 min-w-[300px]">Параметры дня</h2>
            <h2 className="text-lg font-semibold text-gray-100 min-w-[300px]">Выносливость</h2>
            <h2 className="text-lg font-semibold text-gray-100 min-w-[300px]">Формы активности</h2>
          </div>

          {/* Таблицы */}
          <div className="flex gap-10 min-w-max">
            {/* Параметры дня */}
            <table className="w-full min-w-[900px] text-sm border-collapse bg-[#1a1a1d]">
              <thead>
                <tr className="bg-[#222] text-gray-400 text-left">
                  <th className="p-3 font-medium sticky left-0 bg-[#222]">Параметр</th>
                  {filteredMonths.map((m)=>(<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                  <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
                </tr>
              </thead>
              <tbody>
                {[{ param: "Травма", months: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0] },
                  { param: "Болезнь", months: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0] },
                  { param: "Выходной", months: [2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1] },
                  { param: "Соревнования", months: [0, 1, 0, 2, 1, 1, 2, 1, 1, 0, 0, 0] },
                  { param: "В пути", months: [1, 0, 1, 0, 1, 2, 1, 1, 0, 1, 1, 0] },
                ].map((row) => {
                  const filtered = row.months.slice(0, filteredMonths.length);
                  const total = filtered.reduce((a,b)=>a+b,0);
                  return (
                    <tr key={row.param} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                      <td className="p-3 sticky left-0 bg-[#1a1a1a]">{row.param}</td>
                      {filtered.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                      <td className="p-3 text-center font-medium bg-[#1f1f1f]">{total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Выносливость */}
            <table className="w-full min-w-[900px] text-sm border-collapse bg-[#1a1a1d]">
              <thead>
                <tr className="bg-[#222] text-gray-400 text-left">
                  <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
                  {filteredMonths.map((m)=>(<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                  <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnduranceZones.map((z)=>(
                  <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                    <td className="p-3 flex items-center gap-2 sticky left-0 bg-[#1a1a1a]">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></span>
                      {z.zone}
                    </td>
                    {z.months.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                    <td className="p-3 text-center font-medium bg-[#1f1f1f]">{z.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Формы активности */}
            <table className="w-full min-w-[900px] text-sm border-collapse bg-[#1a1a1d]">
              <thead>
                <tr className="bg-[#222] text-gray-400 text-left">
                  <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип</th>
                  {filteredMonths.map((m)=>(<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                  <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovementTypes.map((m)=>(
                  <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                    <td className="p-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                    {m.months.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                    <td className="p-3 text-center font-medium bg-[#1f1f1f]">{m.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

      </div>
    </div>
  );
}
