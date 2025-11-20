import React, { useRef, useEffect } from "react";
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

// Файл: StatsPage.tsx (refactor)
// Цель: улучшить визуал и структуру, не менять данные и смысл вычислений

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

  // --- Мок-данные (без изменений по сути) ---
  const totals = React.useMemo(() => ({ trainingDays: 83, sessions: 128, time: "178:51" }), []);

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  const enduranceZones = React.useMemo(() => [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2] },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1] },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1] },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0] },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0] },
  ], []);

  const movementTypes = React.useMemo(() => [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2] },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1] },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0] },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0] },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0] },
  ], []);

  // --- Форматирование времени (используется в тултипе графика) ---
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // --- Колонки периода (вынесены и мемоизированы) ---
  const computeWeekColumns = React.useCallback(() => {
    const today = dayjs();
    const currentWeek = today.week();
    const currentYear = today.year();
    const weeks: string[] = [];
    for (let i = 1; i <= currentWeek; i++) weeks.push(`${i} / ${currentYear}`);
    return weeks;
  }, []);

  const computeMonthColumns = React.useCallback(() => {
    const today = dayjs();
    const currentMonth = today.month();
    return months.slice(0, currentMonth + 1);
  }, [months]);

  const computeColumns = React.useCallback(() => {
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
  }, [periodType, dateRange, computeWeekColumns, computeMonthColumns, months]);

  const filteredMonths = React.useMemo(() => computeColumns(), [computeColumns]);

  const filteredEnduranceZones = React.useMemo(() => {
    return enduranceZones.map((zone) => {
      const sliceLength = Math.min(zone.months.length, filteredMonths.length);
      return {
        ...zone,
        months: zone.months.slice(0, sliceLength),
        total: zone.months.slice(0, sliceLength).reduce((a,b) => a+b,0),
      };
    });
  }, [enduranceZones, filteredMonths]);

  const filteredMovementTypes = React.useMemo(() => {
    return movementTypes.map((m) => {
      const sliceLength = Math.min(m.months.length, filteredMonths.length);
      return {
        ...m,
        months: m.months.slice(0, sliceLength),
        total: m.months.slice(0, sliceLength).reduce((a,b) => a+b,0),
      };
    });
  }, [movementTypes, filteredMonths]);

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

  // --- Ссылки для синхронного скролла ---
  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // Более плавная синхронизация: debounce через rAF
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    // синхронизируем остальные
    scrollRefs.forEach((ref, i) => {
      if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft;
    });
  };

  // --- Подкомпоненты внутри файла (чтобы не дробить проект сейчас) ---

  const TopHeader: React.FC = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
      <div className="flex items-center space-x-4">
        <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-sm text-gray-400">Статистика за выбранный период</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-wrap">
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
          <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
        </button>
        <button onClick={handleLogout} className="bg-transparent border border-[#2b2b2b] hover:bg-[#1b1b1b] text-white text-sm px-3 py-1 rounded flex items-center">
          <LogOut className="w-4 h-4 mr-1" /> Выйти
        </button>
      </div>
    </div>
  );

  const MenuBar: React.FC = () => (
    <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
      {menuItems.map((item) => {
        const Icon = item.icon as any;
        const isActive = location.pathname === item.path;
        return (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-400" : "text-gray-400 hover:text-white"}`}
          >
            <Icon className="w-6 h-6" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  const PeriodSelector: React.FC = () => (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <select className="bg-[#1f1f22] text-white px-3 py-1 rounded" value={reportType} onChange={e => setReportType(e.target.value)}>
        <option>Общий отчет</option>
      </select>

      {([['week','Неделя'],['month','Месяц'],['year','Год']] as const).map(([t, label])=> (
        <button key={t} onClick={()=>setPeriodType(t as any)} className={`px-3 py-1 rounded ${periodType===t? 'bg-blue-600 text-white' : 'bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]'}`}>
          {label}
        </button>
      ))}

      <div className="relative">
        <button onClick={() => setShowDateRangePicker(prev => !prev)} className={`px-3 py-1 rounded ${periodType==='custom' ? 'bg-blue-600 text-white' : 'bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]'} flex items-center`}>
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
  );

  const TotalsBlock: React.FC = () => (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Итоги</h1>
      <div className="flex flex-wrap gap-4 mt-3">
        <div className="bg-[#171717] p-4 rounded-xl shadow-md min-w-[160px]">
          <p className="text-xs text-gray-400">Тренировочные дни</p>
          <p className="text-2xl font-semibold text-white">{totals.trainingDays}</p>
        </div>
        <div className="bg-[#171717] p-4 rounded-xl shadow-md min-w-[160px]">
          <p className="text-xs text-gray-400">Сессий</p>
          <p className="text-2xl font-semibold text-white">{totals.sessions}</p>
        </div>
        <div className="bg-[#171717] p-4 rounded-xl shadow-md min-w-[160px]">
          <p className="text-xs text-gray-400">Время</p>
          <p className="text-2xl font-semibold text-white">{totals.time}</p>
        </div>
      </div>
    </div>
  );

  // --- Chart ---
  const EnduranceChart: React.FC = () => {
    const chartData = React.useMemo(() => filteredMonths.map((month, i) => {
      const data: any = { month };
      filteredEnduranceZones.forEach((zone) => data[zone.zone] = zone.months[i] ?? 0);
      return data;
    }), [filteredMonths, filteredEnduranceZones]);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Зоны выносливости</h2>
          <div className="flex items-center space-x-3">
            {filteredEnduranceZones.map(z => (
              <div key={z.zone} className="flex items-center text-xs text-gray-300 gap-2">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: z.color}} />
                <span>{z.zone}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 13 }} />
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
              {filteredEnduranceZones.map((zone) => (
                <Bar key={zone.zone} dataKey={zone.zone} stackId="a" fill={zone.color} radius={[4,4,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // --- универсальная табличная секция ---
  type TableDef = { title: string; data: any[] };

  const TableSection: React.FC<{ table: TableDef; index: number }> = React.memo(({ table, index }) => {
    // рассчитываем фиксированную ширину для недельной колонки и общую minWidth
    const colWidth = periodType === 'week' ? 80 : undefined; // px when week
    const leftColWidth = 160; // w-40 ~ 160px
    const totalColWidth = 80;
    const computedMinWidth = React.useMemo(() => {
      if (periodType === 'week') return Math.max(900, filteredMonths.length * (colWidth as number) + leftColWidth + totalColWidth);
      return Math.max(900, filteredMonths.length * 120 + leftColWidth + totalColWidth);
    }, [periodType, filteredMonths.length]);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div
          ref={scrollRefs[index]}
          className="overflow-x-auto"
          onScroll={(e)=>handleScroll(e,index)}
        >
          <div style={{ minWidth: computedMinWidth }} className="transition-all duration-300">
            {/* Заголовки */}
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 box-border z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftColWidth }}>{table.title==="Параметры дня"?"Параметр":table.title==="Выносливость"?"Зона":"Тип активности"}</div>
              {filteredMonths.map((m, idx)=>(
                <div
                  key={m+"-h-"+idx}
                  className="p-3 text-center box-border font-medium flex-none"
                  style={{ width: periodType === 'week' ? colWidth : undefined }}
                >{m}</div>
              ))}
              <div className="p-3 text-center font-medium bg-[#1f1f1f] box-border flex-none" style={{ width: totalColWidth }}>Всего</div>
            </div>
            {/* Данные */}
            <div>
              {table.data.map((row:any,j:number)=>(
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftColWidth }}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: row.color}}></span>}
                    <div className="truncate">{row.param}</div>
                  </div>
                  {filteredMonths.map((val:number,k:number)=>(
                    <div
                      key={k}
                      className="p-3 text-center box-border flex-none"
                      style={{ width: periodType === 'week' ? colWidth : undefined }}
                    >{row.months[k] ?? 0}</div>
                  ))}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>{row.total ?? (row.months ? row.months.reduce((a:number,b:number)=>a+b,0) : 0)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  });

  // --- Подготовка таблиц (без изменений данных) ---
  const tables: TableDef[] = React.useMemo(() => ([
    { title: "Параметры дня", data: [
      { param: "Травма", months: [0,1,0,0,0,0,0,0,0,0,1,0] },
      { param: "Болезнь", months: [1,0,0,0,0,0,0,0,0,1,0,0] },
      { param: "Выходной", months: [2,3,1,2,1,1,3,2,1,2,1,1] },
      { param: "Соревнования", months: [0,1,0,2,1,1,2,1,1,0,0,0] },
      { param: "В пути", months: [1,0,1,0,1,2,1,1,0,1,1,0] },
    ] },
    { title: "Выносливость", data: filteredEnduranceZones.map(z=>({ param: z.zone, months: z.months, total: z.total, color: z.color })) },
    { title: "Формы активности", data: filteredMovementTypes.map(m=>({ param: m.type, months: m.months, total: m.total })) }
  ]), [filteredEnduranceZones, filteredMovementTypes]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">

        <TopHeader />
        <MenuBar />
        <PeriodSelector />
        <TotalsBlock />

        <EnduranceChart />

        {tables.map((t,i)=>(<TableSection key={t.title} table={t} index={i} />))}

      </div>
    </div>
  );
}
