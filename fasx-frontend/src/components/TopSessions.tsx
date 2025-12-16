import React, { useMemo } from "react";
import { Bike, Footprints, Dumbbell, MapPin, Timer, Zap, Smile, Calendar } from "lucide-react";
import dayjs from "dayjs";

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
  feeling?: number;
}

interface Props {
  workouts: Workout[];
}

function getTypeIcon(type: string) {
  const base = "w-5 h-5 transition-colors";
  if (type.toLowerCase().includes("run")) return <Footprints className={`${base} text-blue-400`} />;
  if (type.toLowerCase().includes("bike")) return <Bike className={`${base} text-blue-400`} />;
  if (type.toLowerCase().includes("strength")) return <Dumbbell className={`${base} text-blue-400`} />;
  return <MapPin className={`${base} text-blue-400`} />;
}

export default function TopSessions({ workouts }: Props) {
  const { longest, hardest, bestFeeling } = useMemo(() => {
    if (workouts.length === 0) return { longest: null, hardest: null, bestFeeling: null };

    const longest = [...workouts].sort((a, b) => b.duration - a.duration)[0];

    const hardest = [...workouts].sort((a, b) => {
      const bMax = Math.max(b.zone4Min ?? 0, b.zone5Min ?? 0);
      const aMax = Math.max(a.zone4Min ?? 0, a.zone5Min ?? 0);
      return bMax - aMax;
    })[0];

    const bestFeeling = [...workouts]
      .filter(w => w.feeling !== undefined)
      .sort((a, b) => (b.feeling ?? 0) - (a.feeling ?? 0))[0];

    return { longest, hardest, bestFeeling };
  }, [workouts]);

  const renderCard = (
    label: string,
    workout: Workout | null,
    Icon: any,
    accentColor: string
  ) => {
    if (!workout) return null;

    return (
      <div className="group relative overflow-hidden bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 transition-all hover:border-gray-700">
        {/* Декоративная линия сбоку */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }} />

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={12} style={{ color: accentColor }} className="opacity-80" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
                {label}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-[140px] leading-tight">
                {workout.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                <Calendar size={10} />
                <span className="text-[9px] font-medium uppercase tracking-tighter">
                  {dayjs(workout.date).format("D MMM YYYY")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="bg-[#1a1a1d] p-1.5 rounded-lg border border-gray-800">
              {getTypeIcon(workout.type)}
            </div>
            <div className="text-right">
               <span className="text-xs font-black text-white">{workout.duration}</span>
               <span className="text-[8px] uppercase text-gray-500 ml-0.5">min</span>
            </div>
          </div>
        </div>

        {/* Прогресс-бар интенсивности или настроения (декоративный) */}
        <div className="mt-3 flex gap-4 items-center border-t border-gray-800/50 pt-2">
           <div className="flex items-center gap-1">
              <Zap size={10} className="text-orange-500" />
              <span className="text-[9px] font-bold text-gray-400 uppercase">Z5: {workout.zone5Min || 0}m</span>
           </div>
           <div className="flex items-center gap-1">
              <Smile size={10} className="text-pink-500" />
              <span className="text-[9px] font-bold text-gray-400 uppercase">Feel: {workout.feeling || 0}/10</span>
           </div>
        </div>
      </div>
    );
  };

  if (workouts.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-4">Top Sessions</h2>
        <div className="h-32 flex items-center justify-center border border-dashed border-gray-800 rounded-xl">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Нет данных для анализа</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-1">
            Top Sessions
          </h2>
          <p className="text-lg font-bold text-white tracking-tight leading-none">Рекорды периода</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {renderCard("Самая долгая", longest, Timer, "#3b82f6")}
        {renderCard("Интенсивная", hardest, Zap, "#ef4444")}
        {renderCard("Лучшее самочувствие", bestFeeling, Smile, "#a855f7")}
      </div>
    </div>
  );
}