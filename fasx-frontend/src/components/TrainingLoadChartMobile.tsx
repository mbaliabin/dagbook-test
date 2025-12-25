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
      <div className="bg-[#131316] border border-white/10 p-2 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">
          {payload[0].payload.day}
        </p>
        <p className="text-xs font-black text-white">
          {payload[0].value} <span className="text-blue-500 ml-0.5 text-[10px]">км</span>
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
      load: Math.round(totals[i] * 10) / 10, // Сохраняем один знак после запятой
    }));

    return { data: chartData, isEmpty: totalSum === 0 };
  }, [workouts]);

  return (
    <div className="w-full">
      {/* HEADER ГРАФИКА */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">
            Weekly Activity
          </h2>
          <p className="text-sm font-black text-white uppercase tracking-tight">Нагрузка</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-black text-white leading-none">
            {data.reduce((sum, d) => sum + d.load, 0).toFixed(1)}
          </p>
          <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">Всего км</p>
        </div>
      </div>

      <div className="relative" style={{ height: 180, width: "100%" }}>
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-800">Нет данных</span>
          </div>
        )}

        <div className={`h-full transition-opacity duration-500 ${isEmpty ? "opacity-10 grayscale" : "opacity-100"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 0, left: -45, bottom: 0 }}
              onClick={(state: any) => {
                if (state && state.activeTooltipIndex !== undefined) {
                    setActiveIndex(state.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.03} />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#4b5563", fontSize: 9, fontWeight: 800 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#374151", fontSize: 8 }}
                domain={[0, 'auto']}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "white", opacity: 0.03 }}
                trigger="click" // Лучше для мобилок
              />

              <Bar
                dataKey="load"
                radius={[6, 6, 2, 2]}
                barSize={20}
                isAnimationActive={true}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === activeIndex ? "url(#activeGradient)" : "url(#barGradient)"}
                    stroke={index === activeIndex ? "#3b82f6" : "transparent"}
                    strokeWidth={1}
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