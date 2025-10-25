import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LogOut, Plus } from "lucide-react";

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval] = useState("Месяц");
  const [mode, setMode] = useState("Время");

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн",
    "Июл","Авг","Сен","Окт","Ноя","Дек"
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

  const handleLogout = () => {
    alert("Выход из аккаунта (позже подключим API)");
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Блок профиля */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Максим</h1>
              <p className="text-sm text-gray-400">Октябрь 2025</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">График зон интенсивности</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <XAxis dataKey="month" stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="I1" stackId="a" fill="#3b82f6" />
              <Bar dataKey="I2" stackId="a" fill="#10b981" />
              <Bar dataKey="I3" stackId="a" fill="#facc15" />
              <Bar dataKey="I4" stackId="a" fill="#f97316" />
              <Bar dataKey="I5" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица выносливости */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Выносливость</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800 rounded-xl overflow-hidden">
              <thead className="text-gray-400 bg-gradient-to-b from-[#18191c] to-[#131416]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">
                    Зоны интенсивности
                  </th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-700/70">
                      {m}
                    </th>
                  ))}
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
                  </tr>
                ))}
                <tr className="border-t border-gray-700 bg-[#151518] font-semibold text-blue-400">
                  <td className="py-2 px-3 border-r border-gray-800">Общее время</td>
                  {months.map((m, i) => (
                    <td key={i} className="text-center">
                      {Math.floor(Math.random() * 250)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
