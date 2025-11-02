import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Timer,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar,
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = useState("Пользователь");

  const [reportType, setReportType] = useState("Общий отчет");
  const [startPeriod, setStartPeriod] = useState(new Date("2025-01-01"));
  const [endPeriod, setEndPeriod] = useState(new Date("2025-12-31"));
  const [year, setYear] = useState("2025");

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingProfile] = useState(false);

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

  const onPrevMonth = () => setSelectedMonth(selectedMonth.subtract(1, "month"));
  const onNextMonth = () => setSelectedMonth(selectedMonth.add(1, "month"));

  const applyDateRange = () => setShowDateRangePicker(false);
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-white">{loadingProfile ? 'Загрузка...' : name}</h1>
              <p className="text-sm text-white">
                {dateRange
                  ? `${dayjs(dateRange.startDate).format('DD MMM YYYY')} — ${dayjs(dateRange.endDate).format('DD MMM YYYY')}`
                  : selectedMonth.format('MMMM YYYY')
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Date Picker */}
            <div className="flex items-center space-x-2 flex-wrap">
              <button className="flex items-center text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]" onClick={onPrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative bg-[#1f1f22] text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer select-none">
                {selectedMonth.format('MMMM YYYY')}
              </div>

              <button className="text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]" onClick={onNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDateRange({ startDate: dayjs().startOf('isoWeek').toDate(), endDate: dayjs().endOf('isoWeek').toDate() })}
                className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]"
              >
                Текущая неделя
              </button>

              <div className="relative">
                <button onClick={() => setShowDateRangePicker(prev => !prev)} className="ml-2 text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d] flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> Произвольный период <ChevronDown className="w-4 h-4 ml-1" />
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

            {/* Buttons */}
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
              </button>
              <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
                <LogOut className="w-4 h-4 mr-1" /> Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Остальной код таблиц и графиков без изменений */}

      </div>
    </div>
  );
}
