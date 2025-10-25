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

  const typesDistance = ["run", "ski", "bike", "swim"];
  const typesDuration = ["run", "ski", "bike", "swim", "strength"];
  const enduranceZones = ["I1", "I2", "I3", "I4", "I5"];

  // Генерация динамических данных
  const generateChartData = () => {
    const today = dayjs();
    let data: any[] = [];
    let count = 0;
    if (interval === "7 дней") count = 7;
    else if (interval === "4 недели") count = 4;
    else if (interval === "6 месяцев") count = 6;
    else if (interval === "Год") count = 12;

    for (let i = count - 1; i >= 0; i--) {
      let label = "";
      if (interval === "7 дней") label = today.subtract(i, "day").format("DD MMM");
      else if (interval === "4 недели") label = `Нед ${today.subtract(i, "week").startOf("week").format("DD/MM")}`;
      else label = today.subtract(i, "month").format("MMM");

      const randomValue = (max: number) => Math.floor(Math.random() * max);

      if (reportType === "Общее расстояние") {
        data.push({
          label,
          run: randomValue(100),
          ski: randomValue(120),
          bike: randomValue(200),
          swim: randomValue(50),
        });
      } else if (reportType === "Длительность") {
        data.push({
          label,
          run: randomValue(300),
          ski: randomValue(400),
          bike: randomValue(500),
          swim: randomValue(100),
          strength: randomValue(150),
        });
      } else if (reportType === "Выносливость") {
        enduranceZones.forEach((zone) => {
          if (!data.find((d) => d.zone === zone)) data.push({ zone });
          data.find((d) => d.zone === zone)[label] = randomValue(60);
        });
      }
    }

    // Для таблицы добавляем total
    if (reportType === "Выносливость") {
      data.forEach((row) => {
        row.total = Object.keys(row)
          .filter((k) => k !== "zone")
          .reduce((sum, k) => sum + row[k], 0);
      });
    }

    return data;
  };

  const chartData = generateChartData();
  const months = chartData.map((d: any) => d.label);

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

        {/* Выбор отчёта и интервала */}
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
        {reportType !== "Выносливость" && (
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1d", border: "1px solid #333", color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#fff" }} />
                {reportType === "Общее расстояние" && (
                  <>
                    <Bar dataKey="run" stackId="a" fill="#ef4444" name="Бег" />
                    <Bar dataKey="ski" stackId="a" fill="#3b82f6" name="Лыжи" />
                    <Bar dataKey="bike" stackId="a" fill="#10b981" name="Велосипед" />
                    <Bar dataKey="swim" stackId="a" fill="#f97316" name="Плавание" />
                  </>
                )}
                {reportType === "Длительность" && (
                  <>
                    <Bar dataKey="run" stackId="a" fill="#ef4444" name="Бег" />
                    <Bar dataKey="ski" stackId="a" fill="#3b82f6" name="Лыжи" />
                    <Bar dataKey="bike" stackId="a" fill="#10b981" name="Велосипед" />
                    <Bar dataKey="swim" stackId="a" fill="#f97316" name="Плавание" />
                    <Bar dataKey="strength" stackId="a" fill="#a855f7" name="Силовая" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Таблицы */}
        {reportType === "Выносливость" ? (
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-3">Выносливость (мин)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
                <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                  <tr>
                    <th className="text-left py-2 px-3 border-r border-gray-800">Зона</th>
                    {months.map((m) => (
                      <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">{m}</th>
                    ))}
                    <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((zone) => (
                    <tr key={zone.zone} className="border-b border-gray-800">
                      <td className="py-2 px-3 border-r border-gray-800">{zone.zone}</td>
                      {months.map((m) => (
                        <td key={m} className="text-center">{zone[m]}</td>
                      ))}
                      <td className="text-center text-blue-400">{zone.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md mb-10">
            <h2 className="text-lg font-semibold mb-3">
              Тип тренировки ({reportType === "Общее расстояние" ? "км" : "мин"})
            </h2>
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
                  {(reportType === "Общее расстояние" ? typesDistance : typesDuration).map((type) => (
                    <tr key={type} className="border-b border-gray-800">
                      <td className="py-2 px-3 border-r border-gray-800">
                        {type === "run" ? "Бег" : type === "ski" ? "Лыжи" : type === "bike" ? "Велосипед" : type === "swim" ? "Плавание" : "Силовая"}
                      </td>
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
        )}
      </div>
    </div>
  );
}
