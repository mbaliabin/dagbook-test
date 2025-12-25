import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler } from "lucide-react";
import toast from "react-hot-toast";

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
      setDate(new Date().toISOString().split('T')[0]);
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
      toast.error("Вы не авторизованы");
      return;
    }

    const loadingToast = toast.loading("Сохранение...");

    const workoutData = {
      name: title,
      date,
      comment,
      effort,
      feeling,
      type,
      duration,
      // Дистанция отправляется только для циклических видов спорта
      distance: (type !== "StrengthTraining" && type !== "Other" && type !== "") ? Number(distance) || null : null,
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
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Тренировка добавлена!", { id: loadingToast });
        onAddWorkout(result);
        onClose();
      } else {
        toast.error("Ошибка сохранения", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Ошибка сети", { id: loadingToast });
    }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-8 rounded-2xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-10 text-white tracking-tight">
          Добавить тренировку
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Название</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Длительный бег"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Дата</label>
              <input
                type="date"
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all color-scheme-dark"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Тип тренировки</label>
            <select
              className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Выберите тип...</option>
              <optgroup label="Циклические">
                <option value="Running">Бег</option>
                <option value="Bike">Велосипед</option>
                <option value="XC_Skiing_Classic">Лыжи (Классика)</option>
                <option value="XC_Skiing_Skate">Лыжи (Конёк)</option>
                <option value="RollerSki_Classic">Лыжероллеры (Классика)</option>
                <option value="RollerSki_Skate">Лыжероллеры (Конёк)</option>
              </optgroup>
              <optgroup label="Другое">
                <option value="StrengthTraining">Силовая тренировка</option>
                <option value="Other">Другое</option>
              </optgroup>
            </select>
          </div>

          <div className="h-px bg-gray-800 my-4" />

          {/* Дистанция показывается для всех типов, кроме Силовой и Другого */}
          {(type !== "StrengthTraining" && type !== "Other" && type !== "") && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                <Ruler size={14} /> Дистанция (км)
              </label>
              <input
                type="number"
                step={0.1}
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-white font-bold text-lg outline-none focus:border-blue-500 transition-all no-spinner"
              />
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                Ваше самочувствие <span className="text-green-500 font-black text-sm">{feeling || '-'}</span>
              </label>
              <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i}
                    onClick={() => setFeeling(i + 1)}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white scale-105 shadow-lg shadow-green-900/20 border-green-400" : "bg-[#2a2a2d] text-gray-400 border border-transparent hover:border-gray-600"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                Воспринимаемая нагрузка (RPE) <span className="text-blue-500 font-black text-sm">{effort || '-'}</span>
              </label>
              <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i}
                    onClick={() => setEffort(i + 1)}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white scale-105 shadow-lg shadow-blue-900/20 border-blue-400" : "bg-[#2a2a2d] text-gray-400 border border-transparent hover:border-gray-600"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Распределение по зонам (мин)</label>
            <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
              {zones.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className={`${zoneColors[idx]} py-1.5 text-center text-[10px] font-black text-[#1a1a1d]`}>
                    {zoneLabels[idx]}
                  </div>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleZoneChange(idx, e.target.value)}
                    placeholder="---"
                    className="bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-gray-800 focus:bg-[#323235] transition-colors no-spinner"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-[#141416] px-4 py-3 rounded-xl border border-gray-800/50 mt-2">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Итоговое время тренировки</span>
              <span className="text-lg font-bold text-blue-500 tracking-tight">{formattedDuration}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Комментарий к тренировке</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
              placeholder="Как все прошло? Опишите детали..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[#2a2a2d] text-gray-400 rounded-xl hover:bg-[#323235] transition-colors text-sm font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 text-sm font-bold active:scale-95"
            >
              <Check size={18} /> Сохранить данные
            </button>
          </div>
        </form>
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </Dialog>
  );
}