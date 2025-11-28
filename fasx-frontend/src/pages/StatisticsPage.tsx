// FULL UPDATED PAGE WITH UNIFIED STYLING
// (Charts with thicker bars, soft shadows, rounded containers)
// (Tables with background, borders, improved cell styling)
// NOTE: Logic and data remain unchanged.

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// ... YOUR ORIGINAL IMPORTS HERE ...

export default function TrainingReportsPage() {
  // ... ALL ORIGINAL STATE & LOGIC REMAIN UNCHANGED ...

  // Example unified chart container style
  const chartContainer = "bg-white p-6 rounded-2xl shadow border mb-6";

  // Example unified table container style
  const tableContainer = "bg-white p-6 rounded-2xl shadow border overflow-x-auto mb-6";

  // Example table styling
  const tableClass = "w-full border-collapse";
  const thClass = "border px-4 py-2 bg-gray-100 text-gray-700 font-medium";
  const tdClass = "border px-4 py-2 text-gray-800 bg-white";

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* ============================= */}
      {/*         GLOBAL DISTANCE       */}
      {/* ============================= */}

      <div className={chartContainer}>
        <h2 className="text-xl font-semibold mb-4">Общая дистанция по видам</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="run" radius={[6,6,0,0]} barSize={50} fill="#4F46E5" />
            <Bar dataKey="bike" radius={[6,6,0,0]} barSize={50} fill="#06B6D4" />
            <Bar dataKey="swim" radius={[6,6,0,0]} barSize={50} fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ============================= */}
      {/*         ENDURANCE ZONES      */}
      {/* ============================= */}

      <div className={tableContainer}>
        <h2 className="text-xl font-semibold mb-4">Зоны выносливости</h2>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Зона</th>
              <th className={thClass}>Мин время</th>
              <th className={thClass}>Макс время</th>
            </tr>
          </thead>
          <tbody>
            {zonesData.map((z, i) => (
              <tr key={i}>
                <td className={tdClass}>{z.zone}</td>
                <td className={tdClass}>{z.min}</td>
                <td className={tdClass}>{z.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================= */}
      {/*       ACTIVITY SUMMARY       */}
      {/* ============================= */}

      <div className={tableContainer}>
        <h2 className="text-xl font-semibold mb-4">Сводная активность</h2>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Дата</th>
              <th className={thClass}>Тип</th>
              <th className={thClass}>Дистанция</th>
              <th className={thClass}>Время</th>
            </tr>
          </thead>
          <tbody>
            {activityData.map((row, i) => (
              <tr key={i}>
                <td className={tdClass}>{row.date}</td>
                <td className={tdClass}>{row.type}</td>
                <td className={tdClass}>{row.distance}</td>
                <td className={tdClass}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================= */}
      {/*       ANY OTHER SECTIONS     */}
      {/*  Add here fully unchanged,   */}
      {/*     just wrap in styled divs */}
      {/* ============================= */}

    </div>
  );
}

// =============================
//     ORIGINAL DATA BELOW
// =============================

const distanceData = [
  { name: "Пн", run: 5, bike: 12, swim: 1 },
  { name: "Вт", run: 3, bike: 10, swim: 1 },
  { name: "Ср", run: 7, bike: 15, swim: 2 },
  { name: "Чт", run: 4, bike: 8, swim: 1 },
  { name: "Пт", run: 6, bike: 11, swim: 1 },
  { name: "Сб", run: 10, bike: 22, swim: 3 },
  { name: "Вс", run: 2, bike: 5, swim: 1 },
];

const zonesData = [
  { zone: "Z1", min: "10 мин", max: "20 мин" },
  { zone: "Z2", min: "20 мин", max: "35 мин" },
  { zone: "Z3", min: "5 мин", max: "15 мин" },
];

const activityData = [
  { date: "2025-06-01", type: "Бег", distance: "10 км", time: "55 мин" },
  { date: "2025-06-02", type: "Вело", distance: "25 км", time: "1:10" },
  { date: "2025-06-03", type: "Плавание", distance: "1 км", time: "30 мин" },
];
