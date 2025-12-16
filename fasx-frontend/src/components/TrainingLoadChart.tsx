import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import dayjs from "dayjs";

interface Workout {
  date: string;
  distance?: number | null;
}

interface Props {
  workouts: Workout[];
}

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Кастомный тултип для соответствия стилю
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1d]/90 backdrop-blur-md border border-gray-700 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{payload[0].payload.day}</p>
        <p className="text-sm font-bold text-white">
          {payload[0].value} <span className="text-blue-500">км</span>
        </p>
      </div>
    );
  }
  return null;
};

const TrainingLoadChart: React.FC<Props> = ({ workouts }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const totals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    workouts.forEach((w) => {
      const d = dayjs(w.date);
      const dow = d.day();
      totals[dow] += w.distance || 0;
    });

    return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
      day: daysOfWeek[i === 0 ? 6 : i - 1],
      load: Math.round(totals[i]),
    }));
  }, [workouts]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-gray-400">
            Нагрузка
          </h2>
          <p className="text-2xl font-bold text-white">Динамика недели</p>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
        </div>
      </div>

      <div style={{ height: 250, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              {/* Градиент для обычных баров */}
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              {/* Градиент для активного бара */}
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#2a2a2d"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 11 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              animationDuration={200}
            />

            <Bar
              dataKey="load"
              radius={[6, 6, 2, 2]}
              barSize={32}
              initialAnimationState={true}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === activeIndex ? "url(#activeGradient)" : "url(#barGradient)"}
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrainingLoadChart;