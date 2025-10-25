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
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval, setInterval] = useState("Месяц");
  const [mode, setMode] = useState<"Время" | "Километры">("Время");
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
    "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"
  ];

  // Генерация mock-данных
  const generateData = () => months.map(m => ({
    month: m,
    I1: Math.floor(Math.random() * 30),
    I2: Math.floor(Math.random() * 20),
    I3: Math.floor(Math.random() * 15),
    I4: Math.floor(Math.random() * 10),
    I5: Math.floor(Math.random() * 5),
    "Бег": Math.floor(Math.random() * 60),
    "Велосипед": Math.floor(Math.random() * 120),
    "Силовая тренировка": 0,
    "Плавание": Math.floor(Math.random() * 10),
    "Другое": Math.floor(Math.random() * 20),
  }));

  const mockData = generateData();

  // Данные для графика
  const chartData = mode === "Время"
    ? mockData
    : mockData.map(m => ({
        month: m.month,
        Бег: m.Бег,
        Велосипед: m.Велосипед,
        Плавание: m.Плавание,
      }));

  const barKeys = mode === "Время" ? ["I1","I2","I3","I4","I5"] : ["Бег","Велосипед","Плавание"];
  const barColors = mode === "Время"
    ? ["#3b82f6","#10b981","#facc15","#f97316","#ef4444"]
    : ["#3b82f6","#10b981","#facc15"];

  // Данные для таблиц
  const enduranceZones = ["I1","I2","I3","I4","I5"];
  const types = ["Бег","Велосипед","Силовая тренировка","Плавание","Другое"];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Верхняя плашка */}
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

        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
            <label className="block text-sm font-semibold mb-2">Тип отчёта</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0e0e10] border border-gray-700 rounded-lg p-2 text-sm"
            >
              <option>Общий отчёт</option>
              <option>Выносливость</option>
              <option>Силовые</option>
            </select>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode === "Время"} onChange={() => setMode("Время")} className="accent-blue-500" />
                Время
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={mode === "Километры"} onChange={() => setMode("Километры")} className="accent-blue-500" />
                Километры
              </label>
            </div>
          </div>

          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
            <label className="block text-sm font-semibold mb-2">Интервал времени</label>
            <div className="flex items-center gap-3">
              <button className="bg-[#0e0e10] border border-gray-700 rounded-lg px-3 py-2 text-sm">
                {interval}
              </button>
              <span className="text-gray-400">— 03.09.2025</span>
            </div>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              {barKeys.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="a" fill={barColors[i]} barSize={32} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица: Выносливость */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Выносливость {mode === "Километры" && "(км)"}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Зоны</th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                </tr>
              </thead>
              <tbody>
                {enduranceZones.map((zone) => (
                  <tr key={zone} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{zone}</td>
                    {months.map((m, i) => (
                      <td key={i} className="text-center">
                        {mode === "Время" ? Math.floor(Math.random() * 60) : mockData[i][zone]}
                      </td>
                    ))}
                    <td className="text-center text-blue-400">
                      {mode === "Время"
                        ? Math.floor(Math.random() * 300)
                        : months.reduce((sum, _, i) => sum + mockData[i][zone], 0)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Таблица: Тип тренировки */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">Тип тренировки {mode === "Километры" && "(км)"}</h2>
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
                {types.map((type) => (
                  <tr key={type} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{type}</td>
                    {months.map((m, i) => (
                      <td key={i} className="text-center">
                        {mode === "Время" ? Math.floor(Math.random() * 60) : mockData[i][type]}
                      </td>
                    ))}
                    <td className="text-center text-blue-400">
                      {mode === "Время"
                        ? Math.floor(Math.random() * 300)
                        : months.reduce((sum, _, i) => sum + mockData[i][type], 0)
                      }
                    </td>
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
