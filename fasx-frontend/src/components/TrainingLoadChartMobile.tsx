import React, { useMemo } from "react";
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

const TrainingLoadChartMobile: React.FC<Props> = ({ workouts }) => {
  const data = useMemo(() => {
    const totals: Record<number, number> = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 };
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

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <div className="bg-gradient-to-b from-[#121214] to-[#1a1a1d] rounded-xl text-white shadow-lg px-4 pt-2 pb-3 w-full overflow-x-auto">
      <h2 className="text-lg font-semibold mb-2 select-none" style={{ letterSpacing: "0.03em" }}>
        Training Load
      </h2>
      <div style={{ height: 160, minWidth: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 35, left: 10 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#999"
              tick={{ fill: "#bbb", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
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
                backgroundColor: "rgba(30,30,35,0.85)",
                borderRadius: 8,
                border: "none",
                padding: "6px 10px",
                color: "#e0e0e0",
                fontSize: 13,
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              }}
              cursor={{ fill: "rgba(59,130,246,0.15)" }}
              formatter={(value: any) => [`${value}`, "Distance"]}
            />
            <Bar
              dataKey="load"
              radius={[6,6,0,0]}
              barSize={24} // уменьшили колонки
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
                      filter: isActive ? "drop-shadow(0 0 8px #3b82f6)" : undefined,
                      cursor: "pointer",
                      transform: isActive ? "scale(1.08) translateY(-5px)" : "scale(1)",
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