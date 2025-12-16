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
  if (active && payload && payload.length && payload[0].value > 0) {
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

  const { data, isEmpty } = useMemo(() => {
    const totals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let totalSum = 0;

    workouts.forEach((w) => {
      const d = dayjs(w.date);
      const dow = d.day();
      const dist = w.distance || 0;
      totals[dow] += dist;
      totalSum += dist;
    });

    const chartData = [1, 2, 3, 4, 5, 6, 0].map((i) => ({
      day: daysOfWeek[i === 0 ? 6 : i - 1],
      load: Math.round(totals[i]),
    }));

    return { data: chartData, isEmpty: totalSum === 0 };
  }, [workouts]);

  return (
    <div className="w-full relative">
      {/* Заголовок */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-1">
            Training Load
          </h2>
          <p className="text-lg font-bold text-white tracking-tight leading-none">Активность</p>
        </div>
        {!isEmpty && (
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest border-b border-gray-800 pb-1">
            Расстояние \км
          </span>
        )}
      </div>

      <div className="relative" style={{ height: 210, width: "100%" }}>
        {/* Заглушка, если данных нет */}
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1a1a1d]/40 backdrop-blur-[1px] rounded-xl">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Нет данных</p>
            <p className="text-[9px] text-gray-600 mt-1 uppercase">за выбранный период</p>
          </div>
        )}

        <div className={isEmpty ? "opacity-20 grayscale" : "opacity-100"}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
              onMouseMove={(state) => {
                if (!isEmpty && state.activeTooltipIndex !== undefined) {
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
                tick={{ fill: "#444", fontSize: 10, fontWeight: 600 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#444", fontSize: 9 }}
                domain={[0, 'auto']}
              />

              {!isEmpty && (
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  animationDuration={150}
                />
              )}

              <Bar
                dataKey="load"
                radius={[4, 4, 0, 0]}
                barSize={26}
                isAnimationActive={!isEmpty}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === activeIndex ? "url(#activeGradient)" : "url(#barGradient)"}
                    className="transition-all duration-300"
                    style={{ cursor: isEmpty ? 'default' : 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrainingLoadChart;