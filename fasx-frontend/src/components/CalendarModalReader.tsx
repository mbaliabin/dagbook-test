import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  comment?: string;
  effort?: number;
  feeling?: number;
  distance?: number | null;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

interface EditWorkoutModalProps {
  workoutId: string | null;
  mode: "view" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedWorkout: Workout) => void;
}

export default function EditWorkoutModal({
  workoutId,
  mode,
  isOpen,
  onClose,
  onSave,
}: EditWorkoutModalProps) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [effort, setEffort] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [zones, setZones] = useState(["0", "0", "0", "0", "0"]);
  const [distance, setDistance] = useState<number | "">("");

  const isEditing = mode === "edit";

  useEffect(() => {
    if (!workoutId) return;

    const fetchWorkout = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Неавторизован");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        const data: Workout = await res.json();
        setWorkout(data);

        setName(data.name);
        setDate(data.date.slice(0, 10));
        setComment(data.comment || "");
        setEffort(data.effort ?? null);
        setFeeling(data.feeling ?? null);
        setType(data.type);
        setZones([
          (data.zone1Min ?? 0).toString(),
          (data.zone2Min ?? 0).toString(),
          (data.zone3Min ?? 0).toString(),
          (data.zone4Min ?? 0).toString(),
          (data.zone5Min ?? 0).toString(),
        ]);
        setDistance(data.distance ?? "");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const totalDuration = zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const formattedDuration = `${Math.floor(totalDuration / 60)}ч ${totalDuration % 60}м`;

  const handleSave = async () => {
    if (!name || !date || !type) {
      alert("Заполните обязательные поля");
      return;
    }

    const updatedWorkout = {
      name,
      date: new Date(date).toISOString(),
      comment,
      effort: effort ?? null,
      feeling: feeling ?? null,
      type,
      duration: totalDuration,
      distance:
        type !== "StrengthTraining" && type !== "Other"
          ? Number(distance) || null
          : null,
      zone1Min: parseInt(zones[0]) || 0,
      zone2Min: parseInt(zones[1]) || 0,
      zone3Min: parseInt(zones[2]) || 0,
      zone4Min: parseInt(zones[3]) || 0,
      zone5Min: parseInt(zones[4]) || 0,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedWorkout),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        alert("Ошибка при обновлении: " + errData.error);
        return;
      }

      const updated = await res.json();
      onSave?.(updated);
      onClose();
    } catch {
      alert("Ошибка соединения");
    }
  };

  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];
  const zoneColors = [
    "bg-green-500",
    "bg-lime-400",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-red-500",
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-6 rounded-2xl w-[90%] max-w-xl z-50 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <Dialog.Title className="text-xl font-semibold mb-4">
          {isEditing ? "Редактирование тренировки" : "Просмотр тренировки"}
        </Dialog.Title>

        {loading ? (
          <p>Загрузка...</p>
        ) : error ? (
          <p className="text-red-500">Ошибка: {error}</p>
        ) : !workout ? (
          <p>Тренировка не найдена</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isEditing) handleSave();
            }}
            className="space-y-4"
          >
            {/* Название */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Название</label>
              <input
                type="text"
                value={name}
                onChange={(e) => isEditing && setName(e.target.value)}
                disabled={!isEditing}
                required
                className={`w-full p-2 rounded-lg bg-[#2a2a2d] text-white ${
                  !isEditing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Дата */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => isEditing && setDate(e.target.value)}
                disabled={!isEditing}
                required
                className={`w-full p-2 rounded-lg bg-[#2a2a2d] text-white ${
                  !isEditing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Комментарий */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Комментарий</label>
              <textarea
                value={comment}
                onChange={(e) => isEditing && setComment(e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`w-full p-2 rounded-lg bg-[#2a2a2d] text-white ${
                  !isEditing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Зоны интенсивности */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Минуты по зонам интенсивности
              </label>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-[560px]">
                  {zones.map((val, i) => (
                    <div key={i} className="flex flex-col items-center w-28">
                      <span className="text-sm text-gray-300 mb-1">{zoneLabels[i]}</span>
                      <div
                        className={`w-full h-6 rounded-t-lg ${zoneColors[i]} border border-gray-600 shadow-md`}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={val}
                        onChange={(e) => {
                          if (!isEditing) return;
                          const updated = [...zones];
                          updated[i] = e.target.value;
                          setZones(updated);
                        }}
                        disabled={!isEditing}
                        className={`w-full text-center bg-[#2a2a2d] text-white py-1 rounded-b-lg no-spinner ${
                          !isEditing
                            ? "opacity-70 cursor-not-allowed"
                            : "focus:outline-none focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Общее время */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Общее время</label>
              <input
                type="text"
                value={formattedDuration}
                readOnly
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Расстояние */}
            {type !== "StrengthTraining" && type !== "Other" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Расстояние (км)
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) =>
                    isEditing &&
                    setDistance(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={!isEditing}
                  min={0}
                  step={0.01}
                  className={`w-full p-2 rounded-lg bg-[#2a2a2d] text-white ${
                    !isEditing ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            )}

            {/* effort */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Воспринимаемая нагрузка</label>
              <div className="flex items-center justify-between gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-8 h-8 rounded-full ${
                      effort === i + 1 ? "bg-blue-600 text-white" : "bg-[#2a2a2d] text-gray-300"
                    }`}
                    onClick={() => isEditing && setEffort(i + 1)}
                    disabled={!isEditing}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Легко</span>
                <span>Максимум</span>
              </div>
            </div>

            {/* feeling */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Самочувствие</label>
              <div className="flex items-center justify-between gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-8 h-8 rounded-full ${
                      feeling === i + 1 ? "bg-green-600 text-white" : "bg-[#2a2a2d] text-gray-300"
                    }`}
                    onClick={() => isEditing && setFeeling(i + 1)}
                    disabled={!isEditing}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Плохо</span>
                <span>Отлично</span>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-2 mt-6">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                  >
                    Сохранить
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                >
                  Закрыть
                </button>
              )}
            </div>
          </form>
        )}
      </Dialog.Panel>
    </Dialog>
  );
}
