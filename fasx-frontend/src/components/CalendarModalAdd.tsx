import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Clock, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkout: (workout: any) => void;
  initialDate?: string | null;
}

export default function CalendarModalAdd({ isOpen, onClose, onAddWorkout, initialDate }: AddWorkoutModalProps) {
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
      setComment("");
      setEffort(null);
      setFeeling(null);
      setType("");
      setZones(["", "", "", "", ""]);
      setDistance("");
      setDate(initialDate || new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialDate]);

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
      // Дистанция только для циклической нагрузки
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-3xl w-full max-w-2xl z-[1002] text-white shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 scrollbar-hide animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X size={20} />
        </button>

        <Dialog.Title className="text-2xl font-black mb-8 text-white tracking-tight flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          Добавить тренировку
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Название</label>
              <input
                type="text"
                className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-white/5 text-white outline-none focus:border-blue-500/50 focus:bg-[#2e2e32] transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название тренировки"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Дата</label>
              <input
                type="date"
                className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-white/5 text-white outline-none focus:border-blue-500/50 transition-all color-scheme-dark"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Тип тренировки</label>
            <select
              className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-white/5 text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
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
              <optgroup label="Силовые и прочее">
                <option value="StrengthTraining">Силовая тренировка</option>
                <option value="Other">Другое</option>
              </optgroup>
            </select>
          </div>

          {(type !== "" && type !== "StrengthTraining" && type !== "Other") && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Ruler size={12} /> Дистанция (км)
              </label>
              <input
                type="number"
                step={0.1}
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="0.0"
                className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-blue-500/20 text-white font-black text-xl outline-none focus:border-blue-500 transition-all no-spinner"
              />
            </div>
          )}

          <div className="space-y-6 bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                Самочувствие <span className="text-green-500 font-bold">{feeling || '-'} / 10</span>
              </label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i}
                    onClick={() => setFeeling(i + 1)}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white shadow-lg" : "bg-[#323235] text-gray-500 hover:text-white"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                Нагрузка (RPE) <span className="text-blue-500 font-bold">{effort || '-'} / 10</span>
              </label>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <button
                    type="button" key={i}
                    onClick={() => setEffort(i + 1)}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white shadow-lg" : "bg-[#323235] text-gray-500 hover:text-white"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Зоны (мин)</label>
            <div className="grid grid-cols-5 gap-1 rounded-2xl overflow-hidden border border-white/5">
              {zones.map((val, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className={`${zoneColors[idx]} py-1 text-center text-[9px] font-black text-black/70`}>
                    {zoneLabels[idx]}
                  </div>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleZoneChange(idx, e.target.value)}
                    placeholder="0"
                    className="bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-white/5 focus:bg-[#323235] no-spinner"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-[#141416] px-4 py-3 rounded-2xl border border-white/5 mt-2">
              <div className="flex items-center gap-2 text-gray-500 uppercase tracking-widest text-[9px] font-black">
                <Clock size={14} /> Итоговое время
              </div>
              <span className="text-lg font-black text-blue-500">{formattedDuration}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
               <MessageSquare size={12} /> Комментарий
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#2a2a2d] border border-white/5 text-white outline-none focus:border-blue-500/50 transition-all resize-none text-sm"
              placeholder="Детали тренировки..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-white/5 text-gray-400 rounded-2xl hover:bg-white/10 text-xs font-bold uppercase tracking-widest"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20"
            >
              <Check size={16} /> Сохранить
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