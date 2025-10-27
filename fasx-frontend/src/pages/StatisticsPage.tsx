import React from "react";

export default function StatsPage() {
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const enduranceData = [
    { zone: "I1", time: "105:41", avg: "21:08", color: "#4ade80" },
    { zone: "I2", time: "47:49", avg: "9:33", color: "#22d3ee" },
    { zone: "I3", time: "12:51", avg: "2:34", color: "#facc15" },
    { zone: "I4", time: "7:15", avg: "1:27", color: "#fb923c" },
    { zone: "I5", time: "3:15", avg: "0:39", color: "#ef4444" },
  ];

  const movementData = [
    { type: "Лыжи / скейтинг", total: "39:30", avg: "7:54" },
    { type: "Лыжи, классика", total: "1:00", avg: "0:12" },
    { type: "Роллеры, классика", total: "43:20", avg: "8:44" },
    { type: "Роллеры, скейтинг", total: "67:27", avg: "13:29" },
    { type: "Велосипед", total: "23:36", avg: "4:43" },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-100">
          TOTALSUM
        </h1>

        <div className="flex gap-10 text-sm">
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
                    <td className="p-3">{zone.time}</td>
                    <td className="p-3">{zone.avg}</td>
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
