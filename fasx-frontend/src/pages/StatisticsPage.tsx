import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Timer,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "react-date-range";
import ru from "date-fns/locale/ru";

dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();

  // --- STATES ---
  const [name] = React.useState("Пользователь");
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [startPeriod, setStartPeriod] = React.useState("2025-01-01");
  const [endPeriod, setEndPeriod] = React.useState("2025-12-31");
  const [year, setYear] = React.useState("2025");
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date } | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState(dayjs());

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // --- TOTALS ---
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек",
  ];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2], total: 105 },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1], total: 47 },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1], total: 12 },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0], total: 7 },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0], total: 3 },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2], total: 20 },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1], total: 13 },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0], total: 35 },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0], total: 39 },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0], total: 16 },
  ];

  // --- HELPERS ---
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const startMonth = dayjs(startPeriod).month();
  const endMonth = dayjs(endPeriod).month();

  const filteredMonths = months.slice(startMonth, endMonth + 1);
  const filteredEnduranceZones = enduranceZones.map((zone) => ({
    ...zone,
    months: zone.months.slice(startMonth, endMonth + 1),
    total: zone.months.slice(startMonth, endMonth + 1).reduce((a,b) => a+b, 0),
  }));
  const filteredMovementTypes = movementTypes.map((m) => ({
    ...m,
    months: m.months.slice(startMonth, endMonth + 1),
    total: m.months.slice(startMonth, endMonth + 1).reduce((a,b) => a+b, 0),
  }));

  // --- EVENTS ---
  const onPrevMonth = () => setSelectedMonth(prev => prev.subtract(1, "month"));
  const onNextMonth = () => setSelectedMonth(prev => prev.add(1, "month"));

  const applyDateRange = () => {
    if (dateRange) {
      setStartPeriod(dayjs(dateRange.startDate).format("YYYY-MM-DD"));
      setEndPeriod(dayjs(dateRange.endDate).format("YYYY-MM-DD"));
    }
    setShowDateRangePicker(false);
  };

  const handleLogout = () => {
    // logout logic
    console.log("logout");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header: фото профиля + имя + кнопки + выбор периода */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {loadingProfile ? "Загрузка..." : name}
              </h1>
              <p className="text-sm text-white">
                {!dateRange
                  ? selectedMonth.format("MMMM YYYY")
                  : `${dayjs(dateRange.startDate).format("DD MMM YYYY")} — ${dayjs(dateRange.endDate).format("DD MMM YYYY")}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Выбор периода */}
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                className="flex items-center text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onPrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                className="relative bg-[#1f1f22] text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer select-none"
                onClick={() => { setShowDateRangePicker(false); setDateRange(null); }}
                title="Показать текущий месяц"
              >
                {selectedMonth.format("MMMM YYYY")}
              </div>
              <button
                className="text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setDateRange({ startDate: dayjs().startOf("isoWeek").toDate(), endDate: dayjs().endOf("isoWeek").toDate() });
                  setShowDateRangePicker(false);
                }}
                className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]"
              >
                Текущая неделя
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDateRangePicker(prev => !prev)}
                  className="ml-2 text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d] flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Произвольный период
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {showDateRangePicker && (
                  <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                    <DateRange
                      onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                      showSelectionPreview
                      moveRangeOnFirstSelection={false}
                      months={1}
                      ranges={[{ startDate: dateRange?.startDate || new Date(), endDate: dateRange?.endDate || new Date(), key: 'selection' }]}
                      direction="horizontal"
                      rangeColors={['#3b82f6']}
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

            {/* Кнопки */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
              >
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
        </div>

        {/* ПАНЕЛЬ ВЫБОРА ОТЧЕТА */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#1a1a1a] p-4 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Тип отчета:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-[#0f0f0f] text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option>Общий отчет</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label className="text-gray-400 text-sm">Период:</label>
            <input
              type="date"
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value)}
              className="bg-[#0f0f0f] text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm"
            />
            <input
              type="date"
              value={endPeriod}
              onChange={(e) => setEndPeriod(e.target.value)}
              className="bg-[#0f0f0f] text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm"
            />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-[#0f0f0f] text-gray-200 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        {/* TOTALSUM */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">TOTALSUM</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div>
              <p className="text-gray-400">Тренировочные дни</p>
              <p className="text-xl text-gray-100">{totals.trainingDays}</p>
            </div>
            <div>
              <p className="text-gray-400">Сессий</p>
              <p className="text-xl text-gray-100">{totals.sessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Время</p>
              <p className="text-xl text-gray-100">{totals.time}</p>
            </div>
          </div>
        </div>

        {/* Диаграмма зон выносливости */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredMonths.map((month, i) => {
                  const data: any = { month };
                  filteredEnduranceZones.forEach((zone) => (data[zone.zone] = zone.months[i]));
                  return data;
                })}
                barSize={35}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="mt-1">
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {formatTime(p.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {filteredEnduranceZones.map((zone) => (
                  <Bar key={zone.zone} dataKey={zone.zone} stackId="a" fill={zone.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Таблицы */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Выносливость (Utholdenhet)</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
                {filteredMonths.map((m) => (<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnduranceZones.map((z) => (
                <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 flex items-center gap-3 sticky left-0 bg-[#1a1a1a]">
                    <div className="w-5 h-5 rounded-md" style={{ backgroundColor: z.color }}></div>
                    {z.zone}
                  </td>
                  {z.months.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(z.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Формы активности (Bevegelsesformer)</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип активности</th>
                {filteredMonths.map((m) => (<th key={m} className="p-3 font-medium text-center">{m}</th>))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map((m) => (
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                  {m.months.map((val, i) => (<td key={i} className="p-3 text-center">{val > 0 ? formatTime(val) : "-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
