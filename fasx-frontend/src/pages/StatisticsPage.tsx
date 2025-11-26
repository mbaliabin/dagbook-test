import React, { useRef, useMemo } from "react";
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
  const [periodType, setPeriodType] = React.useState("year");
  const [dateRange, setDateRange] = React.useState({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
    distance: 1240,
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [80, 70, 90, 50, 75, 65, 70] },
    { zone: "I2", color: "#22d3ee", months: [40, 50, 45, 35, 50, 40, 45] },
    { zone: "I3", color: "#facc15", months: [15, 10, 20, 5, 15, 10, 10] },
    { zone: "I4", color: "#fb923c", months: [5, 10, 5, 0, 5, 5, 5] },
    { zone: "I5", color: "#ef4444", months: [0, 0, 5, 0, 0, 0, 0] },
  ];

  const movementTypes = [
    { type: "Лыжи, к. ст.", months: [70, 50, 60, 45, 65, 75, 80] },
    { type: "Лыжи, кл. ст.", months: [60, 40, 50, 35, 55, 60, 65] },
    { type: "Лыжероллеры, к. ст", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Лыжероллеры, кл. ст.", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Бег", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Силовая", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Велосипед", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Другое", months: [40, 35, 50, 30, 45, 30, 40] },
  ];

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatTimeSafe = (val) => typeof val === "number" ? formatTime(val) : val;

  const computeMonthColumns = () => {
    const today = dayjs();
    const currentMonth = today.month();
    return months.slice(0, currentMonth + 1);
  };

  const filteredMonths = computeMonthColumns();

  const filteredEnduranceZones = enduranceZones.map((zone) => {
    const sliceLength = Math.min(zone.months.length, filteredMonths.length);
    return {
      ...zone,
      months: zone.months.slice(0, sliceLength),
      total: zone.months.slice(0, sliceLength).reduce((a, b) => a + b, 0),
    };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const sliceLength = Math.min(m.months.length, filteredMonths.length);
    return {
      ...m,
      months: m.months.slice(0, sliceLength),
      total: m.months.slice(0, sliceLength).reduce((a, b) => a + b, 0),
    };
  });

  const filteredDistanceTypes = distanceByType.map((d) => {
    const sliceLength = Math.min(d.distance.length, filteredMonths.length);
    const monthsArr = d.distance.slice(0, sliceLength);
    return {
      type: d.type,
      months: monthsArr,
      total: monthsArr.reduce((a, b) => a + b, 0),
    };
  });

  const activeDistanceTypes = filteredDistanceTypes.filter((t) => t.months.some((v) => Number(v) > 0)).map((t) => t.type);
  const activeEnduranceZones = filteredEnduranceZones.filter((z) => z.months.some((v) => Number(v) > 0));

  const distanceChartData = useMemo(() => {
    return filteredMonths.map((month, i) => {
      const row = { month };
      let hasValue = false;
      activeDistanceTypes.forEach((t) => {
        const v = Number(filteredDistanceTypes.find(d => d.type === t).months[i]) || 0;
        if (v > 0) {
          row[t] = v;
          hasValue = true;
        }
      });
      return hasValue ? row : null;
    }).filter(Boolean);
  }, [filteredMonths, activeDistanceTypes, filteredDistanceTypes]);

  const enduranceChartData = useMemo(() => {
    return filteredMonths.map((month, i) => {
      const row = { month };
      let hasValue = false;
      activeEnduranceZones.forEach((z) => {
        const v = Number(z.months[i]) || 0;
        if (v > 0) {
          row[z.zone] = v;
          hasValue = true;
        }
      });
      return hasValue ? row : null;
    }).filter(Boolean);
  }, [filteredMonths, activeEnduranceZones]);

  const scrollRefs = [useRef(null), useRef(null), useRef(null)];
  const handleScroll = (e, index) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => { if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft; });
  };

  const TableSection = ({ table, index }) => {
    const leftColWidth = table.title === "Тип активности" || table.title === "Дистанция по видам тренировок" ? 260 : 200;
    const totalColWidth = 80;
    const colWidth = 100;
    const computedMinWidth = Math.max(1600, filteredMonths.length * colWidth + leftColWidth + totalColWidth);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={(e) => handleScroll(e, index)}>
          <div style={{ minWidth: computedMinWidth }} className="transition-all duration-300">
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftColWidth }}>
                {table.title === "Параметры дня" ? "Параметр" : table.title === "Выносливость" ? "Зона" : "Тип / Вид"}
              </div>
              {filteredMonths.map((m, idx) => <div key={idx} className="p-3 text-center flex-none font-medium" style={{ width: colWidth }}>{m}</div>)}
              <div className="p-3 text-center font-medium bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>Всего</div>
            </div>
            <div>
              {table.data.map((row, j) => (
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftColWidth }}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></span>}
                    <div className="truncate">{row.param || row.type}</div>
                  </div>
                  {filteredMonths.map((val, k) => <div key={k} className="p-3 text-center flex-none" style={{ width: colWidth }}>{val === 0 ? "" : val}</div>)}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>{row.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const applyDateRange = () => setShowDateRangePicker(false);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const distanceColors = {
    "Лыжи, к. ст.": "#4ade80",
    "Лыжи, кл. ст.": "#22d3ee",
    "Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c",
    "Бег": "#ef4444",
    "Велосипед": "#3b82f6",
    "Другое": "#a855f7",
    "Силовая": "#a78bfa",
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER, MENU и REPORT/PERIOD остаются без изменений */}
        {/* ... */}

        {reportType === "Общая дистанция" && (
          <>
            <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам тренировок</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distanceChartData} barGap={0} barCategoryGap="0%">
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload) return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">
                          {payload.filter(p => p.value > 0).map(p => (
                            <div key={p.dataKey}><span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: p.fill }}></span>{p.dataKey}: {p.value} км</div>
                          ))}
                        </div>
                      );
                      return null;
                    }} />
                    {activeDistanceTypes.map(type => (
                      <Bar key={type} dataKey={type} stackId="a" fill={distanceColors[type] || "#888"} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <TableSection table={{ title: "Дистанция по видам тренировок", data: filteredDistanceTypes, totalKey: "distance" }} index={0} />
          </>
        )}
      </div>
    </div>
  );
}