// src/pages/StatisticsPage/components/DistanceChart.tsx
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

const distanceColors: Record<string, string> = {
  "Лыжи, свободный стиль": "#4ade80",
  "Лыжи, классический стиль": "#22d3ee",
  "Лыжероллеры, классический стиль": "#facc15",
  "Лыжероллеры, свободный стиль": "#fb923c",
  "Велосипед": "#3b82f6",
};

export const DistanceChart = ({ data, types }: { data: any[], types: string[] }) => (
  <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
    <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={0} barCategoryGap="0%">
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#888", fontSize:12}}/>
          <Tooltip content={<CustomTooltip formatHours={false} />} />
          {types.map(type => (
            <Bar key={type} dataKey={type} stackId="a" fill={distanceColors[type]} radius={[4,4,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);