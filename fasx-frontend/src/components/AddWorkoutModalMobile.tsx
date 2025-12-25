import React, { useState, useMemo, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Check, Ruler, ChevronDown } from "lucide-react"; // Добавил ChevronDown для красоты
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
    if (!token) return toast.error("Вы не авторизованы");

    const loadingToast = toast.loading("Сохранение...");
    const workoutData = {
      name: title,
      date,
      comment,
      effort,
      feeling,
      type,
      duration,
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
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(workoutData),
      });
      if (response.ok) {
        onAddWorkout(await response.json());
        toast.success("Тренировка добавлена!", { id: loadingToast });
        onClose();
      } else { toast.error("Ошибка сохранения", { id: loadingToast }); }
    } catch (error) { toast.error("Ошибка сети", { id: loadingToast }); }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-[100]">
        <Transition.Child as={React.Fragment} enter="duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-150">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end sm:items-center justify-center">
          <Transition.Child as={React.Fragment} enter="duration-300 ease-out" enterFrom="translate-y-full sm:scale-95" enterTo="translate-y-0 sm:scale-100" leave="duration-200">
            <Dialog.Panel className="relative bg-[#1a1a1d] w-full sm:max-w-2xl h-[92vh] sm:h-auto rounded-t-[24px] sm:rounded-2xl border-t border-gray-800 flex flex-col text-white overflow-hidden">

              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
                <Dialog.Title className="text-sm font-bold tracking-tight uppercase tracking-widest text-gray-400">Новая тренировка</Dialog.Title>
                <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X size={22} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide pb-32">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Название</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Например: Длительный бег" className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Дата</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none color-scheme-dark" />
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Тип тренировки</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                      className="w-full p-3 pr-10 rounded-xl bg-[#2a2a2d] border border-gray-700 text-[13px] font-medium outline-none appearance-none cursor-pointer truncate transition-all focus:border-blue-500"
                    >
                      <option value="">Выберите тип...</option>
                      <optgroup label="Циклические" className="bg-[#1a1a1d] text-gray-400">
                        <option value="Running" className="text-white">Бег</option>
                        <option value="Bike" className="text-white">Велосипед</option>
                        <option value="XC_Skiing_Classic" className="text-white">Лыжи (Классика)</option>
                        <option value="XC_Skiing_Skate" className="text-white">Лыжи (Конёк)</option>
                        <option value="RollerSki_Classic" className="text-white">Лыжероллеры (Классика)</option>
                        <option value="RollerSki_Skate" className="text-white">Лыжероллеры (Конёк)</option>
                      </optgroup>
                      <optgroup label="Другое" className="bg-[#1a1a1d] text-gray-400">
                        <option value="StrengthTraining" className="text-white">Силовая тренировка</option>
                        <option value="Other" className="text-white">Другое</option>
                      </optgroup>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {(type !== "StrengthTraining" && type !== "Other" && type !== "") && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                      <Ruler size={14} /> Дистанция (км)
                    </label>
                    <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0.0" className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-white font-bold text-lg outline-none no-spinner" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                    Ваше самочувствие <span className="text-green-500 font-black">{feeling || '-'}</span>
                  </label>
                  <div className="flex gap-1 justify-between">
                    {[...Array(10)].map((_, i) => (
                      <button key={i} type="button" onClick={() => setFeeling(i + 1)} className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${feeling === i + 1 ? "bg-green-600 border-green-400" : "bg-[#2a2a2d] text-gray-400 active:bg-gray-700"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                    Воспринимаемая нагрузка (RPE) <span className="text-blue-500 font-black">{effort || '-'}</span>
                  </label>
                  <div className="flex gap-1 justify-between">
                    {[...Array(10)].map((_, i) => (
                      <button key={i} type="button" onClick={() => setEffort(i + 1)} className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${effort === i + 1 ? "bg-blue-600 border-blue-400" : "bg-[#2a2a2d] text-gray-400 active:bg-gray-700"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Распределение по зонам (мин)</label>
                  <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                    {zones.map((val, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className={`${zoneColors[idx]} py-1 text-center text-[9px] font-black text-[#1a1a1d]`}>{zoneLabels[idx]}</div>
                        <input type="number" value={val} onChange={(e) => handleZoneChange(idx, e.target.value)} placeholder="---" className="bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-gray-800 no-spinner w-full focus:bg-[#323235]" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-[#141416] px-4 py-2.5 rounded-xl border border-gray-800/50">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Итоговое время</span>
                    <span className="text-base font-bold text-blue-500 italic">{formattedDuration}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Комментарий к тренировке</label>
                  <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Как все прошло? Опишите детали..." className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none resize-none focus:border-gray-500" />
                </div>
              </form>

              <div className="p-4 bg-[#1a1a1d] border-t border-gray-800 shrink-0">
                <button type="submit" onClick={handleSubmit} className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20">
                  <Check size={16} strokeWidth={3} /> Сохранить данные
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>

        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } .color-scheme-dark { color-scheme: dark; }`}</style>
      </Dialog>
    </Transition>
  );
}