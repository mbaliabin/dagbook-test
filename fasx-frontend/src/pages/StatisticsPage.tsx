import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import {
  Timer,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

dayjs.locale("ru");

// --- Компонент веб-календаря ---
interface CalendarWebProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onSelectRange: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: { startDate: Date; endDate: Date };
}

const CalendarWeb: React.FC<CalendarWebProps> = ({
  isOpen,
  anchorRef,
  onClose,
  onSelectRange,
  initialRange,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs | null>(
    initialRange ? dayjs(initialRange.startDate) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    initialRange ? dayjs(initialRange.endDate) : null
  );
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (initialRange) {
      setStartDate(dayjs(initialRange.startDate));
      setEndDate(dayjs(initialRange.endDate));
      setCurrentMonth(dayjs(initialRange.startDate));
    }
  }, [initialRange]);

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");
  const startDay = startOfMonth.day() === 0 ? 7 : startOfMonth.day(); // Пн=1
  const daysInMonth = endOfMonth.date();

  const weeks: (number | null)[][] = [];
  let dayCounter = 1 - (startDay - 1);
  while (dayCounter <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(dayCounter > 0 && dayCounter <= daysInMonth ? dayCounter : null);
      dayCounter++;
    }
    weeks.push(week);
  }

  const handleDayClick = (d: number | null) => {
    if (!d) return;
    const clickedDate = currentMonth.date(d);
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate.isBefore(startDate)) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
  };

  const applyRange = () => {
    if (startDate && endDate) {
      onSelectRange({ startDate: startDate.toDate(), endDate: endDate.toDate() });
    }
  };

  return (
    <div
      className="absolute bg-[#1c1c1e] text-gray-200 rounded-2xl shadow-lg p-4 z-50 w-80"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300"
        >
          ◀
        </button>
        <div className="flex items-center space-x-2 font-semibold text-white">
          <span className="capitalize">{currentMonth.format("MMMM")}</span>
          <span>{currentMonth.format("YYYY")}</span>
        </div>
        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="px-2 py-1 rounded-md hover:bg-gray-700 text-gray-300"
        >
          ▶
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-400 mb-2">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const dateObj = d ? currentMonth.date(d) : null;
            const isSelected =
              dateObj &&
              ((startDate && dateObj.isSame(startDate, "day")) ||
                (endDate && dateObj.isSame(endDate, "day")) ||
                (startDate && endDate && dateObj.isAfter(startDate) && dateObj.isBefore(endDate)));
            const isToday = dateObj && dateObj.isSame(dayjs(), "day");

            return (
              <div
                key={`${wi}-${di}`}
                className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition
                  ${!d ? "opacity-30" : ""}
                  ${isSelected ? "bg-blue-600 text-white" : ""}
                  ${isToday && !isSelected ? "border border-blue-500" : ""}
                  ${!isSelected && !isToday && d ? "hover:bg-gray-700" : ""}
                `}
                onClick={() => handleDayClick(d)}
              >
                {d}
              </div>
            );
          })
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
        >
          Отмена
        </button>
        <button
          onClick={applyRange}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          disabled={!startDate || !endDate}
        >
          Применить
        </button>
      </div>
    </div>
  );
};

// --- Основная страница StatsPage ---
export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = useState("Пользователь");
  const [reportType, setReportType] = useState("Общий отчет");
  const [startPeriod, setStartPeriod] = useState(dayjs("2025-01-01").toDate());
  const [endPeriod, setEndPeriod] = useState(dayjs("2025-12-31").toDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  const totals = { trainingDays: 83, sessions: 128, time: "178:51" };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Верхний блок с аватаром и кнопками */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("/profile/settings")}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" /> Настройка профиля
            </button>
            <button
              onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Панель выбора отчета */}
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

          <div className="flex items-center gap-2 mt-2 md:mt-0 relative">
            <label className="text-gray-400 text-sm">Период:</label>
            <button
              ref={calendarButtonRef}
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
            >
              Выбрать период
            </button>
            <span className="text-gray-300 text-sm">
              {dayjs(startPeriod).format("D MMM")} – {dayjs(endPeriod).format("D MMM")}
            </span>

            <CalendarWeb
              isOpen={isCalendarOpen}
              anchorRef={calendarButtonRef}
              onClose={() => setIsCalendarOpen(false)}
              initialRange={{ startDate: startPeriod, endDate: endPeriod }}
              onSelectRange={({ startDate, endDate }) => {
                setStartPeriod(startDate);
                setEndPeriod(endDate);
                setIsCalendarOpen(false);
              }}
            />
          </div>
        </div>

        {/* Таблица выносливости */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">Таблица выносливости</h2>
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gray-700 px-2 py-1 text-left">Зона</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="border-b border-gray-700 px-2 py-1">{m}</th>
                ))}
                <th className="border-b border-gray-700 px-2 py-1">Итого</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnduranceZones.map((z) => (
                <tr key={z.zone}>
                  <td className="px-2 py-1">{z.zone}</td>
                  {z.months.map((v, i) => (
                    <td key={i} className="px-2 py-1">{v}</td>
                  ))}
                  <td className="px-2 py-1 font-semibold">{z.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Таблица активности */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">Форма активности</h2>
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gray-700 px-2 py-1 text-left">Тип</th>
                {filteredMonths.map((m) => (
                  <th key={m} className="border-b border-gray-700 px-2 py-1">{m}</th>
                ))}
                <th className="border-b border-gray-700 px-2 py-1">Итого</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map((m) => (
                <tr key={m.type}>
                  <td className="px-2 py-1">{m.type}</td>
                  {m.months.map((v, i) => (
                    <td key={i} className="px-2 py-1">{v}</td>
                  ))}
                  <td className="px-2 py-1 font-semibold">{m.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
