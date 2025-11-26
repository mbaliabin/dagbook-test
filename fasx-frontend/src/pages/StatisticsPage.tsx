import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

export default function StatsPage() {
  const [reportType, setReportType] = useState("Общий отчет");

  const allMonths = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
  ];

  const enduranceZones = [
    { zone: "I1", months: [35, 30, 28, 40, 42, 38], total: 213 },
    { zone: "I2", months: [50, 45, 48, 52, 50, 49], total: 294 },
    { zone: "I3", months: [25, 20, 22, 26, 28, 24], total: 145 },
    { zone: "I4", months: [15, 10, 12, 14, 16, 18], total: 85 },
    { zone: "I5", months: [5, 8, 7, 6, 9, 10], total: 45 },
  ];

  const movementTypes = [
    { type: "Лыжи, к. ст.", months: [14, 11, 12, 9, 13, 15], total: 74 },
    { type: "Лыжи, кл. ст.", months: [12, 10, 9, 11, 12, 14], total: 68 },
    { type: "Лыжероллеры, к. ст.", months: [9, 8, 7, 6, 10, 11], total: 51 },
    { type: "Лыжероллеры, кл. ст.", months: [7, 6, 8, 7, 9, 10], total: 47 },
    { type: "Бег", months: [20, 22, 18, 25, 28, 26], total: 139 },
    { type: "Велосипед", months: [32, 30, 34, 31, 33, 36], total: 196 },
  ];

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110] },
    { type: "Лыжероллеры, к. ст.", distance: [60, 50, 75, 45, 70, 55] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170] },
  ];

  const filteredMonths = allMonths.slice(0, 6);

  const filteredDistanceTypes = distanceByType.map((d) => {
    const slice = filteredMonths.length;
    const months = d.distance.slice(0, slice);
    return {
      type: d.type,
      months,
      total: months.reduce((a, b) => a + b, 0),
    };
  });

  const tableWidth = filteredMonths.length * 110 + 200;

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Статистика</h1>

      <div className="mb-6">
        <select
          className="bg-[#1f1f22] text-white px-3 py-2 rounded-lg"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option>Общий отчет</option>
          <option>Общая дистанция</option>
        </select>
      </div>

      {/* ========== ОБЩИЙ ОТЧЁТ ========== */}
      {reportType === "Общий отчет" && (
        <div className="flex flex-col gap-8">

          {/* ------ Диаграмма зон выносливости ------ */}
          <Block title="Зоны выносливости">
            <AutoStretchChart
              labels={filteredMonths}
              series={enduranceZones.map((z) => ({
                name: z.zone,
                data: z.months,
              }))}
            />
          </Block>

          {/* Таблица 1 */}
          <TableSection
            title="Зоны выносливости"
            data={enduranceZones}
            months={filteredMonths}
          />

          {/* ------ Типы активности ------ */}
          <Block title="Типы активности">
            <AutoStretchChart
              labels={filteredMonths}
              series={movementTypes.map((t) => ({
                name: t.type,
                data: t.months,
              }))}
            />
          </Block>

          {/* Таблица 2 */}
          <TableSection
            title="Типы активности"
            data={movementTypes}
            months={filteredMonths}
          />
        </div>
      )}

      {/* ========== ОТЧЁТ ОБЩЕЙ ДИСТАНЦИИ ========== */}
      {reportType === "Общая дистанция" && (
        <div className="flex flex-col gap-8">

          {/* Диаграмма общей дистанции */}
          <Block title="Общая дистанция по месяцам">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={filteredMonths.map((m, i) => ({
                  month: m,
                  distance: distanceByType.reduce(
                    (sum, t) => sum + (t.distance[i] || 0),
                    0
                  ),
                }))}
              >
                <XAxis dataKey="month" stroke="#bbb" />
                <Tooltip />
                <Bar dataKey="distance" />
              </BarChart>
            </ResponsiveContainer>
          </Block>

          {/* Таблица дистанций */}
          <TableSection
            title="Дистанция по видам тренировок"
            data={filteredDistanceTypes}
            months={filteredMonths}
          />
        </div>
      )}
    </div>
  );
}

/* =================================================================== */
/* ======================= ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ================== */
/* =================================================================== */

function Block({ title, children }) {
  return (
    <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl mb-4 font-semibold">{title}</h2>
      {children}
    </div>
  );
}

/* ======= РАСТЯГИВАЮЩАЯСЯ ДИАГРАММА BAR ======= */
function AutoStretchChart({ labels, series }) {
  const data = labels.map((label, index) => {
    const obj = { label };
    series.forEach((s) => (obj[s.name] = s.data[index]));
    return obj;
  });

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" stroke="#bbb" />
          <Tooltip />
          {series.map((s) => (
            <Bar key={s.name} dataKey={s.name} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ======= ТАБЛИЦЫ ======= */
function TableSection({ title, data, months }) {
  const leftWidth =
    title === "Типы активности" || title === "Дистанция по видам тренировок"
      ? 250
      : 160;

  const colWidth = 110;
  const totalCols = months.length + 1;
  const tableWidth = leftWidth + colWidth * totalCols;

  return (
    <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-lg overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="overflow-x-auto pb-2">
        <table
          className="border-collapse text-sm"
          style={{ width: tableWidth }}
        >
          <thead className="bg-[#242428] text-[#ccc]">
            <tr>
              <th
                style={{ width: leftWidth }}
                className="py-2 px-3 text-left"
              >
                Параметр
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  style={{ width: colWidth }}
                  className="py-2 px-3 text-center"
                >
                  {m}
                </th>
              ))}
              <th style={{ width: colWidth }} className="py-2 px-3 text-center">
                Всего
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row.type || row.zone}
                className="border-t border-[#2c2c2f]"
              >
                <td className="py-2 px-3">{row.type || row.zone}</td>

                {row.months.map((v, index) => (
                  <td className="text-center py-2 px-3" key={index}>
                    {v}
                  </td>
                ))}

                <td className="text-center py-2 px-3 font-semibold">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
