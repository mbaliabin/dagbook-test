import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatsPage() {
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
  };

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

  const enduranceZones = [
    {
      zone: "I1",
      color: "#4ade80",
      months: [10, 8, 12, 9, 11, 14, 13, 10, 8, 5, 3, 2],
      total: 105,
    },
    {
      zone: "I2",
      color: "#22d3ee",
      months: [5, 6, 7, 3, 4, 5, 6, 3, 4, 2, 1, 1],
      total: 47,
    },
    {
      zone: "I3",
      color: "#facc15",
      months: [2, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1],
      total: 12,
    },
    {
      zone: "I4",
      color: "#fb923c",
      months: [1, 1, 2, 0, 1, 1, 0, 0, 1, 0, 0, 0],
      total: 7,
    },
    {
      zone: "I5",
      color: "#ef4444",
      months: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
      total: 3,
    },
  ];

  const movementTypes = [
    {
      type: "Лыжи / скейтинг",
      months: [4, 5, 3, 0, 0, 0, 0, 0, 1, 2, 3, 2],
      total: 20,
    },
    {
      type: "Лыжи, классика",
      months: [3, 4, 2, 0, 0, 0, 0, 0, 0, 1, 2, 1],
      total: 13,
    },
    {
      type: "Роллеры, классика",
      months: [0, 0, 0, 3, 5, 6, 7, 5, 4, 3, 2, 0],
      total: 35,
    },
    {
      type: "Роллеры, скейтинг",
      months: [0, 0, 0, 2, 6, 7, 8, 6, 5, 3, 2, 0],
      total: 39,
    },
    {
      type: "Велосипед",
      months: [0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0],
      total: 16,
    },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

      {/* Верхняя плашка */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img src="/profile-avatar.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
                  <div>
                    <h1 className="text-2xl font-bold">{name}</h1>
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


        {/* Diagram */}
        <div className="bg-[#1a1a1a] rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">
            Зоны выносливости
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const chartData = months.map((month, i) => {
                  const data: any = { month };
                  enduranceZones.forEach((zone) => {
                    data[zone.zone] = zone.months[i];
                  });
                  return data;
                });

                return (
                  <BarChart data={chartData} barSize={35}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
                              {payload.map((p: any) => (
                                <p key={p.dataKey} className="mt-1">
                                  <span
                                    className="inline-block w-3 h-3 mr-1 rounded-full"
                                    style={{ backgroundColor: p.fill }}
                                  ></span>
                                  {p.dataKey}: {formatTime(p.value)}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {enduranceZones.map((zone) => (
                      <Bar
                        key={zone.zone}
                        dataKey={zone.zone}
                        stackId="a"
                        fill={zone.color}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                );
              })()}
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

        {/* Table: Endurance Zones by Month */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Выносливость (Utholdenhet)
          </h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">
                  Зона
                </th>
                {months.map((m) => (
                  <th key={m} className="p-3 font-medium text-center">
                    {m}
                  </th>
                ))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">
                  Всего
                </th>
              </tr>
            </thead>
            <tbody>
              {enduranceZones.map((z) => (
                <tr
                  key={z.zone}
                  className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
                >
                  <td className="p-3 flex items-center gap-3 sticky left-0 bg-[#1a1a1a]">
                    <div
                      className="w-5 h-5 rounded-md"
                      style={{ backgroundColor: z.color }}
                    ></div>
                    {z.zone}
                  </td>
                  {z.months.map((val, i) => (
                    <td key={i} className="p-3 text-center">
                      {val > 0 ? formatTime(val) : "-"}
                    </td>
                  ))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">
                    {formatTime(z.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table: Activity Types by Month */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Формы активности (Bevegelsesformer)
          </h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">
                  Тип активности
                </th>
                {months.map((m) => (
                  <th key={m} className="p-3 font-medium text-center">
                    {m}
                  </th>
                ))}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">
                  Всего
                </th>
              </tr>
            </thead>
            <tbody>
              {movementTypes.map((m) => (
                <tr
                  key={m.type}
                  className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition"
                >
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">
                    {m.type}
                  </td>
                  {m.months.map((val, i) => (
                    <td key={i} className="p-3 text-center">
                      {val > 0 ? formatTime(val) : "-"}
                    </td>
                  ))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">
                    {formatTime(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-500 text-center mt-6">
          FASX Training Dashboard — годовая статистика
        </div>
      </div>
    </div>
  );
}
