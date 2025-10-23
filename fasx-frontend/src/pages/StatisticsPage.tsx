import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { month: "Май 2025", зона1: 30, зона2: 5, зона3: 2 },
  { month: "Июль 2025", зона1: 28, зона2: 6, зона3: 3 },
  { month: "Авг 2025", зона1: 25, зона2: 8, зона3: 4 },
  { month: "Сен 2025", зона1: 22, зона2: 6, зона3: 5 },
];

export default function StatisticsPage() {
  const [reportType, setReportType] = useState("Общий отчёт");
  const [interval, setInterval] = useState("Месяц");
  const [mode, setMode] = useState("Время");

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ФИЛЬТРЫ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111214] p-4 rounded-2xl border border-gray-800">
            <label className="block text-sm font-semibold mb-2">
              Тип отчёта
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0B0B0D] border border-gray-700 rounded-lg p-2 text-sm"
            >
              <option>Общий отчёт</option>
              <option>Выносливость</option>
              <option>Силовые</option>
            </select>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "Время"}
                  onChange={() => setMode("Время")}
                  className="accent-blue-500"
                />
                Время
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "Процент"}
                  onChange={() => setMode("Процент")}
                  className="accent-blue-500"
                />
                Процент
              </label>
              <span className="text-gray-500">Экспортировать статистику</span>
            </div>
          </div>

          <div className="bg-[#111214] p-4 rounded-2xl border border-gray-800">
            <label className="block text-sm font-semibold mb-2">
              Интервал времени
            </label>
            <div className="flex items-center gap-3">
              <button className="bg-[#0B0B0D] border border-gray-700 rounded-lg px-3 py-2 text-sm">
                {interval}
              </button>
              <span className="text-gray-400">— 03.09.2025</span>
            </div>
          </div>
        </div>

        {/* ДИАГРАММА */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                }}
              />
              <Legend />
              <Bar dataKey="зона1" stackId="a" fill="#1E90FF" />
              <Bar dataKey="зона2" stackId="a" fill="#4682B4" />
              <Bar dataKey="зона3" stackId="a" fill="#FFA500" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">
            Штрихованные области показывают общую тренировку
          </p>
        </div>

        {/* TOTALSUM */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">ИТОГО</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="text-left py-2"></th>
                  <th>Май 2025</th>
                  <th>Июль 2025</th>
                  <th>Авг 2025</th>
                  <th>Сен 2025</th>
                  <th>Среднее/мес</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Болезнь",
                  "Травма",
                  "Соревнования",
                  "Высота",
                  "В поездке",
                  "Выходной",
                ].map((row) => (
                  <tr key={row} className="border-b border-gray-800">
                    <td className="py-2">{row}</td>
                    <td colSpan={5} className="text-center text-gray-600">
                      —
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ВЫНОСЛИВОСТЬ */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">ВЫНОСЛИВОСТЬ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="text-left py-2">Зоны интенсивности</th>
                  <th className="text-right py-2">Месяц</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { zone: "I1", time: "03:20:00", color: "#3b82f6" },
                  { zone: "I2", time: "02:15:00", color: "#10b981" },
                  { zone: "I3", time: "01:40:00", color: "#facc15" },
                  { zone: "I4", time: "00:45:00", color: "#f97316" },
                  { zone: "I5", time: "00:20:00", color: "#ef4444" },
                ].map(({ zone, time, color }) => (
                  <tr
                    key={zone}
                    className="border-b border-gray-800 hover:bg-[#1b1c1f] transition"
                  >
                    <td className="py-3 flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="font-medium text-gray-300">{zone}</span>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-100">
                      {time}
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
