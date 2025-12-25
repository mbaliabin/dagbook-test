// src/pages/StatisticsPage/components/DistanceChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

const distanceColors: Record<string, string> = {
  "Лыжи, свободный стиль": "#4ade80",
  "Лыжи, классический стиль": "#22d3ee",
  "Лыжероллеры, классика": "#facc15",
  "Лыжероллеры, конек": "#fb923c",
  "Велосипед": "#3b82f6",
};

export const DistanceChart = ({ data, types }: { data: any[], types: string[] }) => (
  <div className="w-full h-[350px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        {/* Тусклая горизонтальная сетка */}
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
        />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "#6b7280",
            fontSize: 9,
            fontWeight: 900,
            textTransform: 'uppercase'
          }}
          dy={10}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "#6b7280",
            fontSize: 9,
            fontWeight: 900
          }}
        />

        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          content={<CustomTooltip formatHours={false} />}
        />

        {types.map((type, index) => (
          <Bar
            key={type}
            dataKey={type}
            stackId="a"
            fill={distanceColors[type] || "#555"}
            // Скругление только для верхушки стопки
            radius={index === types.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            barSize={45}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);