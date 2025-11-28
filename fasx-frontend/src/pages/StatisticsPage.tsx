import React, { useRef } from "react";
import { LucideEye } from "lucide-react"; // Можно заменить на твою иконку

interface TableRow {
  param?: string;
  type?: string;
  months: number[];
  total?: number | string;
  color?: string;
}

interface TableSectionProps {
  table: {
    title: string;
    data: TableRow[];
  };
  index: number;
  colWidth?: number;
  leftWidth?: number;
  totalWidth?: number;
}

export const TableSection: React.FC<TableSectionProps> = ({
  table,
  index,
  colWidth = 80,
  leftWidth = 120,
  totalWidth = 80,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderValue = (val: number | string) => {
    if (typeof val === "number") {
      return table.title === "Выносливость" || table.title === "Тип активности"
        ? formatTime(val)
        : val;
    }
    return val;
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Итоговые значения по столбцам
  const totalsRow = React.useMemo(() => {
    if (table.title === "Параметры дня") return null;
    const monthSums = table.data[0]?.months.map((_, idx) =>
      table.data.reduce((sum, row) => sum + (row.months[idx] || 0), 0)
    );
    const totalSum = monthSums?.reduce((a, b) => a + b, 0) ?? 0;
    return { param: "Итого", months: monthSums, total: totalSum };
  }, [table]);

  return (
    <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-lg w-full">
      <h2 className="text-lg font-semibold text-gray-100 mb-2">{table.title}</h2>
      <div ref={containerRef} className="overflow-x-auto">
        <div
          className="flex-shrink-0"
          style={{
            minWidth: table.data[0]
              ? table.data[0].months.length * colWidth + leftWidth + totalWidth
              : leftWidth + totalWidth,
          }}
        >
          {/* HEADER */}
          <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
            <div
              className="p-2 font-medium sticky left-0 bg-[#222] z-20"
              style={{ width: leftWidth }}
            >
              {table.title === "Выносливость"
                ? "Зона"
                : table.title === "Тип активности"
                ? "Тип активности"
                : "Параметр"}
            </div>
            {table.data[0]?.months.map((_, idx) => (
              <div
                key={idx}
                className="p-2 text-center font-medium flex-none"
                style={{ width: colWidth }}
              >
                {`M${idx + 1}`}
              </div>
            ))}
            <div
              className="p-2 text-center font-medium bg-[#1f1f1f] flex-none"
              style={{ width: totalWidth }}
            >
              Всего
            </div>
          </div>

          {/* ROWS */}
          {table.data.map((row, idx) => {
            const rowTotal =
              typeof row.total === "number"
                ? row.total
                : typeof row.total === "string"
                ? row.total
                : row.months.reduce((a, b) => a + b, 0);

            return (
              <div
                key={idx}
                className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/50 transition"
              >
                {/* LEFT COLUMN */}
                <div
                  className="p-2 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2"
                  style={{ width: leftWidth }}
                >
                  {row.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                  )}
                  <button className="p-1 bg-[#333] rounded hover:bg-[#555] flex items-center">
                    <LucideEye className="w-4 h-4 text-white" />
                  </button>
                  <div className="truncate">{row.param || row.type}</div>
                </div>

                {/* MONTH VALUES */}
                {row.months.map((val, k) => (
                  <div
                    key={k}
                    className="p-2 text-center flex-none"
                    style={{ width: colWidth }}
                  >
                    {renderValue(val)}
                  </div>
                ))}

                {/* ROW TOTAL */}
                <div
                  className="p-2 text-center bg-[#1f1f1f] flex-none font-semibold"
                  style={{ width: totalWidth }}
                >
                  {renderValue(rowTotal)}
                </div>
              </div>
            );
          })}

          {/* TOTAL ROW */}
          {totalsRow && (
            <div className="flex border-t border-[#2a2a2a] bg-[#2a2a2a]/30 font-semibold text-gray-100">
              <div
                className="p-2 sticky left-0 bg-[#1a1a1a] z-10"
                style={{ width: leftWidth }}
              >
                {totalsRow.param}
              </div>
              {totalsRow.months.map((val, i) => (
                <div
                  key={i}
                  className="p-2 text-center"
                  style={{ width: colWidth }}
                >
                  {renderValue(val)}
                </div>
              ))}
              <div
                className="p-2 text-center bg-[#1f1f1f]"
                style={{ width: totalWidth }}
              >
                {renderValue(totalsRow.total)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
