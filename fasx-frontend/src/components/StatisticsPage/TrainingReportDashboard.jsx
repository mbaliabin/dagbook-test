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

const TrainingReportDashboard = () => {
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-31");

  // Моковые данные
  const data = [
    { week: "W1 2025", styrke: 8, kondisjon: 4, bevegelighet: 2, teknikk: 1 },
    { week: "W2 2025", styrke: 7, kondisjon: 6, bevegelighet: 2, teknikk: 2 },
    { week: "W3 2025", styrke: 10, kondisjon: 5, bevegelighet: 3, teknikk: 1 },
    { week: "W4 2025", styrke: 6, kondisjon: 3, bevegelighet: 1, teknikk: 2 },
    { week: "W5 2025", styrke: 11, kondisjon: 7, bevegelighet: 3, teknikk: 1 },
  ];

  return (
    <div className="p-6 bg-gray-50 text-gray-900">
      {/* Панель фильтров */}
      <div className="grid grid-cols-5 gap-4 bg-white rounded-2xl shadow-sm p-4 mb-6 border">
        <div>
          <label className="block text-sm font-medium mb-1">Type rapport</label>
          <select className="w-full border rounded-lg p-2 text-sm">
            <option>Totalrapport</option>
            <option>Ukevis</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Treningsnivå</label>
          <select className="w-full border rounded-lg p-2 text-sm">
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
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Til</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm">
            Generer rapport
          </button>
        </div>
      </div>

      {/* Диаграмма */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border mb-6">
        <h2 className="text-lg font-semibold mb-4">Treningstimer per uke</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="styrke" stackId="a" fill="#34d399" name="Styrke" />
            <Bar
              dataKey="kondisjon"
              stackId="a"
              fill="#fbbf24"
              name="Kondisjon"
            />
            <Bar
              dataKey="bevegelighet"
              stackId="a"
              fill="#60a5fa"
              name="Bevegelighet"
            />
            <Bar dataKey="teknikk" stackId="a" fill="#f87171" name="Teknikk" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <h2 className="text-lg font-semibold mb-3">Treningsoversikt</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border p-2 text-left">Uke</th>
                <th className="border p-2 text-center">Styrke</th>
                <th className="border p-2 text-center">Kondisjon</th>
                <th className="border p-2 text-center">Bevegelighet</th>
                <th className="border p-2 text-center">Teknikk</th>
                <th className="border p-2 text-center font-semibold bg-gray-50">
                  Totalt
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const total =
                  row.styrke + row.kondisjon + row.bevegelighet + row.teknikk;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2">{row.week}</td>
                    <td className="border p-2 text-center">{row.styrke}</td>
                    <td className="border p-2 text-center">{row.kondisjon}</td>
                    <td className="border p-2 text-center">
                      {row.bevegelighet}
                    </td>
                    <td className="border p-2 text-center">{row.teknikk}</td>
                    <td className="border p-2 text-center font-semibold bg-gray-50">
                      {total}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-semibold">
                <td className="border p-2">Sum</td>
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
                <td className="border p-2 text-center bg-gray-50">
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
