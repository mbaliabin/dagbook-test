import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Home, BarChart3, ClipboardList, CalendarDays, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

type ReportType = "Общее расстояние" | "Длительность" | "Выносливость";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState<ReportType>("Общее расстояние");
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
  const trainingTypes = ["Бег", "Велосипед", "Плавание", "Лыжи", "Другое"];
  const enduranceZones = ["I1", "I2", "I3", "I4", "I5"];

  const generateData = () => {
    const today = dayjs();
    let data: any[] = [];
    let types = reportType === "Выносливость" ? enduranceZones : trainingTypes;
    const maxValues: any = {
      "Общее расстояние": { Бег: 10, Лыжи: 15, Велосипед: 20, Плавание: 5, Другое: 8 },
      "Длительность": { Бег: 60, Лыжи: 90, Велосипед: 120, Плавание: 30, Другое: 45 },
      "Выносливость": { I1: 60, I2: 50, I3: 40, I4: 30, I5: 20 }
    };

    let points = interval === "7 дней" ? 7 : interval === "4 недели" ? 4 : interval === "6 месяцев" ? 6 : 12;

    for (let i = points - 1; i >= 0; i--) {
      let label = "";
      if (interval === "7 дней") label = today.subtract(i, "day").format("DD MMM");
      else if (interval === "4 недели") label = `Нед ${today.subtract(i, "week").startOf("week").format("DD/MM")}`;
      else label = today.subtract(i, "month").format("MMM");

      let item: any = { label };
      types.forEach((t) => {
        item[t] = Math.floor(Math.random() * maxValues[reportType][t]);
      });
      data.push(item);
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
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="bg-[#0e0e10] border border-gray-700 rounded-lg p-1 text-white"
            >
              <option>Общее расстояние</option>
              <option>Длительность</option>
              <option>Выносливость</option>
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

        {/* Диаграмма с осями */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              {(reportType === "Выносливость" ? enduranceZones : trainingTypes).map((t, idx) => {
                const colors = ["#ef4444","#3b82f6","#10b981","#f97316","#a855f7"];
                return <Bar key={t} dataKey={t} stackId="a" fill={colors[idx % colors.length]} name={t} />;
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {reportType === "Выносливость" ? "Зоны выносливости (мин)" : `Тип тренировки (${reportType === "Общее расстояние" ? "км" : "мин"})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-3 px-3 border-r border-gray-800">
                    {reportType === "Выносливость" ? "Зона" : "Тип тренировки"}
                  </th>
                  {months.map((m) => (
                    <th key={m} className="py-3 px-2 text-center border-r border-gray-700/70">{m}</th>
                  ))}
                  <th className="py-3 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                </tr>
              </thead>
              <tbody>
                {(reportType === "Выносливость" ? enduranceZones : trainingTypes).map((type) => (
                  <tr key={type} className="border-b border-gray-800">
                    <td className="py-3 px-3 border-r border-gray-800">{type}</td>
                    {chartData.map((d, i) => (
                      <td key={i} className="text-center">{d[type]}</td>
                    ))}
                    <td className="text-center text-blue-400">
                      {chartData.reduce((sum, d) => sum + d[type], 0)}
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
