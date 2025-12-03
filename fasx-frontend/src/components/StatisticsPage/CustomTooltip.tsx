// src/pages/StatisticsPage/components/CustomTooltip.tsx
import React from "react";

interface Props {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatHours?: boolean;
}

export const CustomTooltip: React.FC<Props> = ({ active, payload, label, formatHours }) => {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  const formatValue = (v: number) => {
    if (!formatHours) return `${v} км`;
    const h = Math.floor(v / 60);
    const m = v % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#111]/90 border border-[#2a2a2a] px-2.5 py-2 rounded-lg shadow-lg text-gray-200 text-xs w-48 backdrop-blur-sm">
      <p className="font-semibold mb-1 text-[13px]">{label}</p>
      <div className="space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="text-gray-400 max-w-[120px] truncate">{p.name}</span>
            <span className="font-mono" style={{ color: p.fill }}>
              {formatValue(p.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[#2a2a2a] my-1.5"></div>
      <div className="flex justify-between font-semibold text-[13px]">
        <span className="text-gray-300">Итого</span>
        <span className="font-mono text-blue-400">{formatValue(total)}</span>
      </div>
    </div>
  );
};