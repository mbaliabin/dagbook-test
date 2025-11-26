// Обновлённый полный компонент страницы тренировок (вариант A)
// Чистый React, без мутаций данных, с корректной фильтрацией активных зон

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// distance colors
const distanceColors: any = {
  swim: "#3b82f6",
  bike: "#fbbf24",
  run: "#ef4444",
  strength: "#10b981",
  functional: "#8b5cf6",
  other: "#6b7280",
};

// endurance zones colors
const enduranceZones: any[] = [
  { zone: "Z1", color: "#4ade80" },
  { zone: "Z2", color: "#22c55e" },
  { zone: "Z3", color: "#eab308" },
  { zone: "Z4", color: "#f97316" },
  { zone: "Z5", color: "#ef4444" },
];

const TrainingPage = ({ months, trainings }: any) => {
  const filteredMonths = months;

  // ----------------------
  // DISTANCE TYPES MONTHLY
  // ----------------------

  const filteredDistanceTypes = useMemo(() => {
    const types = Object.keys(distanceColors);

    return types.map((type) => {
      const monthsData = filteredMonths.map((month: string) => {
        const items = trainings.filter((t: any) => t.month === month && t.type === type);
        return items.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);
      });
      return { type, months: monthsData };
    });
  }, [filteredMonths, trainings]);

  // активные distance типы (есть хотя бы один месяц с данными)
  const activeDistanceTypes = filteredDistanceTypes
    .filter((t) => t.months.some((v) => Number(v) > 0))
    .map((t) => t.type);

  // ----------------------------
  // ENDURANCE ZONES MONTHLY
  // ----------------------------

  const filteredEnduranceZones = useMemo(() => {
    return enduranceZones.map((zone) => {
      const monthsData = filteredMonths.map((month: string) => {
        const items = trainings.filter(
          (t: any) => t.month === month && t.zone === zone.zone
        );
        return items.reduce((sum: number, t: any) => sum + (t.distance || 0), 0);
      });
      return { zone: zone.zone, color: zone.color, months: monthsData };
    });
  }, [filteredMonths, trainings]);

  // фильтр только зон, где реально есть данные
  const activeEnduranceZones = filteredEnduranceZones.filter((z) =>
    z.months.some((v) => Number(v) > 0)
  );

  return (
    <div className="space-y-8">
      {/* --- Диаграмма зон выносливости --- */}
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Дистанция по зонам выносливости
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredMonths.map((month: string, i: number) => {
                const data: any = { month };
                activeEnduranceZones.forEach((zone) => {
                  const value = zone.months[i] ?? 0;
                  if (value > 0) data[zone.zone] = value;
                });
                return data;
              })}
              barGap={0}
              barCategoryGap="0%"
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888", fontSize: 12 }}
              />

              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.some((p: any) => p.value > 0)) {
                    return (
                      <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">
                        {payload
                          .filter((p: any) => p.value > 0)
                          .map((p: any) => (
                            <div key={p.dataKey}>
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {p.value} км
                            </div>
                          ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {activeEnduranceZones.map((zone) => (
                <Bar
                  key={zone.zone}
                  dataKey={zone.zone}
                  stackId="a"
                  fill={zone.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Диаграмма дистанций по типам --- */}
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Общая дистанция по видам тренировок
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredMonths.map((month: string, i: number) => {
                const data: any = { month };
                filteredDistanceTypes.forEach((t) => {
                  const value = t.months[i] ?? 0;
                  if (value > 0) data[t.type] = value;
                });
                return data;
              })}
              barGap={0}
              barCategoryGap="0%"
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888", fontSize: 12 }}
              />

              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.some((p: any) => p.value > 0)) {
                    return (
                      <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">
                        {payload
                          .filter((p: any) => p.value > 0)
                          .map((p: any) => (
                            <div key={p.dataKey}>
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {p.value} км
                            </div>
                          ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {activeDistanceTypes.map((type) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId="a"
                  fill={distanceColors[type] || "#888"}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
