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
const barColors = [
  "linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)",
  "linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)",
  "linear-gradient(180deg, #1d4ed8 0%, #2563eb 100%)",
  "linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%)",
  "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)",
  "linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%)",
  "linear-gradient(180deg, #2563eb 0%, #3b82f6 100%)",
];

const TrainingLoadChartMobile: React.FC<Props> = ({ workouts }) => {
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

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-b from-[#121214] to-[#1a1a1d] rounded-xl text-white shadow-xl px-4 pt-3 pb-4 w-full overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2 select-none tracking-wide">Training Load</h2>
      <div style={{ height: 180, minWidth: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 35, left: 10 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#999"
              tick={{ fill: "#bbb", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={14}
            />
            <YAxis
              stroke="#999"
              tick={{ fill: "#bbb", fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              contentStyle={{
                backgroundColor: "rgba(30,30,35,0.9)",
                borderRadius: 10,
                border: "none",
                padding: "8px 12px",
                color: "#f0f0f0",
                fontSize: 13,
                boxShadow: "0 6px 14px rgba(0,0,0,0.45)",
              }}
              cursor={{ fill: "rgba(59,130,246,0.15)" }}
              formatter={(value: any) => [`${value} км`, "Distance"]}
            />
            <Bar
              dataKey="load"
              radius={[6, 6, 0, 0]}
              barSize={28}
              animationDuration={700}
              isAnimationActive
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => {
                const isActive = index === activeIndex;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColors[index % barColors.length]}
                    style={{
                      transition: "all 0.3s ease",
                      filter: isActive ? "drop-shadow(0 0 12px #3b82f6)" : undefined,
                      cursor: "pointer",
                      transform: isActive ? "scale(1.1) translateY(-6px)" : "scale(1)",
                    }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrainingLoadChartMobile;
