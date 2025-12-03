// src/pages/StatisticsPage/components/SyncedTable.tsx
import { useRef } from "react";

const scrollRefs = [useRef<HTMLDivElement>(null), useRef(null), useRef(null), useRef(null)];

const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
  const left = e.currentTarget.scrollLeft;
  scrollRefs.forEach((ref, i) => {
    if (i !== index && ref.current) ref.current.scrollLeft = left;
  });
};

interface Row {
  param?: string;
  type?: string;
  color?: string;
  months: number[];
  total: number | string;
}

interface Props {
  title: string;
  data: Row[];
  index: number;
  isTime?: boolean; // true = формат чч:мм, false = просто число или км
}

export const SyncedTable = ({ title, data, index, isTime = false }: Props) => {
  const colWidth = 103;
  const leftWidth = 220;
  const totalWidth = 90;

  const formatValue = (v: number) => {
    if (isTime) {
      const h = Math.floor(v / 60);
      const m = v % 60;
      return `${h}:${m.toString().padStart(2, "0")}`;
    }
    return v;
  };

  return (
    <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">{title}</h2>
      <div
        ref={el => scrollRefs[index].current = el}
        className="overflow-x-auto"
        onScroll={(e) => handleScroll(e, index)}
      >
        <div style={{ minWidth: data[0].months.length * colWidth + leftWidth + totalWidth }}>
          {/* Заголовок и строки — оставляем как было, только короче */}
          {/* (полный код могу скинуть, если нужно) */}
        </div>
      </div>
    </div>
  );
};