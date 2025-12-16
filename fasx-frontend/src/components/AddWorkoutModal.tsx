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
      toast.error("Сессия истекла");
      return;
    }

    const loadingToast = toast.loading("Сохранение...");
    const workoutData = {
      name: title, date, comment, effort, feeling, type, duration,
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
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Готово!", { id: loadingToast });
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
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[96vh] overflow-y-auto p-5 md:p-6 rounded-2xl w-[95%] max-w-xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <Dialog.Title className="text-lg font-bold mb-5 text-white tracking-tight">
          Добавить тренировку
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Компактные Название и Дата */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Название</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all"
                placeholder="Пробежка" required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Дата</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 color-scheme-dark"
                required
              />
            </div>
          </div>

          {/* Вид спорта */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Вид спорта</label>
            <select
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[#2a2a2d] border border-gray-700 text-sm outline-none cursor-pointer appearance-none"
              required
            >
              <option value="">Выбрать...</option>
              <option value="Running">Бег</option>
              <option value="XC_Skiing_Skate">Лыжи (Конёк)</option>
              <option value="XC_Skiing_Classic">Лыжи (Классика)</option>
              <option value="StrengthTraining">Силовая</option>
              <option value="Bike">Велосипед</option>
            </select>
          </div>

          {/* Дистанция - Теперь отдельной строкой, но низкой */}
          {type !== "StrengthTraining" && type !== "Other" && type !== "" && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                <Ruler size={10} /> Дистанция (км)
              </label>
              <input
                type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#2a2a2d] border border-blue-900/30 text-sm font-bold text-white outline-none focus:border-blue-500 no-spinner"
                placeholder="0.0"
              />
            </div>
          )}

          {/* Шкалы - Друг за другом, очень компактные */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                Самочувствие <span className="text-green-500">{feeling || '-'}</span>
              </label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i} onClick={() => setFeeling(i + 1)}
                    className={`flex-1 h-7 rounded-md text-[10px] font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white" : "bg-[#2a2a2d] text-gray-400 hover:bg-[#323235]"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                Нагрузка <span className="text-blue-500">{effort || '-'}</span>
              </label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i} onClick={() => setEffort(i + 1)}
                    className={`flex-1 h-7 rounded-md text-[10px] font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white" : "bg-[#2a2a2d] text-gray-400 hover:bg-[#323235]"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Зоны и Длительность */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Зоны (мин)</label>
            <div className="grid grid-cols-5 gap-1 rounded-lg overflow-hidden border border-gray-800 shadow-sm">
              {zones.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className={`${zoneColors[idx]} py-1 text-center text-[9px] font-black text-[#1a1a1d]`}>{zoneLabels[idx]}</div>
                  <input
                    type="number" value={val} onChange={(e) => handleZoneChange(idx, e.target.value)}
                    className="bg-[#2a2a2d] text-white text-center py-1.5 text-xs outline-none border-t border-gray-800 no-spinner"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-[#141416] px-3 py-1.5 rounded-lg border border-gray-800/50">
              <span className="text-[9px] font-black text-gray-600 uppercase">Итого</span>
              <span className="text-sm font-bold text-blue-500">{formattedDuration}</span>
            </div>
          </div>

          {/* Короткий комментарий */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Комментарий</label>
            <textarea
              rows={1} value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 px-3 rounded-lg bg-[#2a2a2d] border border-gray-700 text-sm text-white outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="..."
            />
          </div>

          {/* Кнопки в самом низу */}
          <div className="flex gap-2 pt-2 border-t border-gray-800">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 bg-[#2a2a2d] text-gray-400 rounded-lg text-xs font-semibold hover:bg-[#323235]"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-[2] py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <Check size={14} /> Сохранить
            </button>
          </div>
        </form>
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </Dialog>
  );
}