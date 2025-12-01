import { useRef, useEffect } from "react";

const scrollRefs = Array.from({ length: 4 }, () => useRef<HTMLDivElement>(null));

const syncScroll = (index: number) => (e: React.UIEvent<HTMLDivElement>) => {
  const left = e.currentTarget.scrollLeft;
  scrollRefs.forEach((ref, i) => {
    if (i !== index && ref.current) ref.current.scrollLeft = left;
  });
};

interface Row { param: string; color?: string; values: number[]; total: number | string }

interface Props {
  title: string;
  rows: Row[];
  unit?: "hours" | "km" | "count";
  index: number;
}

export const SyncedTable = ({ title, rows, unit = "hours", index }: Props) => {
  const format = (v: number) => {
    if (unit === "hours") return formatMinutes(v);
    if (unit === "km") return `${v}`;
    return v;
  };

  const colWidth = 100;
  const leftCol = 220;
  const totalCol = 90;

  return (
    <div className="bg-[#1a1a1d] rounded-2xl overflow-hidden shadow-xl">
      <h2 className="text-lg font-semibold p-5 border-b border-[#333]">{title}</h2>
      <div
        ref={el => scrollRefs[index].current = el}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600"
        onScroll={syncScroll(index)}
      >
        <div style={{ minWidth: rows[0].values.length * colWidth + leftCol + totalCol + 20 }}>
          {/* Header */}
          <div className="flex bg-[#222] text-sm font-medium">
            <div style={{ width: leftCol }} className="p-4 sticky left-0 bg-[#222] z-10">Параметр</div>
            {rows[0].values.map((_, i) => (
              <div key={i} style={{ width: colWidth }} className="p-4 text-center">{rows[0].values.length === 12 ? ["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"][i] : `П${i+1}`}</div>
            ))}
            <div style={{ width: totalCol }} className="p-4 text-center bg-[#1f1f1f]">Всего</div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={i} className="flex text-sm border-t border-[#333] hover:bg-[#252525]/50 transition">
              <div style={{ width: leftCol }} className="p-4 sticky left-0 bg-[#1a1a1d] flex items-center gap-2">
                {row.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                <span className="truncate">{row.param}</span>
              </div>
              {row.values.map((val, j) => (
                <div key={j} style={{ width: colWidth }} className="p-4 text-center">{format(val)}</div>
              ))}
              <div style={{ width: totalCol }} className="p-4 text-center bg-[#1f1f1f] font-medium text-blue-400">
                {row.total}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};