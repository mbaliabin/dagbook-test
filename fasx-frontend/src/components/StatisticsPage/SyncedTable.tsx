import React, { useRef, useEffect } from "react";

interface Row {
  param?: string;
  type?: string;
  color?: string;
  months: (number | string)[];
  total: number | string;
}

interface Props {
  rows: Row[];
  columns: string[];
  index: number;
  formatAsTime?: boolean;
  showBottomTotal?: boolean;
  bottomRowName?: string;
}

// 1. ВЫНОСИМ РЕФЫ НАРУЖУ (Shared State для синхронизации)
// Либо создаем их в родительском компоненте и передаем списком.
// Но самый простой и надежный способ для "Synced" таблиц - использовать один общий обработчик.
const tableRefs: (HTMLDivElement | null)[] = [null, null, null, null];

export const SyncedTable = ({
  rows,
  columns,
  index,
  formatAsTime = false,
  showBottomTotal = false,
  bottomRowName = "ИТОГО ЗА ПЕРИОД",
}: Props) => {
  const colWidth = 100;
  const leftWidth = 220;
  const totalWidth = 110;

  const containerRef = useRef<HTMLDivElement>(null);

  // Сохраняем ссылку на текущую таблицу в общий массив при монтировании
  useEffect(() => {
    tableRefs[index] = containerRef.current;
    return () => {
      tableRefs[index] = null;
    };
  }, [index]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    tableRefs.forEach((ref, idx) => {
      // Синхронизируем все таблицы КРОМЕ той, которую скроллим сейчас
      if (idx !== index && ref) {
        if (ref.scrollLeft !== scrollLeft) {
          ref.scrollLeft = scrollLeft;
        }
      }
    });
  };

  const formatValue = (v: number | string) => {
    if (v === "-" || v === "" || v === undefined || v === 0) return <span className="text-white/10">–</span>;

    if (!formatAsTime) {
      const num = Number(v);
      if (!isNaN(num)) {
        return <span className="text-white">{Number(num.toFixed(1))}</span>;
      }
      return <span className="text-white">{v}</span>;
    }

    if (typeof v === "number") {
      const h = Math.floor(v / 60);
      const m = v % 60;
      return <span className="text-white">{`${h}:${m.toString().padStart(2, "0")}`}</span>;
    }
    return <span className="text-white">{v}</span>;
  };

  const columnTotals = columns.map((_, colIndex) => {
    const sum = rows.reduce(
      (acc, row) =>
        acc + (typeof row.months[colIndex] === "number" ? (row.months[colIndex] as number) : 0),
      0
    );
    return Number(sum.toFixed(1));
  });

  const grandTotal = Number(columnTotals.reduce((s, v) => s + v, 0).toFixed(1));

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide select-none"
        onScroll={handleScroll}
      >
        <div style={{ minWidth: columns.length * colWidth + leftWidth + totalWidth }}>
          {/* HEADER ROW */}
          <div className="flex bg-white/[0.02] border-b border-white/[0.05]">
            <div
              style={{
                width: leftWidth,
                position: "sticky",
                left: 0,
                backgroundColor: "#131316",
                zIndex: 10,
              }}
              className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500"
            >
              Параметр
            </div>
            {columns.map((c, i) => (
              <div
                key={i}
                style={{ width: colWidth }}
                className="px-2 py-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-500"
              >
                {c}
              </div>
            ))}
            <div
              style={{ width: totalWidth }}
              className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-blue-500"
            >
              Итого
            </div>
          </div>

          {/* DATA ROWS */}
          {rows.map((row, rIndex) => (
            <div
              key={rIndex}
              className="flex items-center border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group"
            >
              <div
                style={{
                  width: leftWidth,
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#131316",
                  zIndex: 9,
                }}
                className="px-6 py-4 flex items-center group-hover:bg-[#1a1a1e] transition-colors"
              >
                {row.color && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: row.color }}
                  />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
                   {row.param}
                </span>
              </div>

              {row.months.map((v, i) => (
                <div
                  key={i}
                  style={{ width: colWidth }}
                  className="px-2 py-4 text-center text-[10px] font-bold"
                >
                  {formatValue(v)}
                </div>
              ))}

              <div
                style={{ width: totalWidth }}
                className="px-6 py-4 text-right text-[10px] font-black group-hover:text-blue-400 transition-colors"
              >
                {row.total !== undefined ? formatValue(row.total) : formatValue("-")}
              </div>
            </div>
          ))}

          {/* FOOTER TOTAL ROW */}
          {showBottomTotal && (
            <div className="flex items-center bg-blue-500/[0.03] mt-px">
              <div
                style={{
                  width: leftWidth,
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#131316",
                  zIndex: 10,
                }}
                className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 border-t border-blue-500/20"
              >
                {bottomRowName}
              </div>
              {columnTotals.map((v, i) => (
                <div
                  key={i}
                  style={{ width: colWidth }}
                  className="px-2 py-5 text-center text-[10px] font-black text-blue-400/80 border-t border-blue-500/20"
                >
                  {formatValue(v)}
                </div>
              ))}
              <div
                style={{ width: totalWidth }}
                className="px-6 py-5 text-right text-[11px] font-black text-blue-500 border-t border-blue-500/20 bg-blue-500/5"
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