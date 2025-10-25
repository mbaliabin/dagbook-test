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
  const [reportType, setReportType] = useState<"Общее расстояние" | "Длительность">("Общее расстояние");
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

  // Генерация данных по времени или расстоянию
  const generateData = () => {
    const today = dayjs();
    let data: { label: string; run: number; ski: number; bike: number; swim: number }[] = [];

    const maxValues = reportType === "Общее расстояние"
      ? { run: 10, ski: 15, bike: 20, swim: 5 }   // км
      : { run: 60, ski: 90, bike: 120, swim: 30 }; // мин

    if (interval === "7 дней") {
      for (let i = 6; i >= 0; i--) {
        const day = today.subtract(i, "day");
        data.push({
          label: day.format("DD MMM"),
          run: Math.floor(Math.random() * maxValues.run),
          ski: Math.floor(Math.random() * maxValues.ski),
          bike: Math.floor(Math.random() * maxValues.bike),
          swim: Math.floor(Math.random() * maxValues.swim)
        });
      }
    } else if (interval === "4 недели") {
      for (let i = 3; i >= 0; i--) {
        const weekStart = today.subtract(i, "week").startOf("week");
        data.push({
          label: `Нед ${weekStart.format("DD/MM")}`,
          run: Math.floor(Math.random() * maxValues.run * 5),
          ski: Math.floor(Math.random() * maxValues.ski * 5),
          bike: Math.floor(Math.random() * maxValues.bike * 5),
          swim: Math.floor(Math.random() * maxValues.swim * 5)
        });
      }
    } else if (interval === "6 месяцев") {
      for (let i = 5; i >= 0; i--) {
        const month = today.subtract(i, "month");
        data.push({
          label: month.format("MMM"),
          run: Math.floor(Math.random() * maxValues.run * 20),
          ski: Math.floor(Math.random() * maxValues.ski * 20),
          bike: Math.floor(Math.random() * maxValues.bike * 20),
          swim: Math.floor(Math.random() * maxValues.swim * 20)
        });
      }
    } else if (interval === "Год") {
      for (let i = 11; i >= 0; i--) {
        const month = today.subtract(i, "month");
        data.push({
          label: month.format("MMM"),
          run: Math.floor(Math.random() * maxValues.run * 20),
          ski: Math.floor(Math.random() * maxValues.ski * 20),
          bike: Math.floor(Math.random() * maxValues.bike * 20),
          swim: Math.floor(Math.random() * maxValues.swim * 20)
        });
      }
    }

    return data;
  };

  const chartData = generateData();
  const months = chartData.map(d => d.label);

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
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="bg-[#0e0e10] border border-gray-700 rounded-lg p-1 text-white"
            >
              <option>Общее расстояние</option>
              <option>Длительность</option>
            </select>
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

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="run" stackId="a" fill="#ef4444" name="Бег" />
              <Bar dataKey="ski" stackId="a" fill="#3b82f6" name="Лыжи" />
              <Bar dataKey="bike" stackId="a" fill="#10b981" name="Велосипед" />
              <Bar dataKey="swim" stackId="a" fill="#f97316" name="Плавание" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">Тип тренировки ({reportType === "Общее расстояние" ? "км" : "мин"})</h2>
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
