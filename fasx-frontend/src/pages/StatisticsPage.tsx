import React, { useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Home, BarChart3, ClipboardList, CalendarDays, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState<"Общее расстояние" | "Длительность" | "Выносливость">("Общее расстояние");
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

  // Генерация данных
  const generateData = () => {
    const today = dayjs();
    let data: any[] = [];
    let count = 12;

    if (interval === "7 дней") count = 7;
    else if (interval === "4 недели") count = 4;
    else if (interval === "6 месяцев") count = 6;

    for (let i = count - 1; i >= 0; i--) {
      const label =
        interval === "7 дней"
          ? today.subtract(i, "day").format("DD MMM")
          : interval === "4 недели"
          ? `Нед ${today.subtract(i, "week").startOf("week").format("DD/MM")}`
          : today.subtract(i, "month").format("MMM");

      if (reportType === "Выносливость") {
        data.push({
          label,
          I1: Math.floor(Math.random() * 30 + 10),
          I2: Math.floor(Math.random() * 30 + 10),
          I3: Math.floor(Math.random() * 30 + 10),
          I4: Math.floor(Math.random() * 30 + 10),
          I5: Math.floor(Math.random() * 30 + 10),
        });
      } else {
        data.push({
          label,
          run: Math.floor(Math.random() * 15),
          ski: Math.floor(Math.random() * 20),
          bike: Math.floor(Math.random() * 25),
          swim: Math.floor(Math.random() * 10),
        });
      }
    }

    return data;
  };

  const chartData = generateData();
  const months = chartData.map(d => d.label);

  const types = reportType === "Выносливость" ? ["I1", "I2", "I3", "I4", "I5"] : ["Бег", "Велосипед", "Плавание", "Лыжи"];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Верхняя плашка */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img src="/profile-avatar.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </button>
        </div>

        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Выбор отчёта и интервала */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md flex items-center gap-4">
            <span className="font-semibold">Тип отчёта:</span>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} className="bg-[#0e0e10] border border-gray-700 rounded-lg p-1 text-white">
              <option>Общее расстояние</option>
              <option>Длительность</option>
              <option>Выносливость</option>
            </select>
          </div>

          <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md flex items-center gap-2">
            {intervals.map((intv) => (
              <button key={intv} onClick={() => setInterval(intv)} className={`px-3 py-1 rounded ${interval === intv ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}>
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
              {reportType === "Выносливость" ? (
                <>
                  <Bar dataKey="I1" stackId="a" fill="#ef4444" name="I1" />
                  <Bar dataKey="I2" stackId="a" fill="#f97316" name="I2" />
                  <Bar dataKey="I3" stackId="a" fill="#facc15" name="I3" />
                  <Bar dataKey="I4" stackId="a" fill="#3b82f6" name="I4" />
                  <Bar dataKey="I5" stackId="a" fill="#10b981" name="I5" />
                </>
              ) : (
                <>
                  <Bar dataKey="run" stackId="a" fill="#ef4444" name="Бег" />
                  <Bar dataKey="ski" stackId="a" fill="#3b82f6" name="Лыжи" />
                  <Bar dataKey="bike" stackId="a" fill="#10b981" name="Велосипед" />
                  <Bar dataKey="swim" stackId="a" fill="#f97316" name="Плавание" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">{reportType === "Выносливость" ? "Зоны интенсивности (мин)" : `Тип тренировки (${reportType === "Общее расстояние" ? "км" : "мин"})`}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">{reportType === "Выносливость" ? "Зона" : "Тип тренировки"}</th>
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
                    {months.map((_, i) => {
                      const value = reportType === "Выносливость" ? chartData[i][type] : chartData[i][type.toLowerCase()];
                      return <td key={i} className="text-center">{value}</td>;
                    })}
                    <td className="text-center text-blue-400">{months.reduce((sum, _, i) => sum + (reportType === "Выносливость" ? chartData[i][type] : chartData[i][type.toLowerCase()]), 0)}</td>
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
