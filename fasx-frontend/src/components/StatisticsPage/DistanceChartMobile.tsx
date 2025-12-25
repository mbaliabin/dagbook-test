import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { CustomTooltipMobile } from "./CustomTooltipMobile";

const distanceColors: Record<string, string> = {
  "Лыжи, св.": "#4ade80",
  "Лыжи, кл.": "#22d3ee",
  "Роллеры, кл.": "#facc15",
  "Роллеры, кн.": "#fb923c",
  "Вело": "#3b82f6",
  "Бег": "#ef4444",
};

const nonDistanceTypes = ["Сила", "ОФП", "Растяжка", "Йога", "Другое"];

export const DistanceChart = ({ data, types }: any) => {
  const [activePayload, setActivePayload] = useState<any>(null);

  // Фильтруем только типы, у которых есть дистанция
  const distanceOnlyTypes = types.filter((t: string) => !nonDistanceTypes.includes(t));

  const handleInteraction = (state: any) => {
    if (state && state.activePayload) {
      // Оставляем только те данные в тултипе, которые относятся к дистанционным видам
      const filtered = state.activePayload.filter((p: any) => !nonDistanceTypes.includes(p.name));
      if (filtered.length > 0) {
        setActivePayload({
          payload: filtered,
          label: state.activeLabel
        });
      }
    }
  };

  return (
    <div className="w-full h-full select-none relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="25%"
          onMouseMove={handleInteraction}
          onTouchMove={handleInteraction}
          onClick={handleInteraction}
        >
          <defs>
            {distanceOnlyTypes.map((type: string, index: number) => (
              <linearGradient key={`grad-dist-${index}`} id={`grad-dist-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={distanceColors[type] || "#555"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={distanceColors[type] || "#555"} stopOpacity={0.3}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 8, fontWeight: 800 }}
            dy={10}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={() => null} />

          {distanceOnlyTypes.map((type: string, index: number) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="dist"
              fill={`url(#grad-dist-${index})`}
              // Скругление только у самого верхнего бара в стеке
              radius={index === distanceOnlyTypes.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* ФОН ДЛЯ ЗАКРЫТИЯ ПО ТАПУ МИМО */}
      {activePayload && (
        <div
          className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-[2px]"
          onClick={() => setActivePayload(null)}
        />
      )}

      {/* КОМПАКТНАЯ ШТОРКА ДЛЯ ДИСТАНЦИИ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[100] px-6 pb-10 pt-4
          bg-[#0d0d0f]/95 backdrop-blur-3xl border-t border-white/[0.08] rounded-t-[24px]
          transition-all duration-500 ease-[cubic-bezier(0.33, 1, 0.68, 1)]
          shadow-[0_-15px_40px_rgba(0,0,0,0.6)]
          ${activePayload ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 invisible'}`}
      >
        {/* Хэндл индикатор */}
        <div
          className="w-8 h-1 bg-white/10 rounded-full mx-auto mb-4"
          onClick={() => setActivePayload(null)}
        />

        <div className="max-w-md mx-auto max-h-[60vh] overflow-y-auto scrollbar-hide">
          <CustomTooltipMobile
            active={!!activePayload}
            payload={activePayload?.payload}
            label={activePayload?.label}
            formatHours={false} // Здесь KM вместо времени
          />
        </div>
      </div>
    </div>
  );
};