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
  Legend,
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
  const [periodType, setPeriodType] =
    React.useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = React.useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] =
    React.useState(false);

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
    distance: 1240,
  };

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн",
    "Июл","Авг","Сен","Окт","Ноя","Дек",
  ];

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

  // --- NEW: данные по дистанции (примерные) ---
  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];
  // -----------------------------------------------

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatTimeSafe = (val: number | string) => {
    if (typeof val === "number") return formatTime(val);
    return val;
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

  // --- NEW: фильтруем дистанции под выбранный период ----
  const filteredDistanceTypes = distanceByType.map((d) => {
    const sliceLength = Math.min(d.distance.length, filteredMonths.length);
    const monthsArr = d.distance.slice(0, sliceLength);
    return {
      type: d.type,
      months: monthsArr,
      total: monthsArr.reduce((a, b) => a + b, 0),
    };
  });
  // -------------------------------------------------------

  const sumColumn = (rows: any[], colIndex: number) => {
    let sum = 0;
    rows.forEach((row) => {
      const val = row.months[colIndex];
      if (typeof val === "number") sum += val;
      else if (typeof val === "string") {
        const [h, m] = val.split(":").map(Number);
        sum += h * 60 + m;
      }
    });
    return formatTime(sum);
  };

  const scrollRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => {
      if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft;
    });
  };

  const TableSection: React.FC<{ table: any; index: number }> = ({
    table,
    index,
  }) => {
    const weekColWidth = 80;
    const monthColWidth = 100;
    const yearColWidth = 80;
    const leftColWidth =
      table.title === "Тип активности" || table.title === "Дистанция по видам тренировок"
        ? 260
        : 200;
    const totalColWidth = 80;

    const colWidth =
      periodType === "week"
        ? weekColWidth
        : periodType === "month"
        ? monthColWidth
        : yearColWidth;

    const computedMinWidth = Math.max(
      1600,
      filteredMonths.length * colWidth + leftColWidth + totalColWidth
    );

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {table.title}
        </h2>

        <div
          ref={scrollRefs[index]}
          className="overflow-x-auto"
          onScroll={(e) => handleScroll(e, index)}
        >
          <div
            style={{ minWidth: computedMinWidth }}
            className="transition-all duration-300"
          >
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div
                className="p-3 font-medium sticky left-0 bg-[#222] z-20"
                style={{ width: leftColWidth }}
              >
                {table.title === "Параметры дня"
                  ? "Параметр"
                  : table.title === "Выносливость"
                  ? "Зона"
                  : table.title === "Тип активности" || table.title === "Дистанция по видам тренировок"
                  ? "Тип / Вид"
                  : "Тип активности"}
              </div>

              {filteredMonths.map((m, idx) => (
                <div
                  key={m + "-h-" + idx}
                  className="p-3 text-center flex-none font-medium"
                  style={{ width: colWidth }}
                >
                  {m}
                </div>
              ))}

              <div
                className="p-3 text-center font-medium bg-[#1f1f1f] flex-none"
                style={{ width: totalColWidth }}
              >
                Всего
              </div>
            </div>

            <div>
              {table.data.map((row: any, j: number) => (
                <div
                  key={j}
                  className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
                >
                  <div
                    className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2"
                    style={{ width: leftColWidth }}
                  >
                    {row.color && (
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: row.color }}
                      ></span>
                    )}
                    <div className="truncate">{row.param || row.type}</div>
                  </div>

                  {filteredMonths.map((val: number | string, k: number) => (
                    <div
                      key={k}
                      className="p-3 text-center flex-none"
                      style={{ width: colWidth }}
                    >
                      {table.title === "Параметры дня"
                        ? row.months[k]
                        : table.title === "Дистанция по видам тренировок"
                        ? row.months[k]
                        : formatTimeSafe(row.months[k])}
                    </div>
                  ))}

                  <div
                    className="p-3 text-center bg-[#1f1f1f] flex-none"
                    style={{ width: totalColWidth }}
                  >
                    {table.totalKey === "distance" ? row.total : row.total}
                  </div>
                </div>
              ))}

              {table.title !== "Параметры дня" && (
                <div className="flex border-t border-[#2a2a2a] bg-[#222] font-semibold">
                  <div
                    className="p-3 sticky left-0 bg-[#222] z-10"
                    style={{ width: leftColWidth }}
                  >
                    Итого
                  </div>

                  {filteredMonths.map((_, idx) => (
                    <div
                      key={idx}
                      className="p-3 text-center flex-none"
                      style={{ width: colWidth }}
                    >
                      {table.title === "Параметры дня"
                        ? "—"
                        : table.title === "Дистанция по видам тренировок"
                        ? (() => {
                            const sum = filteredDistanceTypes.reduce(
                              (acc, r) => acc + (r.months[idx] || 0),
                              0
                            );
                            return sum;
                          })()
                        : sumColumn(table.data, idx)}
                    </div>
                  ))}

                  <div
                    className="p-3 text-center flex-none"
                    style={{ width: totalColWidth }}
                  >
                    —
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

  const totalDistanceByMonth = filteredMonths.map((m, i) =>
    distanceByType.reduce((acc, t) => acc + (t.distance[i] || 0), 0)
  );

  const distanceColors: Record<string, string> = {
    "Лыжи, к. ст.": "#4ade80",
    "Лыжи, кл. ст.": "#22d3ee",
    "Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c",
    "Бег": "#ef4444",
    "Велосипед": "#3b82f6",
    "Другое": "#a855f7",
    "Силовая": "#a78bfa",
  };

  const stackedDistanceData = filteredMonths.map((label, idx) => {
    const row: any = { month: label };
    filteredDistanceTypes.forEach((t) => {
      row[t.type] = t.months[idx] || 0;
    });
    return row;
  });

  const activeDistanceTypes = filteredDistanceTypes
    .filter((t) => (t.months || []).some((v) => Number(v) > 0))
    .map((t) => t.type);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>

            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${
                  isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* REPORT/PERIOD */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span>Период:</span>
            <button
              className="bg-[#222] px-3 py-1 rounded hover:bg-[#333]"
              onClick={() =>
                setPeriodType((prev) =>
                  prev === "week" ? "month" : prev === "month" ? "year" : "week"
                )
              }
            >
              {periodType === "week"
                ? "Неделя"
                : periodType === "month"
                ? "Месяц"
                : "Год"}
            </button>

            <button
              className="flex items-center gap-1 bg-[#222] px-3 py-1 rounded hover:bg-[#333]"
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            >
              Произвольный период <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {showDateRangePicker && (
            <div className="absolute z-50 mt-2">
              <DateRange
                locale={ru}
                ranges={[
                  {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    key: "selection",
                  },
                ]}
                onChange={(range: any) =>
                  setDateRange({
                    startDate: range.selection.startDate,
                    endDate: range.selection.endDate,
                  })
                }
              />
              <button
                className="mt-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                onClick={applyDateRange}
              >
                Применить
              </button>
            </div>
          )}
        </div>

        {/* TABLES */}
        <div className="space-y-6">
          <TableSection
            index={0}
            table={{
              title: "Параметры дня",
              data: filteredMovementTypes,
            }}
          />
          <TableSection
            index={1}
            table={{
              title: "Выносливость",
              data: filteredEnduranceZones,
            }}
          />
          <TableSection
            index={2}
            table={{
              title: "Дистанция по видам тренировок",
              data: filteredDistanceTypes,
            }}
          />
        </div>

        {/* DISTANCE CHART */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Дистанция по видам
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedDistanceData}>
              <XAxis dataKey="month" tick={{ fill: "#ccc" }} />
              <Tooltip
                cursor={{ fill: "#333" }}
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
              <Legend />
              {activeDistanceTypes.map((type) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId="a"
                  fill={distanceColors[type] || "#fff"}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
