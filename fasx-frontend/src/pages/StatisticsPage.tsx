import React, { useRef, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
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
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

// ---------------------- Утилиты ----------------------
const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

// ---------------------- Tooltip ----------------------
const CustomTooltip: React.FC<any> = ({ active, payload, label, formatHours }) => {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  const formatValue = (v: number) => (formatHours ? formatTime(v) : `${v} км`);

  return (
    <div className="bg-[#111]/90 border border-[#2a2a2a] px-2.5 py-2 rounded-lg shadow-lg text-gray-200 text-xs w-48 backdrop-blur-sm">
      <p className="font-semibold mb-1 text-[13px]">{label}</p>
      <div className="space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex justify-between gap-2 items-start">
            <span className="text-gray-400 break-words leading-tight max-w-[120px]">{p.name}</span>
            <span className="font-mono text-right min-w-[55px]" style={{ color: p.fill }}>
              {formatValue(p.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[#2a2a2a] my-1.5"></div>
      <div className="flex justify-between font-semibold text-[13px]">
        <span className="text-gray-300">Итого</span>
        <span className="font-mono text-blue-400 min-w-[55px] text-right">{formatValue(total)}</span>
      </div>
    </div>
  );
};

// ---------------------- Универсальный график ----------------------
interface ChartSeries {
  name: string;
  color: string;
  values: number[];
}

const StackedBarChart: React.FC<{
  title: string;
  columns: string[];
  series: ChartSeries[];
  formatValues?: (v: number) => string;
  stackId?: string;
}> = ({ title, columns, series, formatValues, stackId = "a" }) => {
  const chartData = useMemo(() => {
    return columns.map((col, i) => {
      const dataPoint: Record<string, any> = { month: col };
      series.forEach(s => (dataPoint[s.name] = s.values[i] || 0));
      return dataPoint;
    });
  }, [columns, series]);

  return (
    <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap="0%">
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip formatHours={!!formatValues} />} />
            {series.map(s => (
              <Bar key={s.name} dataKey={s.name} stackId={stackId} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ---------------------- Универсальная таблица ----------------------
const TableSection: React.FC<{
  table: any;
  index: number;
  scrollRefs: React.RefObject<HTMLDivElement>[];
  colWidth?: number;
  leftWidth?: number;
  totalWidth?: number;
}> = ({ table, index, scrollRefs, colWidth = 103, leftWidth = 200, totalWidth = 80 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => {
      if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft;
    });
  };

  const calculatedWidth = table.columns.length * colWidth + leftWidth + totalWidth;

  return (
    <div ref={containerRef} className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg w-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
      <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={handleScroll}>
        <div className="transition-all flex-shrink-0" style={{ minWidth: calculatedWidth }}>
          {/* HEADER */}
          <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
            <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftWidth }}>
              {table.leftLabel || "Параметр"}
            </div>
            {table.columns.map((col: string, idx: number) => (
              <div key={idx} className="p-3 text-center flex-none font-medium" style={{ width: colWidth }}>
                {col}
              </div>
            ))}
            <div className="p-3 text-center font-medium bg-[#1f1f1f] flex-none" style={{ width: totalWidth }}>
              Всего
            </div>
          </div>

          {/* ROWS */}
          <div>
            {table.data.map((row: any, j: number) => (
              <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftWidth }}>
                  {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                  <div className="truncate">{row.param || row.type}</div>
                </div>
                {row.values.map((val: number, k: number) => (
                  <div key={k} className="p-3 text-center flex-none" style={{ width: colWidth }}>
                    {table.formatValues ? table.formatValues(val) : val}
                  </div>
                ))}
                <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalWidth }}>
                  {table.formatValues ? table.formatValues(row.total) : row.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------- StatsPage ----------------------
export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = useState("Пользователь");
  const [reportType, setReportType] = useState("Общий отчет");
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const totals = { trainingDays: 83, sessions: 128, time: "178:51", distance: 1240 };
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

  const distanceByType = [
    { type: "Лыжи / скейтинг", distance: [40,35,50,30,45,30,40,0,0,0,0,0] },
    { type: "Лыжи, классика", distance: [60,50,55,40,50,45,50,0,0,0,0,0] },
    { type: "Роллеры, классика", distance: [30,25,35,20,30,25,30,0,0,0,0,0,0] },
    { type: "Роллеры, скейтинг", distance: [25,20,30,15,25,20,25,0,0,0,0,0,0] },
    { type: "Велосипед", distance: [100,80,120,70,90,80,100,0,0,0,0,0,0] },
  ];

  const distanceColors: Record<string,string> = {
    "Лыжи / скейтинг":"#4ade80",
    "Лыжи, классика":"#22d3ee",
    "Роллеры, классика":"#facc15",
    "Роллеры, скейтинг":"#fb923c",
    "Велосипед":"#3b82f6",
  };

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // ---------------------- Колонки ----------------------
  const filteredMonths = useMemo(() => {
    if (periodType === "week") {
      const start = dayjs().startOf("year");
      const end = dayjs().endOf("year");
      const weeks: string[] = [];
      let current = start.startOf("week");
      while (current.isBefore(end)) { weeks.push(`W${current.week()}`); current = current.add(1,"week"); }
      return weeks;
    }
    if (periodType === "month" || periodType === "year") return months;
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
  }, [periodType, dateRange]);

  // ---------------------- Подготовка данных ----------------------
  const filteredEnduranceZones = useMemo(() =>
    enduranceZones.map(z => {
      const slice = z.months.slice(0, filteredMonths.length);
      return { ...z, months: slice, total: slice.reduce((a,b)=>a+b,0) };
    }), [enduranceZones, filteredMonths]);

  const filteredMovementTypes = useMemo(() =>
    movementTypes.map(m => {
      const slice = m.months.slice(0, filteredMonths.length);
      return { type: m.type, values: slice, total: slice.reduce((a,b)=>a+b,0) };
    }), [movementTypes, filteredMonths]);

  const filteredDistanceTypes = useMemo(() =>
    distanceByType.map(d => {
      const slice = d.distance.slice(0, filteredMonths.length);
      return { type: d.type, values: slice, total: slice.reduce((a,b)=>a+b,0) };
    }), [distanceByType, filteredMonths]);

  const activeDistanceTypes = filteredDistanceTypes.filter(t => t.values.some(v => v>0));

  const distanceSeries = useMemo(() =>
    activeDistanceTypes.map(t => ({ name: t.type, color: distanceColors[t.type], values: t.values })), [activeDistanceTypes]);

  const enduranceSeries = useMemo(() =>
    filteredEnduranceZones.map(z => ({ name: z.zone, color: z.color, values: z.months })), [filteredEnduranceZones]);

  const movementSeries = useMemo(() =>
    filteredMovementTypes.map(m => ({ name: m.type, color: "#888", values: m.values })), [filteredMovementTypes]);

  // ---------------------- Logout ----------------------
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

  // ---------------------- Render ----------------------
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
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
          {menuItems.map((item)=>{ const Icon=item.icon; const isActive=location.pathname===item.path;
            return <button key={item.path} onClick={()=>navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive?"text-blue-500":"text-gray-400 hover:text-white"}`}>
              <Icon className="w-6 h-6"/>
              <span>{item.label}</span>
            </button>;
          })}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={periodType} onChange={e=>setPeriodType(e.target.value as any)} className="bg-[#1a1a1d] p-2 rounded">
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
            <option value="custom">Произвольный</option>
          </select>
          {periodType==="custom" && <DateRange
            locale={ru}
            ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key: 'selection' }]}
            onChange={ranges => setDateRange({ startDate: ranges.selection.startDate, endDate: ranges.selection.endDate })}
          />}
        </div>

        {/* TOTALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-2xl text-center">
            <div className="text-sm text-gray-400">Тренировочные дни</div>
            <div className="text-xl font-bold">{totals.trainingDays}</div>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-2xl text-center">
            <div className="text-sm text-gray-400">Сессии</div>
            <div className="text-xl font-bold">{totals.sessions}</div>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-2xl text-center">
            <div className="text-sm text-gray-400">Время</div>
            <div className="text-xl font-bold">{totals.time}</div>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-2xl text-center">
            <div className="text-sm text-gray-400">Дистанция</div>
            <div className="text-xl font-bold">{totals.distance} км</div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="space-y-6">
          <StackedBarChart
            title="Зоны выносливости"
            columns={filteredMonths}
            series={enduranceSeries}
            formatValues={formatTime}
          />
          <StackedBarChart
            title="Общая дистанция по видам тренировок"
            columns={filteredMonths}
            series={distanceSeries}
          />
        </div>

        {/* TABLES */}
        <div className="space-y-6">
          <TableSection
            table={{
              title:"Параметры дня",
              leftLabel:"Дата",
              columns:filteredMonths,
              data:filteredMovementTypes
            }}
            index={0}
            scrollRefs={scrollRefs}
          />
          <TableSection
            table={{
              title:"Выносливость",
              leftLabel:"Зона",
              columns:filteredMonths,
              data:filteredEnduranceZones,
              formatValues: (v:number)=>v.toString()
            }}
            index={1}
            scrollRefs={scrollRefs}
          />
          <TableSection
            table={{
              title:"Тип активности",
              leftLabel:"Вид",
              columns:filteredMonths,
              data:filteredMovementTypes,
              formatValues:(v:number)=>v.toString()
            }}
            index={2}
            scrollRefs={scrollRefs}
          />
          <TableSection
            table={{
              title:"Дистанция по видам тренировок",
              leftLabel:"Вид",
              columns:filteredMonths,
              data:filteredDistanceTypes,
              formatValues:(v:number)=>`${v} км`
            }}
            index={3}
            scrollRefs={scrollRefs}
          />
        </div>
      </div>
    </div>
  );
}
