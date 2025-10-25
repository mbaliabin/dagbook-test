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
  const [name, setName] = useState("Максим");
  const [reportType, setReportType] = useState("Общее расстояние");
  const [interval, setInterval] = useState("Год");

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

  // Данные для графика (только виды спорта с расстоянием)
  const distanceData = months.map((m) => ({
    month: m,
    run: Math.floor(Math.random() * 100),
    ski: Math.floor(Math.random() * 120),
    bike: Math.floor(Math.random() * 150),
    swim: Math.floor(Math.random() * 30)
  }));

  // Таблица "Тип тренировки" без силовой тренировки
  const trainingTypes = ["Бег", "Велосипед", "Плавание", "Лыжи", "Другое"];
  const trainingData = trainingTypes.map((type) => ({
    type,
    ...months.reduce((acc, month) => {
      acc[month] = Math.floor(Math.random() * 100);
      return acc;
    }, {} as Record<string, number>),
    total: Math.floor(Math.random() * 500)
  }));

  const intervals = ["7 дней", "4 недели", "6 месяцев", "Год"];

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

        {/* Плашка выбора отчета и периода */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Тип отчёта</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-[#1a1a1d] border border-gray-700 rounded-lg p-2 text-sm"
            >
              <option>Общее расстояние</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            {intervals.map((intv) => (
              <button
                key={intv}
                onClick={() => setInterval(intv)}
                className={`px-3 py-2 rounded-lg text-sm border ${interval === intv ? "bg-blue-600 border-blue-600" : "border-gray-700 hover:bg-gray-800"}`}
              >
                {intv}
              </button>
            ))}
          </div>
        </div>

        {/* График "Общее расстояние" */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mt-4">
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

        {/* Таблица "Тип тренировки" */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">Тип тренировки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Тип тренировки</th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.map((item) => (
                  <tr key={item.type} className="border-b border-gray-800 hover:bg-[#1d1e22]/80 transition-colors duration-150">
                    <td className="py-2 px-3 border-r border-gray-800">{item.type}</td>
                    {months.map((m) => (
                      <td key={m} className="text-center">{item[m]}</td>
                    ))}
                    <td className="text-center text-blue-400">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
