import React, { useState } from "react";
import { Calendar, Clock, Activity, Trash2, Edit2 } from "lucide-react";
import ActivityTable from "../components/ActivityTable";
import EditWorkoutModal from "./EditWorkoutModalMobile";

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  distance?: number | null;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

interface Props {
  workouts?: Workout[];
  onDeleteWorkout?: (id: string) => void;
  onUpdateWorkout?: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}ч ` : ""}${m}м`;
}

function groupByDate(workouts: Workout[]) {
  return workouts.reduce((acc, w) => {
    const date = formatDate(w.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(w);
    return acc;
  }, {} as Record<string, Workout[]>);
}

export default function RecentWorkoutsMobile({
  workouts = [],
  onDeleteWorkout,
  onUpdateWorkout,
}: Props) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleDays, setVisibleDays] = useState(7); // показываем 7 дней

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тренировку?")) return;
    setDeletingId(id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDeleteWorkout?.(id);
      else alert("Ошибка при удалении");
    } catch {
      alert("Ошибка соединения");
    } finally {
      setDeletingId(null);
    }
  };

  // Сортировка и группировка
  const grouped = Object.entries(
    groupByDate([...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  );

  // Ограничиваем количество видимых дней
  const visibleGrouped = grouped.slice(0, visibleDays);

  return (
    <div className="flex flex-col gap-4 w-full">
      <ActivityTable
        workouts={workouts.map((w) => ({ id: w.id, type: w.type, duration: w.duration }))}
      />

      <div className="bg-[#1a1a1d] p-3 rounded-xl w-full">
        <h2 className="text-base font-semibold mb-3">Последние тренировки</h2>
        <div className="space-y-3">
          {!workouts.length ? (
            <p className="text-gray-500 text-sm">Пока нет тренировок</p>
          ) : (
            <>
              {visibleGrouped.map(([date, dayWorkouts]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{date}</span>
                  </div>

                  <div className="space-y-2">
                    {dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="bg-[#2a2a2d] rounded-lg p-2 flex justify-between items-center"
                      >
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {
                              setSelectedWorkoutId(w.id);
                              setIsEditing(false);
                              setIsModalOpen(true);
                            }}
                            className="text-sm font-medium text-left truncate"
                            title="Просмотреть тренировку"
                          >
                            {w.name}
                          </button>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(w.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {w.type}
                            </span>
                            {w.distance ? <span>{w.distance} км</span> : null}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedWorkoutId(w.id);
                              setIsEditing(true);
                              setIsModalOpen(true);
                            }}
                            title="Редактировать"
                            className="text-blue-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(w.id)}
                            disabled={deletingId === w.id}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Кнопка "Показать ещё" */}
              {visibleDays < grouped.length && (
                <button
                  onClick={() => setVisibleDays(visibleDays + 7)}
                  className="mt-3 w-full py-2 text-sm font-medium text-center text-blue-400 hover:text-blue-600 border border-blue-400 rounded-lg"
                >
                  Показать ещё
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isModalOpen && selectedWorkoutId && (
        <EditWorkoutModal
          workoutId={selectedWorkoutId}
          mode={isEditing ? "edit" : "view"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWorkoutId(null);
            setIsEditing(false);
          }}
          onSave={onUpdateWorkout}
        />
      )}
    </div>
  );
}