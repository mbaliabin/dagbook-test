import React, { useState } from "react";
import {
  Calendar, Clock, Activity, Trash2, Edit2,
  ChevronDown, Bike, Footprints, Dumbbell, MapPin
} from "lucide-react";
import EditWorkoutModal from "./EditWorkoutModal";
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
}

function getTypeInfo(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("ski") || lowerType.includes("лыжи")) return { icon: SkiIcon, label: "Лыжи", color: "#06b6d4" };
  if (lowerType.includes("run") || lowerType.includes("бег")) return { icon: Footprints, label: "Бег", color: "#3b82f6" };
  if (lowerType.includes("strength") || lowerType.includes("силовая")) return { icon: Dumbbell, label: "Зал", color: "#f59e0b" };
  if (lowerType.includes("bike") || lowerType.includes("вело")) return { icon: Bike, label: "Вело", color: "#10b981" };
  return { icon: MapPin, label: "Тренировка", color: "#6366f1" };
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function RecentWorkouts({ workouts, onDeleteWorkout, onUpdateWorkout }: Props) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Чтобы при клике на "удалить" не открывалась карточка
    if (!confirm("Удалить тренировку?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDeleteWorkout?.(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Чтобы модалка открывалась именно в режиме редактирования
    setSelectedWorkoutId(id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  if (!workouts) return <div className="text-gray-500 p-4 text-[10px] uppercase tracking-widest">Загрузка...</div>;

  const sorted = [...workouts].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  const limited = sorted.slice(0, visibleCount);

  const grouped = limited.reduce((acc, w) => {
    const date = dayjs(w.date).format("D MMMM YYYY");
    if (!acc[date]) acc[date] = [];
    acc[date].push(w);
    return acc;
  }, {} as Record<string, Workout[]>);

  return (
    <div className="w-full font-sans text-white">
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Последние активности</h2>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800/40 to-transparent" />
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, dayWorkouts]) => (
          <div key={date} className="relative">
            {/* Заголовок даты без черного фона */}
            <div className="sticky top-0 z-10 py-2 mb-3 flex items-center gap-3">
              <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest pr-2 backdrop-blur-[2px]">
                {date}
              </span>
              <div className="h-[px] flex-1 bg-gradient-to-r from-gray-800/40 to-transparent" />
            </div>

            <div className="space-y-3">
              {dayWorkouts.map((w) => {
                const info = getTypeInfo(w.type);
                return (
                  <div
                    key={w.id}
                    onClick={() => { setSelectedWorkoutId(w.id); setIsEditing(false); setIsModalOpen(true); }}
                    className="group relative bg-[#0f0f11] border border-gray-800/40 rounded-2xl p-4 transition-all hover:border-gray-600/50 hover:bg-[#141417] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-gray-400 group-hover:text-white transition-colors">
                          <info.icon size={18} color={info.color} />
                        </div>

                        <div>
                          <div className="text-[13px] font-bold text-gray-200 group-hover:text-blue-400 transition-colors leading-tight mb-1">
                            {w.name || "Без названия"}
                          </div>
                          <div className="flex items-center gap-3 text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(w.duration)}</span>
                            {w.distance && <span className="flex items-center gap-1 text-emerald-500/80"><Activity size={10} /> {w.distance} км</span>}
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{info.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEdit(e, w.id)}
                          className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, w.id)}
                          disabled={deletingId === w.id}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
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
          className="w-full mt-8 py-4 bg-[#0f0f11] border border-gray-800/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-gray-800/30 transition-all flex items-center justify-center gap-2"
        >
          <ChevronDown size={14} /> Показать больше тренировок
        </button>
      )}

      {isModalOpen && selectedWorkoutId && (
        <EditWorkoutModal
          workoutId={selectedWorkoutId}
          mode={isEditing ? "edit" : "view"}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedWorkoutId(null); setIsEditing(false); }}
          onSave={onUpdateWorkout}
        />
      )}
    </div>
  );
}