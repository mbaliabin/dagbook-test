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

  // Генерация данных для диаграммы и основной таблицы
  const generateData = () => {
    const today = dayjs();
    let labels: string[] = [];

    if (interval === "7 дней") {
      for (let i = 6; i >= 0; i--) labels.push(today.subtract(i, "day").format("DD MMM"));
    } else if (interval === "4 недели") {
      for (let i = 3; i >= 0; i--) labels.push(`Нед ${today.subtract(i, "week").startOf("week").format("DD/MM")}`);
    } else if (interval === "6 месяцев") {
      for (let i = 5; i >= 0; i--) labels.push(today.subtract(i, "month").format("MMM"));
    } else if (interval === "Год") {
      for (let i = 11; i >= 0; i--) labels.push(today.subtract(i, "month").format("MMM"));
    }

    // Для каждого отчёта задаём свои максимальные значения
    let maxValues: Record<string, number> = {};
    if (reportType === "Общее расстояние") {
      maxValues = { run: 10, ski: 15, bike: 20, swim: 5 };
    } else if (reportType === "Длительность") {
      maxValues = { run: 60, ski: 90, bike: 120, swim: 30 };
    } else if (reportType === "Выносливость") {
      maxValues = { I1: 20, I2: 25, I3: 30, I4: 35, I5: 40 };
    }

    // Формируем данные для диаграммы
    let chartData: any[] = [];
    if (reportType === "Выносливость") {
      chartData = labels.map((label) => ({
        label,
        I1: Math.floor(Math.random() * maxValues.I1),
        I2: Math.floor(Math.random() * maxValues.I2),
        I3: Math.floor(Math.random() * maxValues.I3),
        I4: Math.floor(Math.random() * maxValues.I4),
        I5: Math.floor(Math.random() * maxValues.I5),
      }));
    } else {
      chartData = labels.map((label) => ({
        label,
        run: Math.floor(Math.random() * maxValues.run),
        ski: Math.floor(Math.random() * maxValues.ski),
        bike: Math.floor(Math.random() * maxValues.bike),
        swim: Math.floor(Math.random() * maxValues.swim),
      }));
    }

    // Данные для основной таблицы
    let tableData: any[] = [];
    if (reportType === "Выносливость") {
      tableData = ["I1", "I2", "I3", "I4", "I5"].map((type) => ({
        type,
        values: labels.map(() => Math.floor(Math.random() * 40)),
        total: Math.floor(Math.random() * 150),
      }));
    } else {
      tableData = ["Бег", "Велосипед", "Плавание", "Лыжи", "Другое"].map((type) => ({
        type,
        values: labels.map(() => Math.floor(Math.random() * (reportType === "Общее расстояние" ? 10 : 60))),
        total: Math.floor(Math.random() * (reportType === "Общее расстояние" ? 300 : 900)),
      }));
    }

    return { labels, chartData, tableData };
  };

  const { labels, chartData, tableData } = generateData();

  // Генерация данных для "Параметры дня"
  const generateDayParams = () => {
    const params = ["Болезнь", "Травма", "Соревнования", "Высота", "В поездке", "Выходной"];
    return params.map((p) => ({
      row: p,
      values: labels.map(() => (Math.random() > 0.7 ? "✓" : "—")),
    }));
  };
  const dayParams = generateDayParams();

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
                  <Bar dataKey="I2" stackId="a" fill="#3b82f6" name="I2" />
                  <Bar dataKey="I3" stackId="a" fill="#10b981" name="I3" />
                  <Bar dataKey="I4" stackId="a" fill="#f97316" name="I4" />
                  <Bar dataKey="I5" stackId="a" fill="#8b5cf6" name="I5" />
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

        {/* Таблица тренировок */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {reportType === "Выносливость" ? "Зоны интенсивности (мин)" : `Тип тренировки (${reportType === "Общее расстояние" ? "км" : "мин"})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">{reportType === "Выносливость" ? "Зона" : "Тип тренировки"}</th>
                  {labels.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr key={row.type} className="border-b border-gray-800">
                    <td className="py-2 px-3 border-r border-gray-800">{row.type}</td>
                    {row.values.map((v,i) => <td key={i} className="text-center">{v}</td>)}
                    <td className="text-center text-blue-400">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-3">Параметры дня</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 border-b border-gray-700 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2"></th>
                  {labels.map((m,i) => <th key={i}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {dayParams.map((item) => (
                  <tr key={item.row} className="border-b border-gray-800 hover:bg-[#1d1e22]/80 transition-colors duration-150">
                    <td className="py-2">{item.row}</td>
                    {item.values.map((v,i)=><td key={i} className="text-center text-gray-400">{v}</td>)}
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
