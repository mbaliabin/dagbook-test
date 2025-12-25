import React, { useMemo, useState } from "react";
import {
  Bike, Footprints, Dumbbell, MapPin, Timer,
  Zap, Smile, X, Calendar, Activity, Clock, Navigation, BrainCircuit, ChevronRight
} from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import dayjs from "dayjs";
import 'dayjs/locale/ru';

dayjs.locale('ru');

// --- Кастомная иконка Лыжника ---
const SkiIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="m16 21-4-4-4 4" />
    <path d="M4.5 7L12 14.5L19.5 7" />
    <circle cx="12" cy="5" r="1" />
    <path d="M12 6v6" />
    <path d="M6 22l12-12" />
    <path d="M18 22L6 10" />
  </svg>
);

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  distance?: number | null;
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

function getTypeInfo(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("ski") || lowerType.includes("лыжи")) return { icon: SkiIcon, label: "Лыжи", color: "#06b6d4" };
  if (lowerType.includes("run") || lowerType.includes("бег")) return { icon: Footprints, label: "Бег", color: "#3b82f6" };
  if (lowerType.includes("strength") || lowerType.includes("силовая")) return { icon: Dumbbell, label: "Силовая", color: "#f59e0b" };
  if (lowerType.includes("bike") || lowerType.includes("вело")) return { icon: Bike, label: "Велосипед", color: "#10b981" };
  return { icon: MapPin, label: "Тренировка", color: "#6366f1" };
}

export default function TopSessionMobile({ workouts }: Props) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const { longest, hardest, bestFeeling } = useMemo(() => {
    if (workouts.length === 0) return { longest: null, hardest: null, bestFeeling: null };
    const calcIntensity = (w: Workout) => (w.zone3Min || 0) * 1 + (w.zone4Min || 0) * 2 + (w.zone5Min || 0) * 4;
    return {
      longest: [...workouts].sort((a, b) => b.duration - a.duration)[0],
      hardest: [...workouts].sort((a, b) => calcIntensity(b) - calcIntensity(a))[0],
      bestFeeling: [...workouts].filter(w => w.feeling !== undefined).sort((a, b) => (b.feeling ?? 0) - (a.feeling ?? 0))[0]
    };
  }, [workouts]);

  const getAiAdvice = (w: Workout) => {
    if ((w.zone5Min || 0) > 10) return "Высокая нагрузка. Завтра — легкая Z1.";
    if ((w.zone4Min || 0) > 30) return "Мощная работа! Ваш ПАНО прогрессирует.";
    if ((w.zone2Min || 0) > (w.duration * 0.7)) return "Отличная база. Крепкое сердце — залог успеха.";
    return "Стабильный результат. Вы в отличной форме!";
  };

  const renderMobileCard = (label: string, workout: Workout | null, Icon: any, color: string, val: string, unit: string) => {
    if (!workout) return null;
    const info = getTypeInfo(workout.type);
    return (
      <button
        onClick={() => setSelectedWorkout(workout)}
        className="relative w-full text-left bg-[#141417] border border-white/[0.05] rounded-[20px] p-4 flex items-center justify-between active:scale-[0.97] transition-all"
      >
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.05] text-white">
                <Icon size={18} color={color} />
            </div>
            <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-0.5">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-white tracking-tight">{val}</span>
                    <span className="text-[9px] font-bold text-gray-600 uppercase">{unit}</span>
                </div>
            </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400">{info.label}</span>
            <span className="text-[9px] text-gray-600 font-medium">{dayjs(workout.date).format("D MMM")}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full font-sans px-2">
      {/* Мобильный заголовок с кнопкой */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Итоги</h2>
        </div>

        <button
          onClick={() => window.location.href = '/calendar'}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 active:bg-blue-500/20"
        >
          <Calendar size={12} className="text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Календарь</span>
          <ChevronRight size={10} className="text-blue-400" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {renderMobileCard("Время", longest, Timer, "#3b82f6", String(longest?.duration), "мин")}
        {renderMobileCard("Нагрузка", hardest, Zap, "#ef4444", String(Math.round((hardest?.zone3Min || 0) + (hardest?.zone4Min || 0) * 2 + (hardest?.zone5Min || 0) * 4)), "load")}
        {renderMobileCard("Тонус", bestFeeling, Smile, "#a855f7", String(bestFeeling?.feeling || 0), "/ 10")}
      </div>

      {/* Модалка (адаптированная под мобилки) */}
      <Transition show={!!selectedWorkout} as={React.Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setSelectedWorkout(null)}>
          <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center">
              <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="translate-y-full" enterTo="translate-y-0" leave="ease-in duration-200" leaveFrom="translate-y-0" leaveTo="translate-y-full">
                <Dialog.Panel className="relative bg-[#0a0a0b] border-t border-white/10 w-full rounded-t-[32px] overflow-hidden shadow-2xl pb-10">
                  {selectedWorkout && (
                    <div className="flex flex-col">
                      <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    {React.createElement(getTypeInfo(selectedWorkout.type).icon, { size: 24, color: getTypeInfo(selectedWorkout.type).color })}
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">
                                        {getTypeInfo(selectedWorkout.type).label}
                                    </span>
                                    <h2 className="text-xl font-black text-white uppercase italic leading-none">{selectedWorkout.name || "Тренировка"}</h2>
                                </div>
                            </div>
                            <button onClick={() => setSelectedWorkout(null)} className="p-2 text-gray-500"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { label: "КМ", val: selectedWorkout.distance || "0", icon: Navigation, color: "text-blue-500" },
                                { label: "МИН", val: selectedWorkout.duration, icon: Clock, color: "text-green-500" },
                                { label: "LOAD", val: Math.round((selectedWorkout.zone3Min || 0) + (selectedWorkout.zone4Min || 0) * 2 + (selectedWorkout.zone5Min || 0) * 4), icon: Zap, color: "text-orange-500" },
                                { label: "ТОНУС", val: selectedWorkout.feeling || "—", icon: Smile, color: "text-purple-500" },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                    <span className="text-[8px] font-black text-gray-500 uppercase block mb-1">{s.label}</span>
                                    <span className="text-xl font-black text-white">{s.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6 flex gap-3">
                            <BrainCircuit size={20} className="text-blue-400 shrink-0" />
                            <p className="text-[11px] text-blue-100/80 leading-snug font-medium">{getAiAdvice(selectedWorkout)}</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { l: "Z5 Макс", v: selectedWorkout.zone5Min, c: "bg-red-500" },
                                { l: "Z4 Порог", v: selectedWorkout.zone4Min, c: "bg-orange-500" },
                                { l: "Z3 Темп", v: selectedWorkout.zone3Min, c: "bg-yellow-500" },
                                { l: "Z2 База", v: selectedWorkout.zone2Min, c: "bg-blue-500" },
                            ].map((z, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-gray-500 w-12 uppercase">{z.l}</span>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${z.c}`} style={{ width: `${(z.v || 0) / (selectedWorkout.duration || 1) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-white w-8 text-right">{z.v || 0}</span>
                                </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}