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

interface TrainingData {
  week: string;
  styrke: number;
  kondisjon: number;
  bevegelighet: number;
  teknikk: number;
}

const initialData: TrainingData[] = [
  { week: "W1 2025", styrke: 8, kondisjon: 4, bevegelighet: 2, teknikk: 1 },
  { week: "W2 2025", styrke: 7, kondisjon: 6, bevegelighet: 2, teknikk: 2 },
  { week: "W3 2025", styrke: 10, kondisjon: 5, bevegelighet: 3, teknikk: 1 },
  { week: "W4 2025", styrke: 6, kondisjon: 3, bevegelighet: 1, teknikk: 2 },
  { week: "W5 2025", styrke: 11, kondisjon: 7, bevegelighet: 3, teknikk: 1 },
];

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

  const handleGenerateReport = () => {
    console.log("Generate report for", fromDate, "to", toDate);
  };

  const syncScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const tables = document.querySelectorAll(".data-scroll-sync");
    tables.forEach((t) => {
      if (t !== e.currentTarget) (t as HTMLElement).scrollLeft = scrollLeft;
    });
  };

  const totalSum = useMemo(() => {
    const sum: Record<string, number> = {};
    columns.forEach((col) => {
      sum[col] = filteredData.reduce((a, b) => a + b[col], 0);
    });
    sum.total = columns.reduce((acc, col) => acc + sum[col], 0);
    return sum;
  }, [filteredData]);

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
            onClick={handleGenerateReport}
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
            <Tooltip
              contentStyle={{ backgroundColor: "#1f1f1f", borderColor: "#333", color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="styrke" stackId="a" fill="#34d399" name="Styrke" />
            <Bar dataKey="kondisjon" stackId="a" fill="#fbbf24" name="Kondisjon" />
            <Bar dataKey="bevegelighet" stackId="a" fill="#60a5fa" name="Bevegelighet" />
            <Bar dataKey="teknikk" stackId="a" fill="#f87171" name="Teknikk" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Таблица */}
      <div className="bg-[#1a1a1d] rounded-2xl shadow-lg border border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3">Treningsoversikt</h2>
        <div
          className="overflow-x-auto data-scroll-sync"
          onScroll={syncScroll}
          ref={scrollRef}
        >
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-[#222] text-gray-400 sticky top-0">
              <tr>
                <th className="border p-2 text-left sticky left-0 bg-[#222] z-10">Uke</th>
                {columns.map((col) => (
                  <th key={col} className="border p-2 text-center">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </th>
                ))}
                <th className="border p-2 text-center font-semibold bg-[#1f1f1f]">Totalt</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => {
                const total = columns.reduce((sum, col) => sum + row[col], 0);
                return (
                  <tr key={row.week} className="hover:bg-[#252525]/50 transition">
                    <td className="border p-2 sticky left-0 bg-[#1a1a1d] z-0">{row.week}</td>
                    {columns.map((col) => (
                      <td key={col} className="border p-2 text-center">{row[col]}</td>
                    ))}
                    <td className="border p-2 text-center font-semibold bg-[#1f1f1f]">{total}</td>
                  </tr>
                );
              })}
              <tr className="bg-[#222] font-semibold">
                <td className="border p-2 sticky left-0 bg-[#222] z-0">Sum</td>
                {columns.map((col) => (
                  <td key={col} className="border p-2 text-center">{totalSum[col]}</td>
                ))}
                <td className="border p-2 text-center bg-[#1f1f1f]">{totalSum.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingReportDashboard;
