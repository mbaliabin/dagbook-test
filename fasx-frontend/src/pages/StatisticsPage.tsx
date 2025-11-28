import React, { useRef } from "react";
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

import { TableSection } from "../components/TableSection"; // убедись, что путь верный

dayjs.extend(weekOfYear);
dayjs.locale("ru");

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------- Tooltip --------------------
  const CustomTooltip: React.FC<any> = ({
    active,
    payload,
    label,
    formatHours,
  }) => {
    if (!active || !payload || payload.length === 0) return null;

    const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

    const formatValue = (v: number) => {
      if (!formatHours) return `${v} км`;
      const h = Math.floor(v / 60);
      const m = v % 60;
      return `${h}:${m.toString().padStart(2, "0")}`;
    };

    return (
      <div className="bg-[#111]/90 border border-[#2a2a2a] px-2.5 py-2 rounded-lg shadow-lg text-gray-200 text-xs w-48 backdrop-blur-sm">
        <p className="font-semibold mb-1 text-[13px]">{label}</p>
        <div className="space-y-0.5">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between gap-2 items-start">
              <span className="text-gray-400 break-words leading-tight max-w-[120px]">
                {p.name}
              </span>
              <span className="font-mono text-right min-w-[55px]" style={{ color: p.fill }}>
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

  // -------------------- State --------------------
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
    { type: "Роллеры, классика", distance: [30,25,35,20,30,25,30,0,0,0,0,0] },
    { type: "Роллеры, скейтинг", distance: [25,20,30,15,25,20,25,0,0,0,0,0] },
    { type: "Велосипед", distance: [100,80,120,70,90,80,100,0,0,0,0,0] },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2,"0")}`;
  };

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref,i)=>{ if(i!==index && ref.current) ref.current.scrollLeft = scrollLeft; });
  };

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

  // Тут можно добавить фильтры, таблицы и визуализацию аналогично твоему коду
  // Используй компонент TableSection так:
  // <TableSection table={{title:"Выносливость", data:filteredEnduranceZones.map(z=>({param:z.zone,color:z.color,months:z.months,total:formatTime(z.total)}))}} index={0}/>

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <h1 className="text-2xl font-bold text-white mb-4">Статистика {name}</h1>
      {/* Здесь рендерим таблицы и графики */}
    </div>
  );
};

// -------------------- Export --------------------
export default StatsPage;
