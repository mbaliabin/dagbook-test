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

type IntervalType = "7 дней" | "4 недели" | "6 месяцев" | "Год";
type ReportType = "Общее расстояние" | "Длительность" | "Выносливость";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState<ReportType>("Общее расстояние");
  const [interval, setInterval] = useState<IntervalType>("Год");
  const [name] = useState("Максим");

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const generateChartData = () => {
    const today = dayjs();
    let barsCount = 12;
    if(interval === "7 дней") barsCount = 7;
    else if(interval === "4 недели") barsCount = 4;
    else if(interval === "6 месяцев") barsCount = 6;

    const data: any[] = [];

    for(let i = barsCount - 1; i >= 0; i--) {
      let label = "";
      if(interval === "7 дней") label = today.subtract(i, "day").format("DD MMM");
      else if(interval === "4 недели") label = `Нед ${today.subtract(i, "week").startOf("week").format("DD/MM")}`;
      else if(interval === "6 месяцев" || interval === "Год") label = today.subtract(i, "month").format("MMM");

      if(reportType === "Общее расстояние" || reportType === "Длительность") {
        data.push({
          label,
          Бег: Math.floor(Math.random() * 100),
          Велосипед: Math.floor(Math.random() * 200),
          Плавание: Math.floor(Math.random() * 50),
        });
      } else if(reportType === "Выносливость") {
        data.push({
          label,
          I1: Math.floor(Math.random() * 60),
          I2: Math.floor(Math.random() * 60),
          I3: Math.floor(Math.random() * 60),
          I4: Math.floor(Math.random() * 60),
          I5: Math.floor(Math.random() * 60),
        });
      }
    }
    return data;
  };

  const chartData = generateChartData();
  const barsLabels = chartData.map(d => d.label);

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Верхняя панель */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img src="/profile-avatar.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
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

        {/* Меню */}
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

        {/* Выбор отчета и периода */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md flex items-center gap-3">
            {["Общее расстояние", "Длительность", "Выносливость"].map(rt => (
              <button
                key={rt}
                onClick={() => setReportType(rt as ReportType)}
                className={`px-4 py-2 rounded-xl ${reportType === rt ? "bg-blue-600" : "bg-gray-700"}`}
              >
                {rt}
              </button>
            ))}
          </div>
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md flex items-center gap-2">
            {["7 дней","4 недели","6 месяцев","Год"].map(intv => (
              <button
                key={intv}
                onClick={() => setInterval(intv as IntervalType)}
                className={`px-3 py-1 rounded-lg ${interval === intv ? "bg-blue-600" : "bg-gray-700"}`}
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
              {reportType === "Выносливость" ? (
                <>
                  <Bar dataKey="I1" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="I2" stackId="a" fill="#10b981" />
                  <Bar dataKey="I3" stackId="a" fill="#facc15" />
                  <Bar dataKey="I4" stackId="a" fill="#f97316" />
                  <Bar dataKey="I5" stackId="a" fill="#ef4444" />
                </>
              ) : (
                <>
                  <Bar dataKey="Бег" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Велосипед" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Плавание" stackId="a" fill="#10b981" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица под диаграммой */}
        {reportType === "Выносливость" ? (
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Зоны</th>
                  {barsLabels.map(m => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {["I1","I2","I3","I4","I5"].map(zone => (
                  <tr key={zone} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{zone}</td>
                    {barsLabels.map((_, i) => (
                      <td key={i} className="text-center">{Math.floor(Math.random() * 60)}</td>
                    ))}
                    <td className="text-center text-blue-400">{Math.floor(Math.random() * 300)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-3">Тип тренировки</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
                <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                  <tr>
                    <th className="text-left py-2 px-3 border-r border-gray-800">Тип тренировки</th>
                    {barsLabels.map(m => (
                      <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                    ))}
                    <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                  </tr>
                </thead>
                <tbody>
                  {["Бег","Велосипед","Плавание"].map(type => (
                    <tr key={type} className="border-b border-gray-800">
                      <td className="py-2 px-3 border-r border-gray-800">{type}</td>
                      {barsLabels.map((_, i) => (
                        <td key={i} className="text-center">{Math.floor(Math.random() * 100)}</td>
                      ))}
                      <td className="text-center text-blue-400">{Math.floor(Math.random() * 500)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
