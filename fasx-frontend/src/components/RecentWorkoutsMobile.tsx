import React, { useState } from "react";
import { Calendar, Clock, Activity, Trash2, Edit2 } from "lucide-react";
import IntensityZonesMobile from "../components/IntensityZonesMobile";
import ActivityTable from "../components/ActivityTable";
import EditWorkoutModal from "./EditWorkoutModal";

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
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
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

export default function ProfilePageMobile({
  workouts = [],
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
          headers: { Authorization: `Bearer ${token}` },
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
    <div className="space-y-4 p-3">

      {/* Статистика активности */}
      <ActivityTable
        workouts={workouts.map((w) => ({
          id: w.id,
          type: w.type,
          duration: w.duration,
        }))}
      />

      {/* Последние тренировки */}
      <div className="bg-[#1a1a1d] p-3 rounded-xl">
        <h2 className="text-base font-semibold mb-3">Последние тренировки</h2>
        <div className="space-y-3">
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
            ))
          )}
        </div>
      </div>

      {/* Модалка редактирования */}
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
