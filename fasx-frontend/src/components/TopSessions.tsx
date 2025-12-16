import React, { useMemo } from "react";
import {
  Bike,
  Footprints,
  Dumbbell,
  MapPin,
  Timer,
  Zap,
  Smile
} from "lucide-react";
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
  const base = "w-3 h-3";
  const lowerType = type.toLowerCase();
  if (lowerType.includes("run")) return <Footprints className={`${base} text-blue-500`} />;
  if (lowerType.includes("bike")) return <Bike className={`${base} text-blue-500`} />;
  if (lowerType.includes("strength")) return <Dumbbell className={`${base} text-blue-500`} />;
  return <MapPin className={`${base} text-blue-500`} />;
}

export default function TopSessions({ workouts }: Props) {
  const { longest, hardest, bestFeeling } = useMemo(() => {
    if (workouts.length === 0) return { longest: null, hardest: null, bestFeeling: null };

    const longest = [...workouts].sort((a, b) => b.duration - a.duration)[0];
    const hardest = [...workouts].sort((a, b) =>
      ((b.zone4Min || 0) + (b.zone5Min || 0)) - ((a.zone4Min || 0) + (a.zone5Min || 0))
    )[0];
    const bestFeeling = [...workouts]
      .filter(w => w.feeling !== undefined)
      .sort((a, b) => (b.feeling ?? 0) - (a.feeling ?? 0))[0];

    return { longest, hardest, bestFeeling };
  }, [workouts]);

  const renderCard = (
    label: string,
    workout: Workout | null,
    Icon: any,
    color: string,
    val: string,
    unit: string
  ) => {
    if (!workout) return null;

    return (
      <div className="relative bg-[#0f0f11] border border-gray-800/50 rounded-xl p-3 overflow-hidden group hover:border-gray-700 transition-all">
        {/* Компактный фоновый акцент */}
        <div
          className="absolute -right-2 -top-2 w-10 h-10 blur-[25px] opacity-[0.12]"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Верх: Иконка и Лейбл */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 rounded-lg bg-black/40 border border-gray-800">
              <Icon size={11} style={{ color }} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500">
              {label}
            </span>
          </div>

          {/* Низ: Название и Значение */}
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[11px] font-bold text-white truncate leading-none mb-1">
                {workout.name}
              </h3>
              <div className="flex items-center gap-1.5">
                {getTypeIcon(workout.type)}
                <span className="text-[9px] font-bold text-gray-600 uppercase">
                  {dayjs(workout.date).format("D MMM")}
                </span>
              </div>
            </div>

            <div className="text-right whitespace-nowrap">
              <span className="text-base font-black text-white leading-none tracking-tighter">
                {val}
              </span>
              <span className="text-[8px] font-black text-gray-600 ml-0.5 uppercase tracking-tighter">
                {unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (workouts.length === 0) return null;

  return (
    <div className="w-full">
      {/* Минималистичный заголовок */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-500/70 whitespace-nowrap">
          Highlights
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800/50 to-transparent" />
      </div>

      {/* Сетка в 3 колонки для экономии высоты */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {renderCard(
          "Длительность",
          longest,
          Timer,
          "#3b82f6",
          String(longest?.duration),
          "м"
        )}

        {renderCard(
          "Интенсивность",
          hardest,
          Zap,
          "#ef4444",
          String((hardest?.zone4Min || 0) + (hardest?.zone5Min || 0)),
          "z5"
        )}

        {renderCard(
          "Состояние",
          bestFeeling,
          Smile,
          "#a855f7",
          String(bestFeeling?.feeling || 0),
          "/10"
        )}
      </div>
    </div>
  );
}