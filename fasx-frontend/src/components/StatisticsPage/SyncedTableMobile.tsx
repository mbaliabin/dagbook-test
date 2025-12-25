import React, { useRef } from "react";

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

export const SyncedTable = ({
  rows,
  columns,
  index,
  formatAsTime = false,
  showBottomTotal = false,
  bottomRowName = "ИТОГО ЗА ПЕРИОД",
}: Props) => {
  const colWidth = 75;
  const leftWidth = 125;
  const totalWidth = 85;

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

  // --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ФОРМАТИРОВАНИЯ ---
  const formatValue = (v: number | string) => {
    if (v === "-" || v === "" || v === undefined || v === 0)
      return <span className="text-white/10">–</span>;
    if (v === "+") return <span className="text-blue-400 font-black">+</span>;

    // Если это НЕ время, округляем до 1 знака (умно: 25.1 или 25)
    if (!formatAsTime) {
      const num = Number(v);
      if (!isNaN(num)) {
        // Убираем хвосты и лишние нули
        const formatted = Number(num.toFixed(1));
        return <span className="text-white">{formatted}</span>;
      }
      return <span className="text-white">{v}</span>;
    }

    // Если это время
    if (typeof v === "number") {
      const h = Math.floor(v / 60);
      const m = v % 60;
      return <span className="text-white font-medium">{`${h}:${m.toString().padStart(2, "0")}`}</span>;
    }

    return <span className="text-white">{v}</span>;
  };

  const hHeader = "h-[32px]";
  const hRow = "h-[36px]";
  const hFooter = "h-[40px]";

  return (
    <div className="w-full relative overflow-hidden border-y border-white/[0.04] bg-[#0a0a0b]">

      {/* 1. ЛЕВАЯ ПАНЕЛЬ */}
      <div
        className="absolute left-0 top-0 bottom-0 z-30 pointer-events-none flex flex-col"
        style={{ width: leftWidth }}
      >
        <div className={`${hHeader} bg-[#111114]/98 backdrop-blur-md border-b border-white/[0.06] border-r border-white/10 px-4 flex items-center shadow-[5px_0_10px_rgba(0,0,0,0.5)]`}>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500">Параметр</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`${hRow} bg-[#111114]/98 backdrop-blur-md border-b border-white/[0.03] border-r border-white/10 px-4 flex items-center`}>
            {row.color && <div className="w-1.5 h-1.5 rounded-full mr-3 shrink-0" style={{ backgroundColor: row.color, boxShadow: `0 0 6px ${row.color}44` }} />}
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">{row.param}</span>
          </div>
        ))}
        {showBottomTotal && (
          <div className={`${hFooter} bg-[#151a24]/98 backdrop-blur-md border-t border-blue-500/20 border-r border-white/10 px-4 flex items-center`}>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500">{bottomRowName}</span>
          </div>
        )}
      </div>

      {/* 2. ПРАВАЯ ПАНЕЛЬ (Итого) */}
      <div
        className="absolute right-0 top-0 bottom-0 z-30 pointer-events-none flex flex-col"
        style={{ width: totalWidth }}
      >
        <div className={`${hHeader} bg-[#111114]/98 backdrop-blur-md border-b border-white/[0.06] border-l border-white/10 px-4 flex items-center justify-end shadow-[-5px_0_10px_rgba(0,0,0,0.5)]`}>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-500">Итого</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`${hRow} bg-[#111114]/98 backdrop-blur-md border-b border-white/[0.03] border-l border-white/10 px-4 flex items-center justify-end`}>
            <span className="text-[10px] font-black text-white">{row.total !== undefined ? formatValue(row.total) : formatValue("-")}</span>
          </div>
        ))}
        {showBottomTotal && (
          <div className={`${hFooter} bg-[#151a24]/98 backdrop-blur-md border-t border-blue-500/20 border-l border-white/10 px-4 flex items-center justify-end text-[10px] font-black text-blue-400`}>
             {/* Добавлено Number(...).toFixed(1) для защиты от хвостов в сумме */}
             {formatValue(Number(rows.reduce((sum, r) => sum + (Number(r.total) || 0), 0).toFixed(1)))}
          </div>
        )}
      </div>

      {/* 3. СКРОЛЛЯЩИЙСЯ КОНТЕНТ */}
      <div
        ref={scrollRefs[index]}
        className="overflow-x-auto scrollbar-hide touch-pan-x bg-[#0a0a0b]"
        onScroll={(e) => handleScroll(e, index)}
      >
        <div
          className="flex flex-col relative"
          style={{
            width: columns.length * colWidth + leftWidth + totalWidth,
            paddingLeft: leftWidth,
            paddingRight: totalWidth
          }}
        >
          {/* Header */}
          <div className={`flex bg-[#1a1a1e]/30 border-b border-white/[0.06] ${hHeader}`}>
            {columns.map((c, i) => (
              <div key={i} style={{ width: colWidth }} className="flex-shrink-0 flex items-center justify-center text-[7px] font-black uppercase tracking-[0.1em] text-gray-500 border-r border-white/[0.02]">
                {c}
              </div>
            ))}
          </div>
          {/* Body */}
          {rows.map((row, rIndex) => (
            <div key={rIndex} className={`flex border-b border-white/[0.03] ${hRow}`}>
              {row.months.map((v, i) => (
                <div key={i} style={{ width: colWidth }} className="flex-shrink-0 flex items-center justify-center text-[10px] border-r border-white/[0.02]">
                  {formatValue(v)}
                </div>
              ))}
            </div>
          ))}
          {/* Footer */}
          {showBottomTotal && (
            <div className={`flex bg-blue-500/[0.05] border-t border-blue-500/20 ${hFooter}`}>
              {columns.map((_, i) => (
                <div key={i} style={{ width: colWidth }} className="flex-shrink-0 flex items-center justify-center text-[10px] font-black text-blue-400 border-r border-white/[0.03]">
                  {/* Защита суммы в футере */}
                  {formatValue(Number(rows.reduce((sum, r) => sum + (Number(r.months[i]) || 0), 0).toFixed(1)))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};