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

  // Таблица выносливости
  const enduranceData = [
    {
      zone: "I1",
      color: "#3b82f6",
      data: ["3:20", "2:50", "4:10", "3:45", "2:30", "4:00", "3:10", "2:55", "3:35", "4:20", "3:00", "3:10"],
    },
    {
      zone: "I2",
      color: "#10b981",
      data: ["2:15", "1:50", "2:00", "1:40", "1:35", "1:50", "2:10", "2:05", "2:20", "2:30", "2:15", "2:00"],
    },
    {
      zone: "I3",
      color: "#facc15",
      data: ["1:40", "1:30", "1:20", "1:25", "1:10", "1:30", "1:45", "1:25", "1:40", "1:50", "1:35", "1:25"],
    },
    {
      zone: "I4",
      color: "#f97316",
      data: ["0:45", "0:50", "0:35", "0:40", "0:30", "0:35", "0:50", "0:45", "0:55", "0:50", "0:40", "0:35"],
    },
    {
      zone: "I5",
      color: "#ef4444",
      data: ["0:20", "0:15", "0:25", "0:20", "0:18", "0:20", "0:22", "0:19", "0:25", "0:30", "0:20", "0:18"],
    },
  ];

  // Таблица типов тренировок
  const trainingTypes = [
    "Бег",
    "Лыжи классическим стилем",
    "Лыжи коньковым стилем",
    "Лыжероллеры классическим стилем",
    "Лыжероллеры коньковым стилем",
    "Силовая тренировка",
    "Велосипед",
    "Другое",
  ];

  const trainingTypeData = trainingTypes.map((type) => ({
    type,
    data: Array.from({ length: 12 }, () =>
      `${Math.floor(Math.random() * 4)}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, "0")}`
    ),
  }));

  // ======= Вспомогательные функции =======
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const totalByMonth = months.map((_, monthIndex) => {
    const totalMinutes = enduranceData.reduce(
      (sum, zone) => sum + toMinutes(zone.data[monthIndex]),
      0
    );
    return toTimeString(totalMinutes);
  });

  const totalByZone = enduranceData.map((zone) => {
    const totalMinutes = zone.data.reduce(
      (sum, time) => sum + toMinutes(time),
      0
    );
    return toTimeString(totalMinutes);
  });

  const totalTrainingByMonth = months.map((_, i) => {
    const total = trainingTypeData.reduce(
      (sum, type) => sum + toMinutes(type.data[i]),
      0
    );
    return toTimeString(total);
  });

  const totalTrainingByType = trainingTypeData.map((t) => {
    const total = t.data.reduce((sum, time) => sum + toMinutes(time), 0);
    return toTimeString(total);
  });

  // ======= JSX =======
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Фильтры */}
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

        {/* Диаграмма */}
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
        </div>

        {/* ВЫНОСЛИВОСТЬ */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">ВЫНОСЛИВОСТЬ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800">
              <thead className="text-gray-400 bg-[#141518]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Зоны</th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-800">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {enduranceData.map(({ zone, color, data }, idx) => (
                  <tr key={zone} className="border-t border-gray-800 hover:bg-[#1b1c1f] transition">
                    <td className="py-3 px-3 flex items-center gap-3 border-r border-gray-800">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
                      {zone}
                    </td>
                    {data.map((t, i) => (
                      <td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>
                    ))}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-800">{totalByZone[idx]}</td>
                  </tr>
                ))}
                <tr className="bg-[#1a1b1e] border-t border-gray-700 font-semibold">
                  <td className="py-3 px-3 text-left border-r border-gray-800">Общее время</td>
                  {totalByMonth.map((t, i) => (
                    <td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>
                  ))}
                  <td className="py-3 text-center text-blue-400 border-l border-gray-800">
                    {toTimeString(totalByMonth.reduce((s, t) => s + toMinutes(t), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ТИП ТРЕНИРОВКИ */}
        <div className="bg-[#111214] p-5 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-semibold mb-3">ТИП ТРЕНИРОВКИ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse border border-gray-800">
              <thead className="text-gray-400 bg-[#141518]">
                <tr>
                  <th className="text-left py-2 px-3 border-r border-gray-800">Тип тренировки</th>
                  {months.map((m) => (
                    <th key={m} className="py-2 px-2 text-center border-r border-gray-800">{m}</th>
                  ))}
                  <th className="py-2 px-2 text-center text-blue-400 border-l border-gray-800">Общее время</th>
                </tr>
              </thead>
              <tbody>
                {trainingTypeData.map((row, idx) => (
                  <tr key={row.type} className="border-t border-gray-800 hover:bg-[#1b1c1f] transition">
                    <td className="py-3 px-3 text-left border-r border-gray-800 font-medium">{row.type}</td>
                    {row.data.map((time, i) => (
                      <td key={i} className="py-3 text-center border-r border-gray-800">{time}</td>
                    ))}
                    <td className="py-3 text-center text-blue-400 border-l border-gray-800">
                      {totalTrainingByType[idx]}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#1a1b1e] border-t border-gray-700 font-semibold">
                  <td className="py-3 px-3 text-left border-r border-gray-800">Общее время</td>
                  {totalTrainingByMonth.map((t, i) => (
                    <td key={i} className="py-3 text-center border-r border-gray-800">{t}</td>
                  ))}
                  <td className="py-3 text-center text-blue-400 border-l border-gray-800">
                    {toTimeString(totalTrainingByMonth.reduce((s, t) => s + toMinutes(t), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
