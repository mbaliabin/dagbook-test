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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1d]/95 backdrop-blur-md border border-gray-800 p-2 rounded-lg shadow-2xl">
        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">{payload[0].payload.day}</p>
        <p className="text-xs font-bold text-white">
          {payload[0].value} <span className="text-blue-500 ml-0.5">км</span>
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
      {/* Заголовок */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-1">
            Training Load
          </h2>
          <p className="text-lg font-bold text-white tracking-tight leading-none">Активность</p>
        </div>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest border-b border-gray-800 pb-1">
          Расстояние /км
        </span>
      </div>

      <div style={{ height: 210, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#2a2a2d" opacity={0.4} />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#555", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#555", fontSize: 9 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              animationDuration={150}
            />

            <Bar
              dataKey="load"
              radius={[4, 4, 0, 0]}
              barSize={26}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === activeIndex ? "url(#activeGradient)" : "url(#barGradient)"}
                  className="transition-all duration-300"
                  style={{ cursor: 'pointer' }}
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