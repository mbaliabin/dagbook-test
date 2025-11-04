import React from "react";
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
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import weekOfYear from "dayjs/plugin/weekOfYear";

// импорт твоих компонентов
import IntensityChart from "../components/StatisticsPage/IntensityChart";
import EnduranceAndActivityTables from "../components/StatisticsPage/EnduranceAndActivityTables";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<
    "week" | "month" | "year" | "custom"
  >("year");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const applyDateRange = () => {
    setPeriodType("custom");
    setShowDateRangePicker(false);
  };

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
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

        {/* Верхнее меню */}
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

        {/* Выбор отчета и периода */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            className="bg-[#1f1f22] text-white px-3 py-1 rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option>Общий отчет</option>
          </select>
          <button
            onClick={() => setPeriodType("week")}
            className={`px-3 py-1 rounded ${
              periodType === "week" ? "bg-blue-600" : "bg-[#1f1f22]"
            } text-gray-200 hover:bg-[#2a2a2d]`}
          >
            Неделя
          </button>
          <button
            onClick={() => setPeriodType("month")}
            className={`px-3 py-1 rounded ${
              periodType === "month" ? "bg-blue-600" : "bg-[#1f1f22]"
            } text-gray-200 hover:bg-[#2a2a2d]`}
          >
            Месяц
          </button>
          <button
            onClick={() => setPeriodType("year")}
            className={`px-3 py-1 rounded ${
              periodType === "year" ? "bg-blue-600" : "bg-[#1f1f22]"
            } text-gray-200 hover:bg-[#2a2a2d]`}
          >
            Год
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDateRangePicker((prev) => !prev)}
              className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center"
            >
              <Calendar className="w-4 h-4 mr-1" /> Произвольный период{" "}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  onChange={(item) =>
                    setDateRange({
                      startDate: item.selection.startDate,
                      endDate: item.selection.endDate,
                    })
                  }
                  showSelectionPreview
                  moveRangeOnFirstSelection={false}
                  months={1}
                  ranges={[
                    {
                      startDate: dateRange.startDate,
                      endDate: dateRange.endDate,
                      key: "selection",
                    },
                  ]}
                  direction="horizontal"
                  rangeColors={["#3b82f6"]}
                  className="text-white"
                  locale={ru}
                  weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={applyDateRange}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Применить
                  </button>
                </div>
              </div>
            )}
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

        {/* График зон интенсивности */}
        <IntensityChart periodType={periodType} dateRange={dateRange} />

        {/* Таблицы выносливости и активности */}
        <EnduranceAndActivityTables periodType={periodType} dateRange={dateRange} />
      </div>
    </div>
  );
}
