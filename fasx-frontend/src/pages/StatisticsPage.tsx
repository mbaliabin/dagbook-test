import React, { useRef, useState } from "react";
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

dayjs.extend(weekOfYear);
dayjs.locale("ru");

// ---- Вспомогательные функции ----
const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

// ---- Кастомный тултип ----
const CustomTooltip: React.FC<any> = ({ active, payload, label, formatHours }) => {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  const formatValue = (v: number) =>
    formatHours ? formatTime(v) : `${v} км`;

  return (
    <div className="bg-[#111]/90 border border-[#2a2a2a] px-2.5 py-2 rounded-lg shadow-lg text-gray-200 text-xs w-48 backdrop-blur-sm">
      <p className="font-semibold mb-1 text-[13px]">{label}</p>
      <div className="space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex justify-between gap-2 items-start">
            <span className="text-gray-400 break-words leading-tight max-w-[120px]">
              {p.name}
            </span>
            <span
              className="font-mono text-right min-w-[55px]"
              style={{ color: p.fill }}
            >
              {formatValue(p.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[#2a2a2a] my-1.5"></div>
      <div className="flex justify-between font-semibold text-[13px]">
        <span className="text-gray-300">Итого</span>
        <span className="font-mono text-blue-400 min-w-[55px] text-right">
          {formatValue(total)}
        </span>
      </div>
    </div>
  );
};

// ---- TableSection с плавным синхронным скроллом ----
interface TableSectionProps {
  table: any;
  index: number;
  scrollRefs: React.RefObject<HTMLDivElement>[];
}

const TableSection: React.FC<TableSectionProps> = ({ table, index, scrollRefs }) => {
  const colWidth = 103;
  const leftWidth = 200;
  const totalWidth = 80;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrolling.current) {
      scrolling.current = true;
      const scrollLeft = e.currentTarget.scrollLeft;

      requestAnimationFrame(() => {
        scrollRefs.forEach((ref, i) => {
          if (i !== index && ref.current) {
            ref.current.scrollLeft = scrollLeft;
          }
        });
        scrolling.current = false;
      });
    }
  };

  const calculatedWidth = table.months.length * colWidth + leftWidth + totalWidth;

  return (
    <div ref={containerRef} className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg w-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>

      <div
        ref={scrollRefs[index]}
        className="overflow-x-auto"
        onScroll={handleScroll}
      >
        <div className="transition-all flex-shrink-0" style={{ minWidth: calculatedWidth }}>
          {/* HEADER */}
          <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
            <div
              className="p-3 font-medium sticky left-0 bg-[#222] z-20"
              style={{ width: leftWidth }}
            >
              {table.title === "Выносливость"
                ? "Зона"
                : table.title === "Тип активности"
                ? "Тип активности"
                : "Параметр"}
            </div>

            {table.months.map((m: string, idx: number) => (
              <div
                key={idx}
                className="p-3 text-center flex-none font-medium"
                style={{ width: colWidth }}
              >
                {m}
              </div>
            ))}

            <div
              className="p-3 text-center font-medium bg-[#1f1f1f] flex-none"
              style={{ width: totalWidth }}
            >
              Всего
            </div>
          </div>

          {/* ROWS */}
          <div>
            {table.data.map((row: any, j: number) => (
              <div
                key={j}
                className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
              >
                <div
                  className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2"
                  style={{ width: leftWidth }}
                >
                  {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                  <div className="truncate">{row.param || row.type}</div>
                </div>

                {row.months.map((val: number, k: number) => (
                  <div key={k} className="p-3 text-center flex-none" style={{ width: colWidth }}>
                    {table.title === "Выносливость" || table.title === "Тип активности"
                      ? formatTime(val)
                      : val}
                  </div>
                ))}

                <div
                  className="p-3 text-center bg-[#1f1f1f] flex-none"
                  style={{ width: totalWidth }}
                >
                  {row.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Основной компонент ----
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

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // --- Здесь можно добавить фильтры, таблицы и графики аналогично твоему коду ---
  // table.months = filteredMonths
  // table.data = filteredEnduranceZones или movementTypes и т.д.
  // Используем <TableSection table={...} index={i} scrollRefs={scrollRefs} />

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        <h1 className="text-2xl font-semibold text-white">{name}</h1>
        {/* Тут можно вставить меню, фильтры и графики */}
      </div>
    </div>
  );
}
