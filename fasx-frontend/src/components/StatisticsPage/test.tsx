import React, { useRef } from "react";

export default function WeekTable() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const colWidth = 80;
  const leftWidth = 150;
  const totalWidth = 100;

  // Создаем 48 недель с метками "1 2025" до "48 2025"
  const weeks = Array.from({ length: 48 }, (_, i) => `${i + 1} 2025`);

  // Создаем 5 строк с разными названиями и случайными данными
  const rows = [
    { name: "test1", data: Array.from({ length: 48 }, () => Math.floor(Math.random() * 10)) },
    { name: "test2", data: Array.from({ length: 48 }, () => Math.floor(Math.random() * 10)) },
    { name: "test3", data: Array.from({ length: 48 }, () => Math.floor(Math.random() * 10)) },
    { name: "test4", data: Array.from({ length: 48 }, () => Math.floor(Math.random() * 10)) },
    { name: "test5", data: Array.from({ length: 48 }, () => Math.floor(Math.random() * 10)) },
  ];

  // Вычисляем сумму по каждой строке
  rows.forEach(row => {
    row.total = row.data.reduce((a, b) => a + b, 0);
  });

  const tableWidth = leftWidth + weeks.length * colWidth + totalWidth;

  return (
    <div className="p-5 bg-[#1a1a1d] rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Таблица недель</h2>
      <div
        ref={scrollRef}
        className="overflow-x-auto border border-[#2a2a2a]"
      >
        <div className="flex-shrink-0" style={{ minWidth: tableWidth }}>
          {/* HEADER */}
          <div className="flex bg-[#222] border-b border-[#2a2a2a]">
            <div
              className="p-3 font-medium sticky left-0 bg-[#222] z-10"
              style={{ width: leftWidth }}
            >
              Название
            </div>
            {weeks.map((w, i) => (
              <div
                key={i}
                className="p-3 text-center flex-none font-medium border-l border-[#2a2a2a]"
                style={{ width: colWidth }}
              >
                {w}
              </div>
            ))}
            <div
              className="p-3 text-center font-medium bg-[#1f1f1f] flex-none border-l border-[#2a2a2a]"
              style={{ width: totalWidth }}
            >
              Итого
            </div>
          </div>

          {/* ROWS */}
          {rows.map((row, i) => (
            <div key={i} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
              <div
                className="p-3 sticky left-0 bg-[#1a1a1a] z-10"
                style={{ width: leftWidth }}
              >
                {row.name}
              </div>
              {row.data.map((val, j) => (
                <div
                  key={j}
                  className="p-3 text-center flex-none border-l border-[#2a2a2a]"
                  style={{ width: colWidth }}
                >
                  {val}
                </div>
              ))}
              <div
                className="p-3 text-center bg-[#1f1f1f] flex-none border-l border-[#2a2a2a]"
                style={{ width: totalWidth }}
              >
                {row.total}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
