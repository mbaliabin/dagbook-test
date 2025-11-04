import React, { useState, useRef, useMemo } from "react";
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
import dayjs from "dayjs";

interface TrainingData {
  week: string;
  styrke: number;
  kondisjon: number;
  bevegelighet: number;
  teknikk: number;
}

// Генерация большого количества недель для теста скролла
const generateWeeks = (year: number, totalWeeks: number): TrainingData[] => {
  return Array.from({ length: totalWeeks }, (_, i) => ({
    week: `W${i + 1} ${year}`,
    styrke: Math.floor(Math.random() * 10),
    kondisjon: Math.floor(Math.random() * 10),
    bevegelighet: Math.floor(Math.random() * 5),
    teknikk: Math.floor(Math.random() * 3),
  }));
};

const initialData = generateWeeks(2025, 50); // 50 недель

const columns: (keyof TrainingData)[] = ["styrke", "kondisjon", "bevegelighet", "teknikk"];

const TrainingReportDashboard: React.FC = () => {
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return initialData.filter((d) => {
      const weekNumber = parseInt(d.week.match(/\d+/)?.[0] || "0", 10);
      const weekStart = new Date(2025, 0, 1 + (weekNumber - 1) * 7);
      return weekStart >= from && weekStart <= to;
    });
  }, [fromDate, toDate]);

  const totalSum = useMemo(() => {
    const sum: Record<string, number> = {};
    columns.forEach((col) => {
      sum[col] = filteredData.reduce((a, b) => a + b[col], 0);
    });
    sum.total = columns.reduce((acc, col) => acc + sum[col], 0);
    return sum;
  }, [filteredData]);

  const syncScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const tables = document.querySelectorAll(".data-scroll-sync");
    tables.forEach((t) => {
      if (t !== e.currentTarget) (t as HTMLElement).scrollLeft = scrollLeft;
    });
  };

  const monthLabels = filteredData.map((d) => d.week);

  const parametersDay = Array.from({ length: 15 }, (_, i) => ({
    param: `Параметр ${i + 1}`,
    months: filteredData.map(() => Math.floor(Math.random() * 3)),
  }));

  const enduranceZones = Array.from({ length: 6 }, (_, i) => ({
    zone: `I${i + 1}`,
    color: ["#4ade80", "#22d3ee", "#facc15", "#fb923c", "#ef4444", "#a78bfa"][i],
    months: filteredData.map(() => Math.floor(Math.random() * 5)),
  }));

  const movementTypes = Array.from({ length: 8 }, (_, i) => ({
    type: `Тип ${i + 1}`,
    months: filteredData.map(() => Math.floor(Math.random() * 4)),
  }));

  return (
    <div className="p-6 bg-[#0f0f0f] text-gray-200 min-h-screen space-y-6">
      {/* Панель фильтров */}
      <div className="grid grid-cols-5 gap-4 bg-[#1a1a1d] rounded-2xl shadow-lg p-4 border border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1">Type rapport</label>
          <select className="w-full border border-gray-600 rounded-lg p-2 bg-[#1a1a1d] text-gray-200 text-sm">
            <option>Totalrapport</option>
            <option>Ukevis</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Treningsnivå</label>
          <select className="w-full border border-gray-600 rounded-lg p-2 bg-[#1a1a1d] text-gray-200 text-sm">
            <option>Alle</option>
            <option>Nybegynner</option>
            <option>Viderekommen</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fra</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-600 rounded-lg p-2 bg-[#1a1a1d] text-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Til</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-600 rounded-lg p-2 bg-[#1a1a1d] text-gray-200 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm"
            onClick={() => console.log("Generate report")}
          >
            Generer rapport
          </button>
        </div>
      </div>

      {/* Диаграмма */}
      <div className="bg-[#1a1a1d] rounded-2xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Treningstimer per uke</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="week" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: "#1f1f1f", borderColor: "#333", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="styrke" stackId="a" fill="#34d399" name="Styrke" />
            <Bar dataKey="kondisjon" stackId="a" fill="#fbbf24" name="Kondisjon" />
            <Bar dataKey="bevegelighet" stackId="a" fill="#60a5fa" name="Bevegelighet" />
            <Bar dataKey="teknikk" stackId="a" fill="#f87171" name="Teknikk" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Таблицы */}
      {/* Параметры дня */}
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto data-scroll-sync" onScroll={syncScroll} ref={scrollRef}>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Параметры дня</h2>
        <table className="w-full min-w-[1200px] text-sm border-collapse">
          <thead>
            <tr className="bg-[#222] text-gray-400 text-left">
              <th className="p-3 font-medium sticky left-0 bg-[#222]">Параметр</th>
              {monthLabels.map((m) => <th key={m} className="p-3 font-medium text-center">{m}</th>)}
              <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
            </tr>
          </thead>
          <tbody>
            {parametersDay.map((row) => {
              const total = row.months.reduce((a,b)=>a+b,0);
              return (
                <tr key={row.param} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">{row.param}</td>
                  {row.months.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Выносливость */}
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto data-scroll-sync" onScroll={syncScroll}>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Выносливость</h2>
        <table className="w-full min-w-[1200px] text-sm border-collapse">
          <thead>
            <tr className="bg-[#222] text-gray-400 text-left">
              <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
              {monthLabels.map((m) => <th key={m} className="p-3 font-medium text-center">{m}</th>)}
              <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
            </tr>
          </thead>
          <tbody>
            {enduranceZones.map((z) => {
              const total = z.months.reduce((a,b)=>a+b,0);
              return (
                <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 flex items-center gap-2 sticky left-0 bg-[#1a1a1a]">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></span>
                    {z.zone}
                  </td>
                  {z.months.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Формы активности */}
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto data-scroll-sync" onScroll={syncScroll}>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Формы активности</h2>
        <table className="w-full min-w-[1200px] text-sm border-collapse">
          <thead>
            <tr className="bg-[#222] text-gray-400 text-left">
              <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип активности</th>
              {monthLabels.map((m) => <th key={m} className="p-3 font-medium text-center">{m}</th>)}
              <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
            </tr>
          </thead>
          <tbody>
            {movementTypes.map((m) => {
              const total = m.months.reduce((a,b)=>a+b,0);
              return (
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                  {m.months.map((val,i)=>(<td key={i} className="p-3 text-center">{val>0?val:"-"}</td>))}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingReportDashboard;
