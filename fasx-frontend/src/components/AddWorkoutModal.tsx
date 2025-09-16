import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: any) => void;
}

export default function AddWorkoutModal({ isOpen, onClose, onAddWorkout }: AddWorkoutModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [effort, setEffort] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [zones, setZones] = useState<string[]>(["", "", "", "", ""]);
  const [distance, setDistance] = useState<number | "">("");

  // Сбрасываем форму при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDate("");
      setComment("");
      setEffort(null);
      setFeeling(null);
      setType("");
      setZones(["", "", "", "", ""]);
      setDistance("");
    }
  }, [isOpen]);

  const handleZoneChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const updated = [...zones];
      updated[index] = value;
      setZones(updated);
    }
  };

  const duration = useMemo(() => {
    return zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  }, [zones]);

  const formattedDuration = `${Math.floor(duration / 60)}ч ${duration % 60}м`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Вы не авторизованы");
      return;
    }

    const workoutData = {
      name: title,
      date,
      comment,
      effort,
      feeling,
      type,
      duration,
      distance: type !== "StrengthTraining" && type !== "Other" ? Number(distance) || null : null,
      intensityZones: {
        zone1Min: parseInt(zones[0]) || 0,
        zone2Min: parseInt(zones[1]) || 0,
        zone3Min: parseInt(zones[2]) || 0,
        zone4Min: parseInt(zones[3]) || 0,
        zone5Min: parseInt(zones[4]) || 0,
      },
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка при создании тренировки:", errorData);
        alert("Ошибка при создании тренировки");
        return;
      }

      const result = await response.json();
      console.log("Создана тренировка:", result);
      onAddWorkout(result); // Передаём тренировку в родительский компонент
      onClose();
    } catch (error) {
      console.error("Сетевой сбой:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-6 rounded-2xl w-[90%] max-w-xl z-50 text-white shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X />
          </button>
          <Dialog.Title className="text-xl font-semibold mb-4">Добавить тренировку</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Название тренировки</label>
              <input
                type="text"
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Утренняя пробежка"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Дата</label>
              <input
                type="date"
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Комментарий</label>
              <textarea
                rows={3}
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Воспринимаемая нагрузка</label>
              <div className="flex items-center justify-between gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-8 h-8 rounded-full ${effort === i + 1 ? "bg-blue-600 text-white" : "bg-[#2a2a2d] text-gray-300"}`}
                    onClick={() => setEffort(i + 1)}
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

            <div>
              <label className="block text-sm text-gray-400 mb-1">Самочувствие</label>
              <div className="flex items-center justify-between gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`w-8 h-8 rounded-full ${feeling === i + 1 ? "bg-green-600 text-white" : "bg-[#2a2a2d] text-gray-300"}`}
                    onClick={() => setFeeling(i + 1)}
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

            <div>
              <label className="block text-sm text-gray-400 mb-1">Тип тренировки</label>
              <select
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Выбери тип</option>
                <option value="Running">Бег</option>
                <option value="XC_Skiing_Classic">Лыжи, классика</option>
                <option value="XC_Skiing_Skate">Лыжи, свободный стиль</option>
                <option value="RollerSki_Classic">Роллеры, классика</option>
                <option value="RollerSki_Skate">Лыжероллеры, свободный стиль</option>
                <option value="StrengthTraining">Силовая тренировка</option>
                <option value="Other">Другое</option>
                <option value="Bike">Велосипед</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Минуты по зонам интенсивности</label>
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-[500px]">
                  {[1, 2, 3, 4, 5].map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center w-24">
                      <span className="text-sm text-gray-300 mb-1">{zoneLabels[idx]}</span>
                      <div className={`w-full h-6 rounded-t ${zoneColors[idx]} border border-gray-600`} />
                      <input
                        type="number"
                        min={0}
                        className="w-full text-center bg-[#2a2a2d] text-white py-1 rounded-b no-spinner"
                        value={zones[idx]}
                        onChange={(e) => handleZoneChange(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Время тренировки</label>
              <input
                type="text"
                value={formattedDuration}
                disabled
                className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white opacity-70 cursor-not-allowed"
              />
            </div>

            {(type !== "StrengthTraining" && type !== "Other") && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Расстояние (км)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
                Сохранить
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>

      <style>{`
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </>
  );
}

