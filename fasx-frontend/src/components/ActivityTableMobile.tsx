import React, { useState } from 'react';
import { Activity, X, Calendar, ChevronRight, TrendingUp, Timer, Inbox, Navigation } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import dayjs from 'dayjs';

interface Workout {
  id: string;
  type: string;
  duration: number;
  date: string;
  title?: string;
  avgHr?: number;
  distance?: number;
}

interface Props {
  workouts: Workout[];
}

// Возвращаем полные названия как в десктопной версии
const mapDbToDisplay = (dbType: string): string => {
  const t = dbType.toLowerCase();
  if (t.includes('ski') && t.includes('classic')) return "Лыжи/ классический стиль";
  if (t.includes('ski') && (t.includes('skate') || t.includes('конь'))) return "Лыжи/ коньковый стиль";
  if (t.includes('roller') && (t.includes('skate') || t.includes('конь'))) return "Лыжероллеры / коньковый стиль";
  if (t.includes('roller') && t.includes('classic')) return "Лыжероллеры / классический стиль";
  if (t.includes('imitation') || t.includes('имитация')) return "Бег / лыжная имитация";
  if (t.includes('bike') || t.includes('вело')) return "Велосипед";
  if (t.includes('strength') || t.includes('силовая')) return "Силовая тренировка";
  if (t.includes('run') || t.includes('бег')) return "Бег";
  return "Другое";
};

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
};

export default function ActivityTableMobile({ workouts }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const isEmpty = workouts.length === 0;

  const statsMap = workouts.reduce((acc, workout) => {
    const russianName = mapDbToDisplay(workout.type);
    if (!acc[russianName]) acc[russianName] = { duration: 0, sessions: 0 };
    acc[russianName].duration += workout.duration;
    acc[russianName].sessions += 1;
    return acc;
  }, {} as Record<string, { duration: number; sessions: number }>);

  const activityRows = Object.entries(statsMap)
    .map(([type, stats]) => ({ type, ...stats, share: totalMinutes > 0 ? (stats.duration / totalMinutes) * 100 : 0 }))
    .filter(row => row.sessions > 0)
    .sort((a, b) => b.duration - a.duration);

  const filteredWorkouts = workouts.filter(w => mapDbToDisplay(w.type) === selectedType);
  const typeTotalMinutes = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const avgDuration = filteredWorkouts.length ? Math.round(typeTotalMinutes / filteredWorkouts.length) : 0;

  return (
    <div className="w-full font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Activity size={12} className="text-blue-500" />
        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Аналитика видов</h2>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-[#131316] border border-white/[0.05] rounded-[20px] overflow-hidden shadow-xl">
        {isEmpty ? (
          <div className="py-10 flex flex-col items-center justify-center opacity-20">
            <Inbox size={20} className="mb-2" />
            <span className="text-[8px] font-black uppercase tracking-widest">Нет данных</span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {activityRows.map((row, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedType(row.type)}
                className="w-full flex items-center justify-between p-4 active:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-tight truncate max-w-[140px]">
                        {row.type}
                    </span>
                    <span className="text-[10px] font-black text-white">{formatTime(row.duration)}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${row.share}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-3 border-l border-white/[0.05]">
                  <div className="text-right min-w-[28px]">
                    <div className="text-[10px] font-black text-blue-500">{row.sessions}</div>
                    <div className="text-[6px] font-bold text-gray-600 uppercase">раз</div>
                  </div>
                  <ChevronRight size={12} className="text-gray-800" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM SHEET MODAL */}
      <Transition show={!!selectedType} as={React.Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setSelectedType(null)}>
          <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel className="relative w-full bg-[#0a0a0b] border-t border-white/10 rounded-t-[24px] shadow-2xl max-h-[85vh] flex flex-col">
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mt-3 mb-1" />

                <div className="p-5 flex-1 overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">{selectedType}</h3>
                      <p className="text-lg font-black text-white uppercase italic leading-none">История</p>
                    </div>
                    <button onClick={() => setSelectedType(null)} className="p-1 text-gray-500"><X size={20} /></button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { icon: Timer, label: "Всего", val: formatTime(typeTotalMinutes) },
                      { icon: Activity, label: "Сессий", val: filteredWorkouts.length },
                      { icon: TrendingUp, label: "Средняя", val: `${avgDuration}м` },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                        <item.icon size={12} className="mx-auto mb-1.5 text-blue-500/50" />
                        <div className="text-[10px] font-black text-white">{item.val}</div>
                        <div className="text-[6px] font-bold text-gray-500 uppercase tracking-tighter">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Workouts List */}
                  <div className="space-y-2 overflow-y-auto pr-1 pb-4 flex-1 custom-scrollbar">
                    {filteredWorkouts.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                        <div>
                          <div className="text-[10px] font-black text-gray-200 mb-0.5">{dayjs(w.date).format("D MMMM YYYY")}</div>
                          {w.distance && (
                            <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase">
                              <Navigation size={9} /> {w.distance.toFixed(1)} км
                            </div>
                          )}
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <span className="text-[10px] font-black text-blue-500">{formatTime(w.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}