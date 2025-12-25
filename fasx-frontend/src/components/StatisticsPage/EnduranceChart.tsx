// src/pages/StatisticsPage/components/EnduranceChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const EnduranceChart = ({ data, zones }: { data: any[], zones: any[] }) => (
  <div className="w-full h-[350px]"> {/* Увеличил высоту для лучшей наглядности */}
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        {/* Очень тусклая сетка только по горизонтали */}
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
          content={<CustomTooltip formatHours={true} />}
        />

        {zones.map((z, index) => (
          <Bar
            key={z.zone}
            dataKey={z.zone}
            stackId="a"
            fill={z.color}
            // Скругление только для самого верхнего элемента в стопке
            radius={index === zones.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            barSize={45} // Фиксированная ширина для аккуратности
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);