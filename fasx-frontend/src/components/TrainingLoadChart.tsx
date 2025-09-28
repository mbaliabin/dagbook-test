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
const barColors = ["#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a","#1e40af","#2563eb"];

const TrainingLoadChart: React.FC<Props> = ({ workouts }) => {
  const data = useMemo(() => {
    const totals: Record<number, number> = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
    workouts.forEach(w => {
      const d = dayjs(w.date);
      const dow = d.day();
      totals[dow] += w.distance || 0;
    });
    return [1,2,3,4,5,6,0].map(i => ({
      day: daysOfWeek[i===0?6:i-1],
      load: Math.round(totals[i]),
    }));
  }, [workouts]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="bg-gradient-to-b from-[#121214] to-[#1a1a1d] rounded-xl text-white shadow-lg px-6 pt-3 pb-4 w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-3 select-none" style={{ letterSpacing: "0.03em" }}>
        Training Load
      </h2>
      <div style={{ height: 235, minWidth: 360, maxWidth: 560 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 40, bottom: 50, left: 16 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#999"
              tick={{ fill: "#bbb", fontSize: 14, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickMargin={18}
            />
            <YAxis
              stroke="#999"
              tick={{ fill: "#bbb", fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              contentStyle={{
                backgroundColor: "#2a2a2f",
                borderRadius: 8,
                border: "none",
                padding: "8px 12px",
                color: "#fff",
                fontSize: 15,
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(59,130,246,0.2)" }}
              formatter={(value: any) => [`${value} км`, "Distance"]}
            />
            <Bar
              dataKey="load"
              radius={[8, 8, 0, 0]}
              barSize={44}
              animationDuration={800}
              isAnimationActive={true}
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
                      filter: isActive ? "drop-shadow(0 0 10px #3b82f6)" : undefined,
                      cursor: "pointer",
                      transform: isActive ? "scale(1.12) translateY(-8px)" : "scale(1)",
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

export default TrainingLoadChart;
