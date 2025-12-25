import React, { useState } from 'react';
import { Activity, X, Calendar, ChevronRight, TrendingUp, Timer, Inbox } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

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
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function ActivityTable({ workouts }: Props) {
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
    <div className="w-full font-sans text-white">

      {/* 1. ЗАГОЛОВОК */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0f0f11] border border-gray-800/60 rounded-xl flex items-center justify-center">
            <Activity size={14} className={isEmpty ? "text-gray-600" : "text-blue-500"} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Аналитика тренировок</h2>
        </div>
      </div>

      {/* 2. КАРТОЧКА */}
      <div className="relative min-h-[140px] bg-[#0a0a0b] border border-gray-800/40 rounded-[24px] overflow-hidden shadow-2xl">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#0f0f11]/20">
            <Inbox size={18} className="text-gray-700" />
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Нет данных</p>
              <p className="text-[8px] text-gray-700 font-bold uppercase mt-0.5">за выбранный период</p>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {activityRows.map((row, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedType(row.type)}
                className="w-full flex items-center justify-between py-4 px-4 rounded-2xl hover:bg-white/[0.03] transition-all group active:scale-[0.99]"
              >
                <div className="flex flex-col gap-2.5 flex-1 text-left min-w-0 pr-6">
                  <span className="text-[11px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors truncate">
                    {row.type}
                  </span>
                  <div className="h-[2px] w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${row.share}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-[12px] font-black text-white tabular-nums">{formatTime(row.duration)}</div>
                    <div className="text-[8px] font-bold text-gray-600 uppercase mt-1.5">{Math.round(row.share)}%</div>
                  </div>
                  <div className="flex flex-col items-center min-w-[36px] border-l border-gray-800/60 pl-5 text-white">
                    <span className="text-[12px] font-black">{row.sessions}</span>
                    <span className="text-[7px] font-black text-gray-600 uppercase">раз</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-800 group-hover:text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. МОДАЛКА (С ЭФФЕКТОМ ИЗ ИТОГОВ НЕДЕЛИ) */}
      <Transition show={!!selectedType} as={React.Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={() => setSelectedType(null)}>

          {/* Overlay с размытием и затемнением 60% */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" />
          </Transition.Child>

          {/* Контент модалки с анимацией zoom-in */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-[32px] bg-[#0a0a0b] border border-gray-800/60 p-0 shadow-2xl transition-all">

                  {/* Шапка модалки */}
                  <div className="p-8 pb-4 flex justify-between items-start bg-gradient-to-b from-blue-600/5 to-transparent">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{selectedType}</h3>
                      </div>
                      <p className="text-xl font-bold text-white tracking-tight">История активностей</p>
                    </div>
                    <button
                      onClick={() => setSelectedType(null)}
                      className="p-2.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Сетка со статистикой */}
                  <div className="grid grid-cols-3 gap-3 px-8 py-6">
                    <div className="bg-[#0f0f11] border border-gray-800/40 p-5 rounded-2xl flex flex-col items-center text-center">
                      <Timer size={18} className="text-blue-500/70 mb-3" />
                      <div className="text-[13px] font-black text-white">{formatTime(typeTotalMinutes)}</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Всего</div>
                    </div>
                    <div className="bg-[#0f0f11] border border-gray-800/40 p-5 rounded-2xl flex flex-col items-center text-center">
                      <Activity size={18} className="text-blue-500/70 mb-3" />
                      <div className="text-[13px] font-black text-white">{filteredWorkouts.length}</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Сессий</div>
                    </div>
                    <div className="bg-[#0f0f11] border border-gray-800/40 p-5 rounded-2xl flex flex-col items-center text-center">
                      <TrendingUp size={18} className="text-blue-500/70 mb-3" />
                      <div className="text-[13px] font-black text-white">{avgDuration}м</div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Средняя</div>
                    </div>
                  </div>

                  {/* Список тренировок */}
                  <div className="px-8 pb-10">
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                      {filteredWorkouts.map((w) => (
                        <div key={w.id} className="group flex items-center justify-between p-5 rounded-[22px] bg-white/[0.02] border border-white/[0.04] hover:border-blue-500/30 transition-all">
                          <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-bold text-gray-200">
                              {mapDbToDisplay(w.type)}
                            </span>
                            <div className="flex items-center gap-4 text-[9px] font-bold text-gray-600 uppercase">
                              <span className="flex items-center gap-1.5"><Calendar size={12} /> {w.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {w.distance && (
                              <div className="text-right">
                                <div className="text-[13px] font-black text-emerald-500 leading-none">{w.distance.toFixed(1)}</div>
                                <div className="text-[7px] text-gray-600 font-bold uppercase mt-1">км</div>
                              </div>
                            )}
                            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl min-w-[70px] text-center">
                               <div className="text-[13px] font-black text-blue-500">{formatTime(w.duration)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}