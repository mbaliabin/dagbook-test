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
      <div className="bg-[#1a1a1d]/95 backdrop-blur-md border border-gray-800 p-2.5 rounded-lg shadow-2xl">
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500/90 mb-0.5">
            Training Load
          </h2>
          <p className="text-lg font-bold text-white tracking-tight">Активность</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0f0f0f] px-2.5 py-1 rounded-full border border-gray-800">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Live</span>
        </div>
      </div>

      <div style={{ height: 220, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.activeTooltipIndex !== undefined) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2a2a2d" opacity={0.5} />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#555", fontSize: 10, fontWeight: 600 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#555", fontSize: 9 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
              animationDuration={200}
            />

            <Bar
              dataKey="load"
              radius={[4, 4, 0, 0]}
              barSize={28}
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