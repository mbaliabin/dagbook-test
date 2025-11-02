import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
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

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = useState("Пользователь");
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("isoWeek").toDate(),
    endDate: dayjs().endOf("isoWeek").toDate(),
  });

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Профиль */}
        <div className="flex items-center space-x-4">
          <img
            src="/profile.jpg"
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm">
              {dayjs(dateRange.startDate).format("DD MMM YYYY")} —{" "}
              {dayjs(dateRange.endDate).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
          </button>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDateRangePicker((prev) => !prev)}
              className="ml-2 flex items-center gap-1 bg-[#1f1f22] px-3 py-1 rounded text-sm text-gray-300 hover:bg-[#2a2a2d]"
            >
              <Calendar className="w-4 h-4" />
              Произвольный период
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  ranges={[
                    {
                      startDate: dateRange.startDate,
                      endDate: dateRange.endDate,
                      key: "selection",
                    },
                  ]}
                  onChange={(item) =>
                    setDateRange({
                      startDate: item.selection.startDate,
                      endDate: item.selection.endDate,
                    })
                  }
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="horizontal"
                  rangeColors={["#3b82f6"]}
                  locale={ru}
                  weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => setShowDateRangePicker(false)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Применить
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Дальше идут таблицы и графики, как в StatsPage */}
    </div>
  );
}
