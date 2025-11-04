import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const zones = [
  { key: "I1", color: "#6CC070" },
  { key: "I2", color: "#9AD982" },
  { key: "I3", color: "#F8D44B" },
  { key: "I4", color: "#F89E4B" },
  { key: "I5", color: "#F85C4B" },
];

const data = [
  { week: "1 2025", I1: 3.2, I2: 1.5, I3: 0.8, I4: 0.2, I5: 0 },
  { week: "3 2025", I1: 6.1, I2: 3.2, I3: 1.0, I4: 0.4, I5: 0.2 },
  { week: "5 2025", I1: 4.0, I2: 2.8, I3: 1.2, I4: 0.5, I5: 0.1 },
  { week: "7 2025", I1: 5.3, I2: 2.1, I3: 1.1, I4: 0.3, I5: 0.2 },
  { week: "9 2025", I1: 3.8, I2: 2.5, I3: 0.9, I4: 0.2, I5: 0 },
  { week: "11 2025", I1: 4.4, I2: 1.9, I3: 0.6, I4: 0.3, I5: 0.1 },
  { week: "13 2025", I1: 6.0, I2: 2.7, I3: 1.2, I4: 0.4, I5: 0.1 },
  { week: "15 2025", I1: 5.8, I2: 2.2, I3: 1.0, I4: 0.3, I5: 0.1 },
  { week: "17 2025", I1: 6.5, I2: 3.1, I3: 1.2, I4: 0.4, I5: 0.1 },
  { week: "19 2025", I1: 4.3, I2: 1.8, I3: 0.8, I4: 0.2, I5: 0.1 },
  { week: "21 2025", I1: 7.1, I2: 3.4, I3: 1.4, I4: 0.5, I5: 0.1 },
  { week: "23 2025", I1: 6.0, I2: 2.9, I3: 1.1, I4: 0.4, I5: 0.1 },
];

export default function IntensityChart() {
  const [selectedMetric, setSelectedMetric] = useState<"time" | "sessions" | "percent">("time");

  return (
    <div className="bg-[#0f1115] text-gray-200 p-6 rounded-2xl shadow-lg max-w-[1200px] mx-auto space-y-6">
      {/* --- Панель управления --- */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <select
            className="bg-[#1b1e24] text-gray-300 px-3 py-2 rounded-lg border border-[#2a2e36] focus:outline-none focus:ring-1 focus:ring-[#6CC070]"
            defaultValue="total"
          >
            <option value="total">Общий отчёт</option>
            <option value="intensity">По зонам</option>
            <option value="activity">По типам активности</option>
          </select>

          <select
            className="bg-[#1b1e24] text-gray-300 px-3 py-2 rounded-lg border border-[#2a2e36] focus:outline-none focus:ring-1 focus:ring-[#6CC070]"
            defaultValue="week"
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Метрика:</label>
          <div className="flex bg-[#1b1e24] rounded-lg overflow-hidden border border-[#2a2e36]">
            <button
              onClick={() => setSelectedMetric("time")}
              className={`px-3 py-2 text-sm ${
                selectedMetric === "time" ? "bg-[#6CC070] text-black" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Время
            </button>
            <button
              onClick={() => setSelectedMetric("sessions")}
              className={`px-3 py-2 text-sm ${
                selectedMetric === "sessions" ? "bg-[#6CC070] text-black" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Сессии
            </button>
            <button
              onClick={() => setSelectedMetric("percent")}
              className={`px-3 py-2 text-sm ${
                selectedMetric === "percent" ? "bg-[#6CC070] text-black" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              %
            </button>
          </div>
        </div>
      </div>

      {/* --- Диаграмма --- */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e222a" />
            <XAxis dataKey="week" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1b1e24",
                border: "1px solid #2a2e36",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value: number) => [`${value.toFixed(1)} ч`, ""]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            />
            {zones.map((z) => (
              <Bar
                key={z.key}
                dataKey={z.key}
                stackId="a"
                fill={z.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Единица измерения: <span className="text-gray-300">часы</span>
      </div>
    </div>
  );
}
