import React, { useMemo } from "react";
import {
  Bike,
  Footprints,
  Dumbbell,
  MapPin,
  Timer,
  Zap,
  Smile,
  ChevronRight,
  Calendar
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
  const base = "w-4 h-4";
  const lowerType = type.toLowerCase();
  if (lowerType.includes("run")) return <Footprints className={`${base} text-blue-400`} />;
  if (lowerType.includes("bike")) return <Bike className={`${base} text-blue-400`} />;
  if (lowerType.includes("strength")) return <Dumbbell className={`${base} text-blue-400`} />;
  return <MapPin className={`${base} text-blue-400`} />;
}

export default function TopSessions({ workouts }: Props) {
  // Расширенная логика поиска лучших сессий
  const { longest, hardest, bestFeeling } = useMemo(() => {
    if (workouts.length === 0) return { longest: null, hardest: null, bestFeeling: null };

    const longest = [...workouts].sort((a, b) => b.duration - a.duration)[0];

    // Считаем интенсивность по сумме в 4 и 5 зонах
    const hardest = [...workouts].sort((a, b) => {
      const bIntensity = (b.zone4Min ?? 0) + (b.zone5Min ?? 0);
      const aIntensity = (a.zone4Min ?? 0) + (a.zone5Min ?? 0);
      return bIntensity - aIntensity;
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
    color: string,
    mainValue: string,
    unit: string
  ) => {
    if (!workout) return null;

    return (
      <div className="group relative bg-[#111113] border border-gray-800/40 rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:border-gray-700/60 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        {/* Фоновое неоновое свечение */}
        <div
          className="absolute -right-6 -top-6 w-20 h-20 blur-[45px] opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.15]"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Верхняя часть: Категория и Значение */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0a0a0b] border border-gray-800 shadow-inner group-hover:border-gray-700 transition-colors">
                <Icon size={14} style={{ color }} />
              </div>
              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-1.5">
                  {label}
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                  {workout.name}
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end">
               <div className="flex items-baseline gap-0.5">
                 <span className="text-xl font-black text-white leading-none tracking-tighter">
                   {mainValue}
                 </span>
                 <span className="text-[9px] font-black text-gray-600 uppercase">
                   {unit}
                 </span>
               </div>
            </div>
          </div>

          {/* Нижняя часть: Инфо-бар */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar size={10} className="text-gray-600" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {dayjs(workout.date).format("D MMM")}
                </span>
              </div>

              <div className="h-1 w-1 rounded-full bg-gray-800" />

              <div className="flex items-center gap-1.5">
                <div className="bg-blue-500/10 p-0.5 rounded">
                  {getTypeIcon(workout.type)}
                </div>
                <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-widest">
                  {workout.type}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0a0a0b] border border-gray-800 text-gray-600 group-hover:text-white group-hover:border-gray-700 transition-all">
              <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (workouts.length === 0) {
    return (
      <div className="w-full p-8 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center bg-[#0a0a0b]/50">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mb-3">
          <Zap size={18} className="text-gray-700" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Нет данных за период</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Стилизованный заголовок секции */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/90 whitespace-nowrap">
          Top Sessions
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {renderCard(
          "Самая долгая",
          longest,
          Timer,
          "#3b82f6",
          String(longest?.duration),
          "мин"
        )}

        {renderCard(
          "Интенсивная",
          hardest,
          Zap,
          "#ef4444",
          String((hardest?.zone4Min || 0) + (hardest?.zone5Min || 0)),
          "Z4/5"
        )}

        {renderCard(
          "Лучший настрой",
          bestFeeling,
          Smile,
          "#a855f7",
          String(bestFeeling?.feeling || 0),
          "/ 10"
        )}
      </div>
    </div>
  );
}