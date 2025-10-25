import React, { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  LogOut
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общее расстояние");
  const [name, setName] = useState("Максим");

  const navigate = useNavigate();
  const location = useLocation();

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

  const months = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
  ];

  // Пример данных для отчета "Общее расстояние"
  const distanceData = months.map((m) => ({
    month: m,
    run: Math.floor(Math.random() * 100),      // бег
    ski: Math.floor(Math.random() * 120),      // лыжи
    bike: Math.floor(Math.random() * 150),     // велосипед
    swim: Math.floor(Math.random() * 30)       // плавание
  }));

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Верхняя плашка — аватар, имя, кнопки */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile-avatar.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-700"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              <p className="text-sm text-gray-400">{dayjs().format('MMMM YYYY')}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </button>
        </div>

        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Отчет "Общее расстояние" */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Общее расстояние</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distanceData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="month" stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="ski" stackId="a" fill="#3b82f6" barSize={32} />
              <Bar dataKey="run" stackId="a" fill="#ef4444" barSize={32} />
              <Bar dataKey="bike" stackId="a" fill="#10b981" barSize={32} />
              <Bar dataKey="swim" stackId="a" fill="#f97316" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
