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

export default function IntensityZones({ workouts }: Props) {
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
      return `${h > 0 ? `${h}h ` : ''}${m}m`;
    };

    const zoneColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#7f1d1d'];
    const zoneLabels = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];

    return sums.map((min, idx) => ({
      label: zoneLabels[idx],
      color: zoneColors[idx],
      time: format(min),
      percent: percent[idx],
    }));
  }, [workouts]);

  return (
    <div className="w-full font-sans text-white">
      {/* Заголовок */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className="w-8 h-8 bg-[#0f0f11] border border-gray-800/60 rounded-xl flex items-center justify-center">
          <Activity size={14} className="text-blue-500" />
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Интенсивность</h2>
      </div>

      {/* КАРТОЧКА (БЕЗ ЭФФЕКТА БУТЕРБРОДА) */}
      <div className="bg-[#0a0a0b] border border-gray-800/40 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
        {/* Индикатор связи — вертикальная линия слева */}
        <div className="absolute left-6 top-10 bottom-10 w-[1px] bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 opacity-30" />

        <div className="space-y-4 relative z-10">
          {totals.map((zone, idx) => (
            <div key={idx} className="flex items-center gap-4">

              {/* Номер зоны с точкой цвета */}
              <div className="flex items-center gap-3 min-w-[45px]">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: zone.color, boxShadow: `0 0 8px ${zone.color}66` }}
                />
                <span className="text-[11px] font-black text-gray-400">{zone.label}</span>
              </div>

              {/* Прогресс-бар и Данные */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-end leading-none">
                   {/* Пустое место для баланса */}
                   <div />
                   <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-gray-200 tabular-nums">{zone.time}</span>
                      <span className="text-[10px] font-black text-gray-600 tabular-nums w-8 text-right">{zone.percent}%</span>
                   </div>
                </div>

                {/* Тонкая технологичная полоска */}
                <div className="h-[3px] w-full bg-gray-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${zone.percent}%`,
                      backgroundColor: zone.color,
                      boxShadow: `0 0 10px ${zone.color}44`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Декоративный элемент в углу */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full" />
      </div>
    </div>
  );
}