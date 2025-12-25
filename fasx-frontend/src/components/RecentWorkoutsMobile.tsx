import React, { useState } from "react";
import {
  Calendar, Clock, Activity, Trash2, Edit2,
  ChevronDown, Bike, Footprints, Dumbbell, MapPin
} from "lucide-react";
// УДАЛЯЕМ импорт модалки отсюда, она нам тут больше не нужна
import dayjs from "dayjs";
import 'dayjs/locale/ru';

dayjs.locale('ru');

const SkiIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 21-4-4-4 4" /><path d="M4.5 7L12 14.5L19.5 7" /><circle cx="12" cy="5" r="1" /><path d="M12 6v6" /><path d="M6 22l12-12" /><path d="M18 22L6 10" />
  </svg>
);

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  distance?: number | null;
}

interface Props {
  workouts?: Workout[];
  onDeleteWorkout?: (id: string) => void;
  onUpdateWorkout?: () => void;
  // ДОБАВЛЯЕМ новые пропсы для связи с ProfilePage
  onEditClick: (id: string) => void;
  onViewClick: (id: string) => void;
}

function getTypeInfo(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("ski") || lowerType.includes("лыжи")) return { icon: SkiIcon, label: "Лыжи", color: "#06b6d4", bg: "bg-cyan-500/10" };
  if (lowerType.includes("run") || lowerType.includes("бег")) return { icon: Footprints, label: "Бег", color: "#3b82f6", bg: "bg-blue-500/10" };
  if (lowerType.includes("strength") || lowerType.includes("силовая")) return { icon: Dumbbell, label: "Зал", color: "#f59e0b", bg: "bg-orange-500/10" };
  if (lowerType.includes("bike") || lowerType.includes("вело")) return { icon: Bike, label: "Вело", color: "#10b981", bg: "bg-emerald-500/10" };
  return { icon: MapPin, label: "Тренировка", color: "#6366f1", bg: "bg-indigo-500/10" };
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

export default function RecentWorkouts({
  workouts,
  onDeleteWorkout,
  onUpdateWorkout,
  onEditClick,
  onViewClick
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Удалить тренировку?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDeleteWorkout?.(id);
    } finally { setDeletingId(null); }
  };

  if (!workouts) return <div className="text-gray-600 p-4 text-[10px] font-black uppercase tracking-widest animate-pulse">Загрузка...</div>;

  const sorted = [...workouts].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  const limited = sorted.slice(0, visibleCount);

  const grouped = limited.reduce((acc, w) => {
    const date = dayjs(w.date).format("D MMMM");
    if (!acc[date]) acc[date] = [];
    acc[date].push(w);
    return acc;
  }, {} as Record<string, Workout[]>);

  return (
    <div className="w-full font-sans text-white">
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, dayWorkouts]) => (
          <div key={date} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
                {date === dayjs().format("D MMMM") ? "Сегодня" : date}
              </span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="space-y-2.5">
              {dayWorkouts.map((w) => {
                const info = getTypeInfo(w.type);
                return (
                  <div
                    key={w.id}
                    // ВМЕСТО локального стейта — вызываем onViewClick
                    onClick={() => onViewClick(w.id)}
                    className="relative bg-[#131316] border border-white/[0.03] rounded-2xl p-3.5 active:scale-[0.98] transition-all flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`shrink-0 w-10 h-10 rounded-xl ${info.bg} flex items-center justify-center border border-white/[0.03]`}>
                        <info.icon size={18} color={info.color} />
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="text-[11px] font-bold text-gray-200 truncate leading-tight mb-0.5 uppercase tracking-tight">
                          {w.name || info.label}
                        </h4>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{info.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                            <div className="text-[12px] font-black text-white leading-none">
                                {w.distance ? `${w.distance} км` : formatDuration(w.duration)}
                            </div>
                            {w.distance && (
                                <div className="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-tighter">
                                    {formatDuration(w.duration)}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 border-l border-white/5 pl-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditClick(w.id); }}
                              className="p-1 text-gray-700 active:text-blue-500"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button onClick={(e) => handleDelete(e, w.id)} className="p-1 text-gray-700 active:text-red-500">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {visibleCount < sorted.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full mt-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 active:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <ChevronDown size={14} /> Загрузить еще
        </button>
      )}
      {/* ТУТ ПУСТО — МОДАЛКИ БОЛЬШЕ НЕТ */}
    </div>
  );
}