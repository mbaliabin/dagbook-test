import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

// Цвета дистанций
const distanceColors: Record<string, string> = {
  run: "#4ade80",
  bike: "#60a5fa",
  swim: "#f472b6",
  walk: "#facc15",
};

// Цвета зон выносливости
const enduranceColors: Record<string, string> = {
  Z1: "#4ade80",
  Z2: "#60a5fa",
  Z3: "#facc15",
  Z4: "#fb923c",
  Z5: "#ef4444",
};

export default function TrainingPage({
  filteredMonths,
  filteredDistanceTypes,
  filteredEnduranceZones,
}) {
  // Фильтруем дистанции (оставляем только типы, где есть хотя бы одно значение > 0)
  const activeDistanceTypes = useMemo(
    () =>
      filteredDistanceTypes.filter((t) =>
        t.months.some((v) => Number(v) > 0)
      ),
    [filteredDistanceTypes]
  );

  // Фильтруем зоны выносливости
  const activeEnduranceZones = useMemo(
    () =>
      filteredEnduranceZones.filter((z) =>
        z.months.some((v) => Number(v) > 0)
      ),
    [filteredEnduranceZones]
  );

  // Данные для дистанций
  const distanceChartData = useMemo(() => {
    return filteredMonths.map((month, i) => {
      const data: any = { month };

      activeDistanceTypes.forEach((t) => {
        const value = Number(t.months[i]) || 0;
        if (value > 0) data[t.type] = value;
      });

      return data;
    });
  }, [filteredMonths, activeDistanceTypes]);

  // Данные для выносливости
  const enduranceChartData = useMemo(() => {
    return filteredMonths.map((month, i) => {
      const data: any = { month };

      activeEnduranceZones.forEach((z) => {
        const value = Number(z.months[i]) || 0;
        if (value > 0) data[z.zone] = value;
      });

      return data;
    });
  }, [filteredMonths, activeEnduranceZones]);

  return (
    <div className="flex flex-col gap-10 text-white p-5">
      {/* ДИАГРАММА ДИСТАНЦИЙ */}

      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Общая дистанция по видам тренировок
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distanceChartData} barGap={0} barCategoryGap="0%">
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

              {activeDistanceTypes.map((t) => (
                <Bar
                  key={t.type}
                  dataKey={t.type}
                  stackId="a"
                  fill={distanceColors[t.type] || "#888"}
                  minPointSize={1}
                  maxBarSize={Math.floor(800 / Math.max(1, filteredMonths.length))}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ДИАГРАММА ВЫНОСЛИВОСТИ */}

      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">
          Объём по зонам выносливости
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enduranceChartData} barGap={0} barCategoryGap="0%">
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
                              {p.dataKey}: {p.value}
                            </div>
                          ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {activeEnduranceZones.map((z) => (
                <Bar
                  key={z.zone}
                  dataKey={z.zone}
                  stackId="a"
                  fill={enduranceColors[z.zone]}
                  minPointSize={1}
                  maxBarSize={Math.floor(800 / Math.max(1, filteredMonths.length))}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}