import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval, setInterval] = useState("Месяц");
  const [mode, setMode] = useState("Время");

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
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];

  const mockData = [
    { month: "Янв", I1: 30, I2: 15, I3: 10, I4: 5, I5: 2 },
    { month: "Фев", I1: 25, I2: 10, I3: 12, I4: 6, I5: 3 },
    { month: "Мар", I1: 28, I2: 12, I3: 14, I4: 7, I5: 4 },
    { month: "Апр", I1: 22, I2: 15, I3: 11, I4: 8, I5: 5 },
    { month: "Май", I1: 30, I2: 18, I3: 12, I4: 6, I5: 4 },
    { month: "Июн", I1: 27, I2: 16, I3: 13, I4: 7, I5: 3 },
    { month: "Июл", I1: 32, I2: 20, I3: 15, I4: 8, I5: 5 },
    { month: "Авг", I1: 28, I2: 18, I3: 14, I4: 6, I5: 4 },
    { month: "Сен", I1: 26, I2: 15, I3: 12, I4: 7, I5: 3 },
    { month: "Окт", I1: 30, I2: 17, I3: 13, I4: 8, I5: 4 },
    { month: "Ноя", I1: 29, I2: 16, I3: 14, I4: 6, I5: 3 },
    { month: "Дек", I1: 31, I2: 18, I3: 15, I4: 7, I5: 4 },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 🧍 Блок профиля */}
        <div className="flex items-center justify-between bg-[#1a1a1d] p-4 rounded-2xl shadow-md border border-gray-800">
          <div className="flex items-center gap-4">
            <img
              src="/profile-avatar.jpg"
              alt="Профиль"
              className="w-16 h-16 rounded-full border border-gray-700 object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">Максим </h2>
              <p className="text-gray-400 text-sm">Premium plus</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#0e0e10] border border-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-[#1f1f22] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Выйти
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
                <input type="radio" checked={mode === "Процент"} onChange={() => setMode("Процент")} className="accent-blue-500" />
                Процент
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
            <BarChart data={mockData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="I1" stackId="a" fill="#3b82f6" barSize={32} />
              <Bar dataKey="I2" stackId="a" fill="#10b981" barSize={32} />
              <Bar dataKey="I3" stackId="a" fill="#facc15" barSize={32} />
              <Bar dataKey="I4" stackId="a" fill="#f97316" barSize={32} />
              <Bar dataKey="I5" stackId="a" fill="#ef4444" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Параметры дня</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 border-b border-gray-700 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2"></th>
                  {["Май 2025", "Июль 2025", "Авг 2025", "Сен 2025", "Среднее/мес"].map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { row: "Болезнь", values: ["—", "—", "—", "—", "—"] },
                  { row: "Травма", values: ["—", "—", "—", "—", "—"] },
                  { row: "Соревнования", values: ["✓", "—", "✓", "—", "—"] },
                  { row: "Высота", values: ["—", "—", "—", "✓", "—"] },
                  { row: "В поездке", values: ["—", "✓", "—", "—", "—"] },
                  { row: "Выходной", values: ["—", "—", "✓", "—", "✓"] },
                ].map((item) => (
                  <tr key={item.row} className="border-b border-gray-800 hover:bg-[#1d1e22]/80 transition-colors duration-150">
                    <td className="py-2">{item.row}</td>
                    {item.values.map((v, i) => (
                      <td key={i} className="text-center text-gray-400">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Выносливость */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Выносливость</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Зоны</th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">
                      {m}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">
                    Общее время
                  </th>
                </tr>
              </thead>
              <tbody>
                {["I1", "I2", "I3", "I4", "I5"].map((zone) => (
                  <tr key={zone} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{zone}</td>
                    {months.map((m, i) => (
                      <td key={i} className="text-center">
                        {Math.floor(Math.random() * 60)}
                      </td>
                    ))}
                    <td className="text-center text-blue-400">
                      {Math.floor(Math.random() * 300)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Тип тренировки */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">Тип тренировки</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">
                    Тип тренировки
                  </th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">
                      {m}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">
                    Общее время
                  </th>
                </tr>
              </thead>
              <tbody>
                {["Бег", "Велосипед", "Силовая тренировка", "Плавание", "Другое"].map(
                  (type) => (
                    <tr key={type} className="border-b border-gray-800">
                      <td className="py-2 px-3 border-r border-gray-800">{type}</td>
                      {months.map((m, i) => (
                        <td key={i} className="text-center">
                          {Math.floor(Math.random() * 60)}
                        </td>
                      ))}
                      <td className="text-center text-blue-400">
                        {Math.floor(Math.random() * 300)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
