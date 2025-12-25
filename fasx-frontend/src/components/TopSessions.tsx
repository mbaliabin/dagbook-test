import React, { useMemo, useState } from "react";
import {
  Bike, Footprints, Dumbbell, MapPin, Timer,
  Zap, Smile, X, Calendar, Activity, Clock, Navigation, BrainCircuit
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

export default function TopSessions({ workouts }: Props) {
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
    if ((w.zone5Min || 0) > 10) return "Высокая анаэробная нагрузка. Завтра лучше сделать легкую заминку в Z1.";
    if ((w.zone4Min || 0) > 30) return "Мощная работа на выносливость! Ваш ПАНО прогрессирует.";
    if ((w.zone2Min || 0) > (w.duration * 0.7)) return "Отличная база. Такая тренировка укрепляет сердце.";
    return "Стабильный результат. Вы в хорошей форме!";
  };

  const renderMiniCard = (label: string, workout: Workout | null, Icon: any, color: string, val: string, unit: string) => {
    if (!workout) return null;
    const info = getTypeInfo(workout.type);
    return (
      <button
        onClick={() => setSelectedWorkout(workout)}
        className="relative w-full text-left bg-[#0f0f11] border border-gray-800/40 rounded-[24px] p-6 overflow-hidden group hover:border-gray-600 transition-all active:scale-[0.98] min-h-[190px] flex flex-col justify-between shadow-xl"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 blur-[45px] opacity-[0.15] group-hover:opacity-[0.25] transition-opacity" style={{ backgroundColor: color }} />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800 shadow-inner text-white">
              <Icon size={16} color={color} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">{label}</span>
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{info.label}</span>
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tracking-tighter transition-transform group-hover:translate-x-1 duration-300">
                {val}
              </span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{unit}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/50">
            <h3 className="text-[11px] font-bold text-gray-300 truncate leading-none mb-1.5 group-hover:text-white transition-colors">
              {workout.name || "Без названия"}
            </h3>
            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">
              {dayjs(workout.date).format("D MMMM")}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full font-sans">
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 whitespace-nowrap">Итоги недели</h2>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800/40 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {renderMiniCard("Время", longest, Timer, "#3b82f6", String(longest?.duration), "мин")}
        {renderMiniCard("Нагрузка", hardest, Zap, "#ef4444", String(Math.round((hardest?.zone3Min || 0) + (hardest?.zone4Min || 0) * 2 + (hardest?.zone5Min || 0) * 4)), "load")}
        {renderMiniCard("Тонус", bestFeeling, Smile, "#a855f7", String(bestFeeling?.feeling || 0), "/ 10")}
      </div>

      <Transition show={!!selectedWorkout} as={React.Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setSelectedWorkout(null)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <Dialog.Panel className="relative bg-[#0a0a0b] border border-gray-800/60 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl transition-all">
                  {selectedWorkout && (
                    <>
                      <div className="relative p-8 pb-24 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="p-5 rounded-2xl bg-[#0f0f11] border border-gray-800 shadow-2xl text-white">
                              {React.createElement(getTypeInfo(selectedWorkout.type).icon, { size: 32, color: getTypeInfo(selectedWorkout.type).color })}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">
                                  {getTypeInfo(selectedWorkout.type).label}
                                </span>
                              </div>
                              <h2 className="text-2xl md:text-3xl font-black text-gray-200 tracking-tight leading-none italic uppercase">
                                {selectedWorkout.name || "Тренировка"}
                              </h2>
                            </div>
                          </div>
                          <button onClick={() => setSelectedWorkout(null)} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 transition-all"><X size={24} /></button>
                        </div>
                      </div>

                      <div className="px-8 -mt-16 relative z-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: "Дистанция", val: selectedWorkout.distance || "0", unit: "км", icon: Navigation, color: "text-blue-500" },
                            { label: "Время", val: selectedWorkout.duration, unit: "мин", icon: Clock, color: "text-green-500" },
                            { label: "Нагрузка", val: Math.round((selectedWorkout.zone3Min || 0) + (selectedWorkout.zone4Min || 0) * 2 + (selectedWorkout.zone5Min || 0) * 4), unit: "load", icon: Zap, color: "text-orange-500" },
                            { label: "Состояние", val: selectedWorkout.feeling || "—", unit: "/ 10", icon: Smile, color: "text-purple-500" },
                          ].map((stat, i) => (
                            <div key={i} className="bg-[#0f0f11] border border-gray-800/40 p-5 rounded-2xl shadow-xl">
                              <div className="flex items-center gap-2 mb-3 opacity-50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                <stat.icon size={13} className={stat.color} />
                                {stat.label}
                              </div>
                              <div className="flex items-baseline gap-1 text-white">
                                <span className="text-2xl font-black tracking-tighter">{stat.val}</span>
                                <span className="text-[9px] font-bold text-gray-600 uppercase">{stat.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mx-8 mt-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                         <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0"><BrainCircuit size={18} /></div>
                         <div>
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-400/80 mb-1">AI Анализ</h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{getAiAdvice(selectedWorkout)}</p>
                         </div>
                      </div>

                      <div className="p-8 space-y-5">
                          <div className="flex items-center justify-between opacity-80">
                            <div className="flex items-center gap-3">
                              <Activity size={15} className="text-blue-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Пульсовые зоны</span>
                            </div>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{dayjs(selectedWorkout.date).format("DD MMMM YYYY")}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {[
                              { l: "Z5 Максимум", v: selectedWorkout.zone5Min, c: "bg-red-500" },
                              { l: "Z4 Порог", v: selectedWorkout.zone4Min, c: "bg-orange-500" },
                              { l: "Z3 Темп", v: selectedWorkout.zone3Min, c: "bg-yellow-500" },
                              { l: "Z2 База", v: selectedWorkout.zone2Min, c: "bg-blue-500" },
                              { l: "Z1 Разминка", v: selectedWorkout.zone1Min, c: "bg-green-500" },
                            ].map((z, i) => (
                              <div key={i}>
                                <div className="flex justify-between items-end mb-1.5 opacity-90">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{z.l}</span>
                                  <span className="text-[11px] font-black text-gray-200">{z.v || 0} <span className="text-[8px] text-gray-600 uppercase">мин</span></span>
                                </div>
                                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                  <div className={`h-full ${z.c} transition-all duration-700 opacity-70`} style={{ width: `${(z.v || 0) / (selectedWorkout.duration || 1) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                      </div>

                      <div className="p-8 pt-0">
                         <button onClick={() => setSelectedWorkout(null)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-[0.98]">
                           Вернуться к дашборду
                         </button>
                      </div>
                    </>
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