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

  const duration = useMemo(() => zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0), [zones]);
  const formattedDuration = `${Math.floor(duration / 60)}ч ${duration % 60}м`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Вы не авторизованы");

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(workoutData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка при создании тренировки:", errorData);
        return alert("Ошибка при создании тренировки");
      }
      const result = await response.json();
      onAddWorkout(result);
      onClose();
    } catch {
      alert("Ошибка соединения с сервером");
    }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center px-2">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-5 rounded-2xl w-full sm:max-w-md text-white shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X />
        </button>
        <Dialog.Title className="text-xl font-semibold mb-4">Добавить тренировку</Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название тренировки"
            required
          />

          <input
            type="date"
            className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <textarea
            rows={3}
            className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий"
          />

          {/* Effort и Feeling */}
          <div className="flex flex-col gap-2">
            {["Воспринимаемая нагрузка", "Самочувствие"].map((label, idx) => {
              const state = idx === 0 ? effort : feeling;
              const setState = idx === 0 ? setEffort : setFeeling;
              const colors = idx === 0 ? "bg-blue-600" : "bg-green-600";
              return (
                <div key={idx}>
                  <span className="text-sm text-gray-400 mb-1 block">{label}</span>
                  <div className="flex flex-wrap gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`w-7 h-7 rounded-full ${state === i + 1 ? colors + " text-white" : "bg-[#2a2a2d] text-gray-300"}`}
                        onClick={() => setState(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{idx === 0 ? "Легко" : "Плохо"}</span>
                    <span>{idx === 0 ? "Максимум" : "Отлично"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <select
            className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Выбери тип</option>
            <option value="Running">Бег</option>
            <option value="XC_Skiing_Classic">Лыжи классика</option>
            <option value="XC_Skiing_Skate">Лыжи свободный стиль</option>
            <option value="RollerSki_Classic">Роллеры классика</option>
            <option value="RollerSki_Skate">Роллеры свободный стиль</option>
            <option value="StrengthTraining">Силовая</option>
            <option value="Other">Другое</option>
            <option value="Bike">Велосипед</option>
          </select>

          {/* Зоны интенсивности */}
          <div>
            <span className="block text-sm text-gray-400 mb-2">Минуты по зонам</span>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-[380px]">
                {zones.map((zone, idx) => (
                  <div key={idx} className="flex flex-col items-center w-20">
                    <span className="text-sm text-gray-300 mb-1">{zoneLabels[idx]}</span>
                    <div className={`w-full h-6 rounded-t ${zoneColors[idx]} border border-gray-600`} />
                    <input
                      type="number"
                      min={0}
                      className="w-full text-center bg-[#2a2a2d] text-white py-1 rounded-b no-spinner"
                      value={zone}
                      onChange={(e) => handleZoneChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <input
            type="text"
            value={formattedDuration}
            disabled
            className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white opacity-70 cursor-not-allowed"
          />

          {(type !== "StrengthTraining" && type !== "Other") && (
            <input
              type="number"
              min={0}
              step={0.1}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white"
              placeholder="Расстояние (км)"
            />
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
              Сохранить
            </button>
          </div>
        </form>
      </Dialog.Panel>

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
    </Dialog>
  );
}
