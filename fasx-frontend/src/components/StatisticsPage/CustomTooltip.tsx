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

  // Считаем общую сумму, исключая нулевые значения для чистоты списка
  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  const activePayload = payload.filter(p => p.value > 0);

  const formatValue = (v: number) => {
    if (!formatHours) return `${v.toLocaleString()} км`;
    const h = Math.floor(v / 60);
    const m = v % 60;
    return `${h}ч ${m.toString().padStart(2, "0")}м`;
  };

  return (
    <div className="bg-[#0f0f11]/95 border border-white/10 p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md min-w-[200px]">
      {/* Заголовок - Месяц/Период */}
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 border-b border-white/5 pb-2">
        {label}
      </div>

      <div className="space-y-2">
        {activePayload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Цветной индикатор */}
              <div
                className="w-1.5 h-1.5 rounded-full shadow-sm"
                style={{ backgroundColor: p.fill }}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                {p.name}
              </span>
            </div>
            <span className="text-[11px] font-bold text-white font-mono">
              {formatValue(p.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Разделитель и Итого */}
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
          Всего
        </span>
        <span className="text-[12px] font-black text-white bg-blue-500/20 px-2 py-0.5 rounded-md">
          {formatValue(total)}
        </span>
      </div>
    </div>
  );
};