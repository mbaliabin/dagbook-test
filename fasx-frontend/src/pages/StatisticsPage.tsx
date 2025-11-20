import React, { useRef } from "react";
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

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  // Заглушки минут для примера
  const sampleMinutes = [120, 90, 45, 60, 150, 80, 30, 50, 70, 100, 60, 90];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: sampleMinutes },
    { zone: "I2", color: "#22d3ee", months: sampleMinutes },
    { zone: "I3", color: "#facc15", months: sampleMinutes },
    { zone: "I4", color: "#fb923c", months: sampleMinutes },
    { zone: "I5", color: "#ef4444", months: sampleMinutes },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: sampleMinutes },
    { type: "Лыжи, классика", months: sampleMinutes },
    { type: "Роллеры, классика", months: sampleMinutes },
    { type: "Роллеры, скейтинг", months: sampleMinutes },
    { type: "Велосипед", months: sampleMinutes },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const computeWeekColumns = () => {
    const today = dayjs();
    const currentWeek = today.week();
    const currentYear = today.year();
    const weeks: string[] = [];
    for (let i = 1; i <= currentWeek; i++) weeks.push(`${i} / ${currentYear}`);
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
    return {
      ...zone,
      months: zone.months.slice(0, sliceLength),
      total: zone.months.slice(0, sliceLength).reduce((a,b) => a+b,0),
    };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const sliceLength = Math.min(m.months.length, filteredMonths.length);
    return {
      ...m,
      months: m.months.slice(0, sliceLength),
      total: m.months.slice(0, sliceLength).reduce((a,b) => a+b,0),
    };
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

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => {
      if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft;
    });
  };

  // --- Таблица в отдельном компоненте для выравнивания ---
  const TableSection: React.FC<{ table: any; index: number; isTimeTable?: boolean }> = ({ table, index, isTimeTable=false }) => {
    const weekColWidth = 80;
    const monthColWidth = 100;
    const yearColWidth = 80;
    const leftColWidth = 160;
    const totalColWidth = 80;

    const colWidth = periodType === 'week' ? weekColWidth : periodType === 'month' ? monthColWidth : periodType === 'year' ? yearColWidth : monthColWidth;
    const computedMinWidth = Math.max(900, filteredMonths.length * colWidth + leftColWidth + totalColWidth);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={(e)=>handleScroll(e,index)}>
          <div style={{ minWidth: computedMinWidth }} className="transition-all duration-300">
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 box-border z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftColWidth }}>
                {table.title==="Параметры дня"?"Параметр":table.title==="Выносливость"?"Зона":"Тип активности"}
              </div>
              {filteredMonths.map((m, idx)=>(<div key={m+"-h-"+idx} className="p-3 text-center box-border font-medium flex-none" style={{ width: colWidth }}>{m}</div>))}
              {isTimeTable && <div className="p-3 text-center font-medium bg-[#1f1f1f] box-border flex-none" style={{ width: totalColWidth }}>Итого</div>}
            </div>
            <div>
              {table.data.map((row:any,j:number)=>(
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftColWidth }}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: row.color}}></span>}
                    <div className="truncate">{row.param}</div>
                  </div>
                  {filteredMonths.map((val:number,k:number)=>(
                    <div key={k} className="p-3 text-center box-border flex-none">
                      {isTimeTable ? formatTime(row.months[k]) : row.months[k] ?? 0}
                    </div>
                  ))}
                  {isTimeTable &&
                    <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>
                      {formatTime(row.total)}
                    </div>
                  }
                </div>
              ))}

              {/* Нижняя строка с общим временем для timeTables */}
              {isTimeTable && (
                <div className="flex border-t border-[#2a2a2a] bg-[#222] font-semibold">
                  <div className="p-3 sticky left-0 bg-[#222] z-10" style={{ width: leftColWidth }}>Общее</div>
                  {filteredMonths.map((_,idx)=> {
                    const sum = table.data.reduce((acc:number,row:any)=>acc + (row.months[idx] ?? 0),0);
                    return <div key={idx} className="p-3 text-center flex-none">{formatTime(sum)}</div>;
                  })}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>
                    {formatTime(table.data.reduce((acc:number,row:any)=>acc + row.total,0))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1200px] mx-auto space-y-8">

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
                className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}
              >
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
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
          </div>
        </div>

        {/* Таблицы */}
        {[
          { title: "Параметры дня", data: [
              { param: "Травма", months: [0,1,0,0,0,0,0,0,0,1,0,0] },
              { param: "Болезнь", months: [1,0,0,0,0,0,0,0,0,1,0,0] },
              { param: "Выходной", months: [2,3,1,2,1,1,3,2,1,2,1,1] },
              { param: "Соревнования", months: [0,1,0,2,1,1,2,1,1,0,0,0] },
              { param: "В пути", months: [1,0,1,0,1,2,1,1,0,1,1,0] },
            ] },
          { title: "Выносливость", data: filteredEnduranceZones.map(z=>({ param: z.zone, months: z.months, total: z.total, color: z.color })), isTimeTable: true },
          { title: "Формы активности", data: filteredMovementTypes.map(m=>({ param: m.type, months: m.months, total: m.total })), isTimeTable: true }
        ].map((table,i)=>(
          <TableSection key={i} table={table} index={i} isTimeTable={table.isTimeTable}/>
        ))}

      </div>
    </div>
  );
}
