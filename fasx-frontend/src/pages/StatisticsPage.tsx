import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatsPage() {
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const enduranceData = [
    { zone: "I1", time: 105, color: "#4ade80" },
    { zone: "I2", time: 47, color: "#22d3ee" },
    { zone: "I3", time: 12, color: "#facc15" },
    { zone: "I4", time: 7, color: "#fb923c" },
    { zone: "I5", time: 3, color: "#ef4444" },
  ];

  const movementData = [
    { type: "Лыжи / скейтинг", total: "39:30", avg: "7:54" },
    { type: "Лыжи, классика", total: "1:00", avg: "0:12" },
    { type: "Роллеры, классика", total: "43:20", avg: "8:44" },
    { type: "Роллеры, скейтинг", total: "67:27", avg: "13:29" },
    { type: "Велосипед", total: "23:36", avg: "4:43" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
          <p className="font-semibold">{data.zone}</p>
          <p className="mt-1 text-gray-400">Время: {data.time} ч</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Diagram */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">
            Зоны выносливости
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enduranceData} barSize={35}>
                <XAxis
                  dataKey="zone"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {enduranceData.map((zone) => (
                  <Bar
                    key={zone.zone}
                    dataKey="time"
                    name={zone.zone}
                    fill={zone.color}
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOTALSUM */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">
            TOTALSUM
          </h1>

          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div>
              <p className="text-gray-400">Тренировочные дни</p>
              <p className="text-xl text-gray-100">{totals.trainingDays}</p>
            </div>
            <div>
              <p className="text-gray-400">Сессий</p>
              <p className="text-xl text-gray-100">{totals.sessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Время</p>
              <p className="text-xl text-gray-100">{totals.time}</p>
            </div>
          </div>
        </div>

        {/* Section: Dagsparametere */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Дневные параметры
          </h2>
          <div className="text-gray-500 text-sm">
            <p>Сюда позже можно добавить анализ по дням недели, соревнованиям и т.д.</p>
          </div>
        </div>

        {/* Section: Utholdenhet */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Выносливость (Utholdenhet)
          </h2>
          <div className="overflow-hidden rounded-xl">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#222] text-gray-400 text-left">
                  <th className="p-3 font-medium">Зона</th>
                  <th className="p-3 font-medium">Общее время</th>
                  <th className="p-3 font-medium">Среднее</th>
                </tr>
              </thead>
              <tbody>
                {enduranceData.map((zone) => (
                  <tr
                    key={zone.zone}
                    className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
                  >
                    <td className="p-3 flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-md"
                        style={{ backgroundColor: zone.color }}
                      ></div>
                      {zone.zone}
                    </td>
                    <td className="p-3">{zone.time}:00</td>
                    <td className="p-3">–</td>
                  </tr>
                ))}
                <tr className="bg-[#222] font-medium text-gray-300 border-t border-[#333]">
                  <td className="p-3">Всего</td>
                  <td className="p-3">{totals.time}</td>
                  <td className="p-3">–</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Bevegelsesformer */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Формы активности (Bevegelsesformer)
          </h2>
          <div className="overflow-hidden rounded-xl">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#222] text-gray-400 text-left">
                  <th className="p-3 font-medium">Тип</th>
                  <th className="p-3 font-medium">Общее время</th>
                  <th className="p-3 font-medium">Среднее</th>
                </tr>
              </thead>
              <tbody>
                {movementData.map((m) => (
                  <tr
                    key={m.type}
                    className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
                  >
                    <td className="p-3">{m.type}</td>
                    <td className="p-3">{m.total}</td>
                    <td className="p-3">{m.avg}</td>
                  </tr>
                ))}
                <tr className="bg-[#222] font-medium text-gray-300 border-t border-[#333]">
                  <td className="p-3">Всего</td>
                  <td className="p-3">{totals.time}</td>
                  <td className="p-3">35:22</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center mt-6">
          FASX Training Dashboard — демо-страница статистики
        </div>
      </div>
    </div>
  );
}
