import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface Workout {
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

interface Props {
  workouts: Workout[];
}

export default function IntensityZonesMobile({ workouts }: Props) {
  const totals = useMemo(() => {
    const sums = [0, 0, 0, 0, 0];
    for (const workout of workouts) {
      sums[0] += workout.zone1Min ?? 0;
      sums[1] += workout.zone2Min ?? 0;
      sums[2] += workout.zone3Min ?? 0;
      sums[3] += workout.zone4Min ?? 0;
      sums[4] += workout.zone5Min ?? 0;
    }
    const totalMinutes = sums.reduce((a, b) => a + b, 0);
    const percent = totalMinutes
      ? sums.map((min) => Math.round((min / totalMinutes) * 100))
      : [0, 0, 0, 0, 0];

    const format = (min: number) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      // Более компактный формат для мобилки
      if (h > 0) return `${h}ч ${m}м`;
      return `${m}м`;
    };

    // Цвета зон: Z1 (Green), Z2 (Yellow), Z3 (Orange), Z4 (Red), Z5 (Purple/Dark Red)
    const zoneColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#991b1b'];
    const zoneLabels = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

    return sums.map((min, idx) => ({
      label: zoneLabels[idx],
      color: zoneColors[idx],
      time: format(min),
      percent: percent[idx],
    }));
  }, [workouts]);

  return (
    <div className="w-full font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Activity size={12} className="text-blue-500" />
        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Пульсовые зоны</h2>
      </div>

      {/* CARD */}
      <div className="bg-[#131316] border border-white/[0.05] rounded-[20px] p-5 shadow-xl">
        <div className="space-y-4">
          {totals.map((zone, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">

              {/* Info Row */}
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: zone.color,
                      boxShadow: `0 0 6px ${zone.color}66`
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Зона {idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black text-white tabular-nums">
                    {zone.time}
                  </span>
                  <div className="w-[1px] h-2 bg-white/5" />
                  <span className="text-[9px] font-bold text-gray-600 tabular-nums w-7 text-right">
                    {zone.percent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${zone.percent}%`,
                    backgroundColor: zone.color,
                    boxShadow: `0 0 8px ${zone.color}33`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Footer Hint */}
        <div className="mt-5 pt-4 border-t border-white/[0.03] flex justify-between items-center">
            <span className="text-[8px] font-bold text-gray-700 uppercase tracking-[0.1em]">Распределение нагрузки</span>
            <div className="flex gap-1">
                {totals.map((z, i) => (
                    <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: z.color, opacity: 0.3 }} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}