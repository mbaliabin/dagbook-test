import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import weekOfYear from "dayjs/plugin/weekOfYear";
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
    return `${h}:${m.toString().padStart(2,"0")}`;
  };

  const computeColumns = () => {
    if (periodType === "week") {
      const today = dayjs();
      const currentWeek = today.week();
      const currentYear = today.year();
      const weeks: string[] = [];
      for (let i = 1; i <= currentWeek; i++) weeks.push(`${i} / ${currentYear}`);
      return weeks;
    }
    if (periodType === "month") {
      const today = dayjs();
      const currentMonth = today.month();
      return months.slice(0, currentMonth + 1);
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

  const filteredEnduranceZones = enduranceZones.map((zone) => {
    const sliceLength = Math.min(zone.months.length, filteredMonths.length);
    return {
      ...zone,
      months: zone.months.slice(0, sliceLength),
      total: zone.months.slice(0, sliceLength).reduce((a,b)=>a+b,0),
    };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const sliceLength = Math.min(m.months.length, filteredMonths.length);
    return {
      ...m,
      months: m.months.slice(0, sliceLength),
      total: m.months.slice(0, sliceLength).reduce((a,b)=>a+b,0),
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

  const TableSection = ({ table, index }: { table: any; index: number }) => {
    const [tableWidth, setTableWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const leftColWidth = 180;
    const totalColWidth = 100;
    const minColWidth = 80;

    useEffect(() => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth - leftColWidth - totalColWidth;
      const dynamicColWidth = Math.max(minColWidth, availableWidth / filteredMonths.length);
      setTableWidth(leftColWidth + totalColWidth + dynamicColWidth * filteredMonths.length);
    }, [filteredMonths.length, containerRef.current, window.innerWidth]);

    const colWidth = tableWidth > 0 ? (tableWidth - leftColWidth - totalColWidth)/filteredMonths.length : minColWidth;

    return (
      <div ref={containerRef} className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={(e)=>handleScroll(e,index)}>
          <div style={{ minWidth: tableWidth }}>
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div style={{ width: leftColWidth }} className="p-3 font-medium sticky left-0 bg-[#222] z-20">
                {table.title==="Параметры дня"?"Параметр":table.title==="Выносливость"?"Зона":"Тип активности"}
              </div>
              {filteredMonths.map((m)=>(<div key={m} style={{ width: colWidth }} className="p-3 text-center font-medium">{m}</div>))}
              <div style={{ width: totalColWidth }} className="p-3 text-center font-medium bg-[#1f1f1f]">Всего</div>
            </div>
            <div>
              {table.data.map((row:any,j:number)=>(
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftColWidth }}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: row.color}}></span>}
                    <div className="truncate">{row.param}</div>
                  </div>
                  {filteredMonths.map((_,k)=>(
                    <div key={k} className="p-3 text-center flex-none" style={{ width: colWidth }}>
                      {(table.title === "Выносливость" || table.title === "Формы активности")
                        ? formatTime(row.months[k] ?? 0)
                        : row.months[k] ?? 0
                      }
                    </div>
                  ))}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>
                    {(table.title === "Выносливость" || table.title === "Формы активности")
                      ? formatTime(row.total ?? (row.months ? row.months.reduce((a:number,b:number)=>a+b,0) : 0))
                      : row.total ?? (row.months ? row.months.reduce((a:number,b:number)=>a+b,0) : 0)
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">
        {/* header, меню, выбор периода — оставляем как в предыдущем коде */}
        {/* ... вставьте код header и меню сюда ... */}

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
            { param: "Травма", months: [0,1,0,0,0,0,0,0,0,0,1,0] },
            { param: "Болезнь", months: [1,0,0,0,0,1,0,0,0,1,0,0] },
            { param: "Прочее", months: [0,0,0,1,0,0,1,0,0,0,0,0] },
          ] },
          { title: "Выносливость", data: filteredEnduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total })) },
          { title: "Формы активности", data: filteredMovementTypes.map(m => ({ param: m.type, months: m.months, total: m.total })) },
        ].map((table, index) => (
          <TableSection key={index} table={table} index={index} />
        ))}
      </div>
    </div>
  );
}
