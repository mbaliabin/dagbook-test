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

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  const formatTimeSafe = (val: number | string) => {
    if (typeof val === "number") return val;
    return val;
  };

  const filteredEnduranceZones = enduranceZones.map((z) => ({
    ...z,
    months: z.months,
    total: z.months.reduce((a, b) => a + b, 0),
  }));

  const filteredMovementTypes = movementTypes.map((m) => ({
    ...m,
    months: m.months,
    total: m.months.reduce((a, b) => a + b, 0),
  }));

  const filteredDistanceTypes = distanceByType.map((d) => ({
    ...d,
    months: d.distance,
    total: d.distance.reduce((a, b) => a + b, 0),
  }));

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
    const leftColWidth = 260;
    const colWidth = 100;
    const totalColWidth = 80;

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
          <div className="min-w-[900px]">
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div
                className="p-3 font-medium sticky left-0 bg-[#222] z-20"
                style={{ width: leftColWidth }}
              >
                {table.title === "Выносливость" ? "Зона" : "Тип / Вид"}
              </div>
              {months.map((m, idx) => (
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

                  {row.months.map((val: number | string, k: number) => (
                    <div
                      key={k}
                      className="p-3 text-center flex-none"
                      style={{ width: colWidth }}
                    >
                      {formatTimeSafe(val)}
                    </div>
                  ))}

                  <div
                    className="p-3 text-center bg-[#1f1f1f] flex-none"
                    style={{ width: totalColWidth }}
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

  const distanceColors: Record<string, string> = {
    "Лыжи, к. ст.": "#4ade80",
    "Лыжи, кл. ст.": "#22d3ee",
    "Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c",
    "Бег": "#ef4444",
    "Велосипед": "#3b82f6",
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* Header */}
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

        {/* Menu */}
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

        {/* Totals */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
            <div><p className="text-gray-400">Общее расстояние (км)</p><p className="text-xl text-gray-100">{totals.distance}</p></div>
          </div>
        </div>

        {/* Диаграмма зон */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months.map((month, i) => {
                  const data: any = { month };
                  filteredEnduranceZones.forEach((zone) => {
                    data[zone.zone] = zone.months[i] || 0;
                  });
                  return data;
                })}
                barGap={0}
                barCategoryGap="0%"
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.some((p: any) => p.value > 0)) {
                      return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">
                          {payload.filter((p: any) => p.value > 0).map((p: any) => (
                            <div key={p.dataKey}>
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {p.value}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {filteredEnduranceZones.map((zone) => (
                  <Bar
                    key={zone.zone}
                    dataKey={zone.zone}
                    stackId="a"
                    fill={zone.color}
                    minPointSize={1}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Таблицы */}
        <TableSection table={{ title: "Выносливость", data: filteredEnduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total })) }} index={0} />
        <TableSection table={{ title: "Форма активности", data: filteredMovementTypes.map(m => ({ param: m.type, months: m.months, total: m.total })) }} index={1} />

        {/* Диаграмма общей дистанции */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам тренировок</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months.map((month, i) => {
                  const data: any = { month };
                  filteredDistanceTypes.forEach((t) => {
                    data[t.type] = t.months[i] || 0;
                  });
                  return data;
                })}
                barGap={0}
                barCategoryGap="0%"
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.some((p: any) => p.value > 0)) {
                      return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">
                          {payload.filter((p: any) => p.value > 0).map((p: any) => (
                            <div key={p.dataKey}>
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {p.value} км
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {filteredDistanceTypes.map((t) => (
                  <Bar
                    key={t.type}
                    dataKey={t.type}
                    stackId="a"
                    fill={distanceColors[t.type]}
                    minPointSize={1}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TableSection table={{ title: "Дистанция по видам тренировок", data: filteredDistanceTypes.map(d => ({ param: d.type, months: d.months, total: d.total })) }} index={2} />
      </div>
    </div>
  );
}
