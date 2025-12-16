import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Trophy, Calendar, MessageSquare, Activity, Timer, Ruler, CheckCircle2 } from "lucide-react";
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
      setDate(new Date().toISOString().split('T')[0]); // По умолчанию сегодня
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

    const loadingToast = toast.loading("Создание тренировки...");

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
        toast.error("Ошибка при создании", { id: loadingToast });
        return;
      }

      const result = await response.json();
      toast.success("Тренировка добавлена! 🏆", { id: loadingToast });
      onAddWorkout(result);
      onClose();
    } catch (error) {
      toast.error("Ошибка соединения", { id: loadingToast });
    }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto rounded-3xl w-full max-w-2xl z-50 text-gray-200 shadow-2xl border border-gray-800 scrollbar-hide">
        {/* Кнопка закрытия */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          <Dialog.Title className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Trophy className="text-blue-500" /> Добавить тренировку
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Название и Дата */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Activity size={12}/> Название
                </label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Бег, Силовая..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Calendar size={12}/> Дата
                </label>
                <input
                  type="date"
                  className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white color-scheme-dark"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Тип тренировки */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Вид активности</label>
              <select
                className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white appearance-none cursor-pointer"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Выберите тип...</option>
                <option value="Running">🏃 Бег</option>
                <option value="XC_Skiing_Classic">🎿 Лыжи (Классика)</option>
                <option value="XC_Skiing_Skate">🎿 Лыжи (Конёк)</option>
                <option value="RollerSki_Classic">🛼 Роллеры (Классика)</option>
                <option value="RollerSki_Skate">🛼 Лыжероллеры (Конёк)</option>
                <option value="StrengthTraining">💪 Силовая</option>
                <option value="Bike">🚲 Велосипед</option>
                <option value="Other">🔘 Другое</option>
              </select>
            </div>

            {/* Нагрузка и Самочувствие (Стиль как на главной) */}
            <div className="grid gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                  <span>Воспринимаемая нагрузка</span>
                  <span className="text-blue-500 font-bold">{effort || 0}/10</span>
                </label>
                <div className="flex justify-between gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      type="button" key={i}
                      className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all border ${effort === i + 1 ? "bg-blue-600 border-blue-500 text-white" : "bg-[#0f0f0f] border-gray-800 text-gray-500 hover:border-gray-600"}`}
                      onClick={() => setEffort(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                  <span>Самочувствие</span>
                  <span className="text-green-500 font-bold">{feeling || 0}/10</span>
                </label>
                <div className="flex justify-between gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      type="button" key={i}
                      className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all border ${feeling === i + 1 ? "bg-green-600 border-green-500 text-white" : "bg-[#0f0f0f] border-gray-800 text-gray-500 hover:border-gray-600"}`}
                      onClick={() => setFeeling(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Зоны интенсивности */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Timer size={12}/> Интенсивность (мин)
              </label>
              <div className="grid grid-cols-5 gap-3">
                {zones.map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className={`h-1.5 w-full rounded-full ${zoneColors[idx]} opacity-80`} />
                    <input
                      type="number"
                      placeholder={zoneLabels[idx]}
                      className="w-full text-center bg-[#0f0f0f] border border-gray-800 py-3 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all no-spinner"
                      value={zones[idx]}
                      onChange={(e) => handleZoneChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Время и Дистанция */}
            <div className="grid md:grid-cols-2 gap-6 bg-[#0f0f0f] p-4 rounded-2xl border border-gray-800/50">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-gray-600 tracking-tighter">Общее время</p>
                <p className="text-xl font-bold text-white tracking-tight">{formattedDuration}</p>
              </div>

              {(type !== "StrengthTraining" && type !== "Other") && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-600 tracking-tighter flex items-center gap-1">
                    <Ruler size={10}/> Дистанция (км)
                  </label>
                  <input
                    type="number" step={0.1}
                    className="w-full bg-[#1a1a1d] border border-gray-800 p-2 rounded-lg focus:border-blue-500 outline-none transition-all text-white font-bold"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <MessageSquare size={12}/> Комментарий
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white resize-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Как прошла тренировка?..."
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-transparent border border-gray-800 text-gray-400 font-bold rounded-2xl hover:bg-gray-800 transition-all"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-2 px-12 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 size={18} /> Сохранить
              </button>
            </div>
          </form>
        </div>
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </Dialog>
  );
}