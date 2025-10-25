import React, { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общее расстояние");
  const [interval, setInterval] = useState("Год");
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

  const intervals = ["7 дней", "4 недели", "6 месяцев", "Год"];

  const generateDistanceData = () => {
    const today = dayjs();
    let data: { label: string; run: number; ski: number; bike: number; swim: number }[] = [];

    if (interval === "7 дней") {
      for (let i = 6; i >= 0; i--) {
        const day = today.subtract(i, "day");
        data.push({
          label: day.format("DD MMM"),
          run: Math.floor(Math.random() * 10),
          ski: Math.floor(Math.random() * 15),
          bike: Math.floor(Math.random() * 20),
          swim: Math.floor(Math.random() * 5)
        });
      }
    } else if (interval === "4 недели") {
      for (let i = 3; i >= 0; i--) {
        const weekStart = today.subtract(i, "week").startOf("week");
        data.push({
          label: `Нед ${weekStart.format("DD/MM")}`,
          run: Math.floor(Math.random() * 50),
          ski: Math.floor(Math.random() * 60),
          bike: Math.floor(Math.random() * 80),
          swim: Math.floor(Math.random() * 15)
        });
      }
    } else if (interval === "6 месяцев") {
      for (let i = 5; i >= 0; i--) {
        const month = today.subtract(i, "month");
        data.push({
          label: month.format("MMM"),
          run: Math.floor(Math.random() * 200),
          ski: Math.floor(Math.random() * 250),
          bike: Math.floor(Math.random() * 300),
          swim: Math.floor(Math.random() * 50)
        });
      }
    } else if (interval === "Год") {
      for (let i = 11; i >= 0; i--) {
        const month = today.subtract(i, "month");
        data.push({
          label: month.format("MMM"),
          run: Math.floor(Math.random() * 200),
          ski: Math.floor(Math.random() * 250),
          bike: Math.floor(Math.random() * 300),
          swim: Math.floor(Math.random() * 50)
        });
      }
    }

    return data;
  };

  const distanceData = generateDistanceData();

  const months = distanceData.map(d => d.label);

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Верхняя плашка — аватар, имя и кнопка Выйти */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile-avatar.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-700"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
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

        {/* Плашка выбора отчёта и интервала */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md flex items-center gap-4">
            <span className="font-semibold">Тип отчёта:</span>
            <span>{reportType}</span>
          </div>

          <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md flex items-center gap-2">
            {intervals.map((intv) => (
              <button
                key={intv}
                onClick={() => setInterval(intv)}
                className={`px-3 py-1 rounded ${interval === intv ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                {intv}
              </button>
            ))}
          </div>
        </div>

        {/* Диаграмма общего расстояния */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distanceData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="run" stackId="a" fill="#ef4444" barSize={32} name="Бег" />
              <Bar dataKey="ski" stackId="a" fill="#3b82f6" barSize={32} name="Лыжи" />
              <Bar dataKey="bike" stackId="a" fill="#10b981" barSize={32} name="Велосипед" />
              <Bar dataKey="swim" stackId="a" fill="#f97316" barSize={32} name="Плавание" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица типа тренировки */}
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
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее расстояние</th>
                </tr>
              </thead>
              <tbody>
                {["Бег", "Велосипед", "Плавание", "Лыжи", "Другое"].map((type) => (
                  <tr key={type} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{type}</td>
                    {months.map((m, i) => (
                      <td key={i} className="text-center">{Math.floor(Math.random() * 60)}</td>
                    ))}
                    <td className="text-center text-blue-400">{Math.floor(Math.random() * 300)}</td>
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
