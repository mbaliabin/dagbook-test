// src/pages/StatisticsPage/components/SyncedTable.tsx
import { useRef } from "react";

interface Row {
  param?: string;
  type?: string;
  color?: string;
  months: number[];
  total: number | string;
}

interface Props {
  title: string;
  rows: Row[];
  columns: string[];
  index: number;
  formatAsTime?: boolean;
  showBottomTotal?: boolean; // ← Показывать итоговую строку вниз
}

export const SyncedTable = ({
  title,
  rows,
  columns,
  index,
  formatAsTime = false,
  showBottomTotal = false,
}: Props) => {

  const colWidth = 103;
  const leftWidth = 220;
  const totalWidth = 90;

  // ВАЖНО: refs должны быть внутри компонента
  const scrollRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, i: number) => {
    const left = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, idx) => {
      if (idx !== i && ref.current) {
        ref.current.scrollLeft = left;
      }
    });
  };

  const formatValue = (v: number | string) => {
    if (!formatAsTime || typeof v !== "number") return v;
    const h = Math.floor(v / 60);
    const m = v % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Итоги по месячным столбцам
  const columnTotals = columns.map((_, colIndex) =>
    rows.reduce(
      (sum, row) =>
        sum + (typeof row.months[colIndex] === "number" ? row.months[colIndex] : 0),
      0
    )
  );

  // Итоговый total справа
  const grandTotal = columnTotals.reduce((s, v) => s + v, 0);

  return (
    <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg mt-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">{title}</h2>

      <div
        ref={scrollRefs[index]}
        className="overflow-x-auto"
        onScroll={(e) => handleScroll(e, index)}
      >
        <div
          style={{
            minWidth: columns.length * colWidth + leftWidth + totalWidth,
          }}
        >

          {/* Заголовок */}
          <div className="flex text-gray-300 font-semibold">
            <div style={{ width: leftWidth }} className="px-2">
              Параметр
            </div>

            {columns.map((c, i) => (
              <div key={i} style={{ width: colWidth }} className="px-2 text-center">
                {c}
              </div>
            ))}

            <div style={{ width: totalWidth }} className="px-2 text-center">
              Итого
            </div>
          </div>

          {/* Строки */}
          {rows.map((row, rIndex) => (
            <div
              key={rIndex}
              className="flex items-center border-t border-gray-700 py-2"
            >
              <div
                style={{ width: leftWidth }}
                className="px-2 text-gray-200 flex items-center"
              >
                {row.color && (
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: row.color }}
                  />
                )}
                {row.param}
              </div>

              {row.months.map((v, i) => (
                <div
                  key={i}
                  style={{ width: colWidth }}
                  className="px-2 text-center text-gray-300"
                >
                  {formatValue(v)}
                </div>
              ))}

              <div
                style={{ width: totalWidth }}
                className="px-2 text-center font-semibold text-gray-100"
              >
                {formatValue(row.total)}
              </div>
            </div>
          ))}

          {/* Итоговая строка – включается только когда нужно */}
          {showBottomTotal && (
            <div className="flex items-center border-t-2 border-gray-500 py-3 bg-[#222226] mt-2">
              <div style={{ width: leftWidth }} className="px-2 font-bold text-gray-100">
                Итого по месяцам
              </div>

              {columnTotals.map((v, i) => (
                <div
                  key={i}
                  style={{ width: colWidth }}
                  className="px-2 text-center font-semibold text-gray-200"
                >
                  {formatValue(v)}
                </div>
              ))}

              <div
                style={{ width: totalWidth }}
                className="px-2 text-center font-bold text-gray-100"
              >
                {formatValue(grandTotal)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
