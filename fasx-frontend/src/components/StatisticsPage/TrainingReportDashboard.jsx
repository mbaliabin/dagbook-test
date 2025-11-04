import React, { useState, useRef } from "react";
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

const TrainingReportDashboard = () => {
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  const scrollRef = useRef<HTMLDivElement>(null);

  const data = [
    { week: "W1 2025", styrke: 8, kondisjon: 4, bevegelighet: 2, teknikk: 1 },
    { week: "W2 2025", styrke: 7, kondisjon: 6, bevegelighet: 2, teknikk: 2 },
    { week: "W3 2025", styrke: 10, kondisjon: 5, bevegelighet: 3, teknikk: 1 },
    { week: "W4 2025", styrke: 6, kondisjon: 3, bevegelighet: 1, teknikk: 2 },
    { week: "W5 2025", styrke: 11, kondisjon: 7, bevegelighet: 3, teknikk: 1 },
  ];

  // синхронный скролл (если будет несколько таблиц)
  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const tables = document.querySelectorAll(".data-scroll-sync");
    tables.forEach((t) => {
      if (t !== e.currentTarget) (t as HTMLElement).scrollLeft = scrollLeft;
    });
  };

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
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm">
            Generer rapport
          </button>
        </div>
      </div>

      {/* Диаграмма */}
      <div className="bg-[#1a1a1d] rounded-2xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Treningstimer per uke</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
                <th className="border p-2 text-center">Styrke</th>
                <th className="border p-2 text-center">Kondisjon</th>
                <th className="border p-2 text-center">Bevegelighet</th>
                <th className="border p-2 text-center">Teknikk</th>
                <th className="border p-2 text-center font-semibold bg-[#1f1f1f]">
                  Totalt
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const total =
                  row.styrke + row.kondisjon + row.bevegelighet + row.teknikk;
                return (
                  <tr key={idx} className="hover:bg-[#252525]/50 transition">
                    <td className="border p-2 sticky left-0 bg-[#1a1a1d] z-0">{row.week}</td>
                    <td className="border p-2 text-center">{row.styrke}</td>
                    <td className="border p-2 text-center">{row.kondisjon}</td>
                    <td className="border p-2 text-center">{row.bevegelighet}</td>
                    <td className="border p-2 text-center">{row.teknikk}</td>
                    <td className="border p-2 text-center font-semibold bg-[#1f1f1f]">
                      {total}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#222] font-semibold">
                <td className="border p-2 sticky left-0 bg-[#222] z-0">Sum</td>
                <td className="border p-2 text-center">
                  {data.reduce((a, b) => a + b.styrke, 0)}
                </td>
                <td className="border p-2 text-center">
                  {data.reduce((a, b) => a + b.kondisjon, 0)}
                </td>
                <td className="border p-2 text-center">
                  {data.reduce((a, b) => a + b.bevegelighet, 0)}
                </td>
                <td className="border p-2 text-center">
                  {data.reduce((a, b) => a + b.teknikk, 0)}
                </td>
                <td className="border p-2 text-center bg-[#1f1f1f]">
                  {data.reduce(
                    (a, b) =>
                      a + b.styrke + b.kondisjon + b.bevegelighet + b.teknikk,
                    0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingReportDashboard;
