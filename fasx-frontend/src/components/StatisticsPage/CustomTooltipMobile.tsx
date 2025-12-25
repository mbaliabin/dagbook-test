import React from "react";

const ZONE_COLORS: Record<string, string> = {
  I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444",
  "Лыжи, св.": "#4ade80", "Лыжи, кл.": "#22d3ee",
  "Роллеры, кл.": "#facc15", "Роллеры, кн.": "#fb923c",
  "Вело": "#3b82f6", "Бег": "#ef4444", "Сила": "#a78bfa"
};

interface Props {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatHours?: boolean;
}

export const CustomTooltipMobile: React.FC<Props> = ({ active, payload, label, formatHours }) => {
  if (!active || !payload || payload.length === 0) return null;

  const activePayload = payload.filter((p: any) => (p.value || 0) > 0);
  if (activePayload.length === 0) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  const formatValue = (v: number) => {
    if (!formatHours) return `${v} км`;
    const h = Math.floor(v / 60);
    const m = v % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Шапка шторки */}
      <div className="flex items-center justify-between mb-4 px-1 border-b border-white/[0.05] pb-2">
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Период</span>
          <h3 className="text-[11px] font-black text-white uppercase tracking-wider">{label}</h3>
        </div>
        <div className="text-right">
          <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest mb-0.5 block italic">
            {formatHours ? "Всего время" : "Всего дистанция"}
          </span>
          <span className="text-[12px] font-black text-white tabular-nums leading-none italic">
            {formatValue(total)}
          </span>
        </div>
      </div>

      {/* Список данных */}
      <div className={`${formatHours ? 'space-y-3.5' : 'space-y-3'} px-1`}>
        {activePayload.map((p: any, i: number) => {
          const name = p.name || p.dataKey;
          const zoneColor = ZONE_COLORS[name] || p.color || "#3b82f6";
          const percentage = ((p.value / total) * 100).toFixed(0);

          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {/* ТОЧКА: Рисуем только если это график зон (время) */}
                  {formatHours && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: zoneColor,
                        boxShadow: `0 0 8px ${zoneColor}66`
                      }}
                    />
                  )}

                  {/* НАЗВАНИЕ: Цветное для зон, просто серое/белое для дистанции */}
                  <span
                    className="text-[10px] font-black uppercase tracking-tight"
                    style={{
                      color: formatHours ? zoneColor : "#9ca3af" // #9ca3af это gray-400
                    }}
                  >
                    {name}
                  </span>

                  {/* ПРОЦЕНТ: Только для зон */}
                  {formatHours && (
                    <span className="text-[8px] font-bold text-white/20 tabular-nums">
                      {percentage}%
                    </span>
                  )}
                </div>

                {/* ЗНАЧЕНИЕ: Всегда белое и четкое */}
                <span className="text-[11px] font-black text-white tabular-nums">
                  {formatValue(p.value)}
                </span>
              </div>

              {/* ПРОГРЕСС-БАР: Только для зон */}
              {formatHours && (
                <div className="h-[2px] w-full bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: zoneColor,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};