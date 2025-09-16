import React, { useState } from "react";
import { Calendar, Clock, Activity, Trash2, Edit2 } from "lucide-react";
import EditWorkoutModal from "./EditWorkoutModal";

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}ч ` : ""}${m}м`;
}

// 🔑 Функция для группировки по дате
function groupByDate(workouts: Workout[]) {
  return workouts.reduce((acc, w) => {
    const date = formatDate(w.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(w);
    return acc;
  }, {} as Record<string, Workout[]>);
}

export default function RecentWorkouts({
  workouts,
  onDeleteWorkout,
  onUpdateWorkout,
}: Props) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тренировку?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workouts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        onDeleteWorkout?.(id);
      } else {
        alert("Ошибка при удалении");
      }
    } catch (e) {
      alert("Ошибка соединения");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="bg-[#1a1a1d] p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Recent Workouts</h2>
        <div className="space-y-4">
          {!workouts ? (
            <p className="text-gray-500 text-sm">Загрузка...</p>
          ) : workouts.length === 0 ? (
            <p className="text-gray-500 text-sm">Пока нет тренировок</p>
          ) : (
            Object.entries(
              groupByDate(
                [...workouts].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
              )
            ).map(([date, dayWorkouts]) => (
              <div
                key={date}
                className="bg-[#242428] rounded-xl p-3 border border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{date}</span>
                </div>

                <div className="space-y-3">
                  {dayWorkouts.map((w) => (
                    <div
                      key={w.id}
                      className="bg-[#2a2a2d] rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <button
                          onClick={() => {
                            setSelectedWorkoutId(w.id);
                            setIsEditing(false);
                            setIsModalOpen(true);
                          }}
                          className="text-md font-semibold text-left hover:underline"
                          title="Просмотреть тренировку"
                        >
                          {w.name}
                        </button>
                        <div className="text-sm text-gray-400 flex gap-4">
                          <Clock className="w-4 h-4" /> {formatDuration(w.duration)}
                          <Activity className="w-4 h-4" /> {w.type}
                          {w.distance ? <span>— {w.distance} км</span> : null}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setSelectedWorkoutId(w.id);
                            setIsEditing(true);
                            setIsModalOpen(true);
                          }}
                          title="Редактировать"
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          disabled={deletingId === w.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
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
    </>
  );
}


