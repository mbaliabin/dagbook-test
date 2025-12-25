import React, { useEffect, useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Check, Ruler, Calendar, MessageSquare, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

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

export default function EditWorkoutModal({ workoutId, mode, isOpen, onClose, onSave }: EditWorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);

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
    if (!workoutId || !isOpen) return;

    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
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
      } catch (e) {
        toast.error("Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [workoutId, isOpen]);

  const totalMin = useMemo(() => zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0), [zones]);

  const pace = useMemo(() => {
    if (distance && totalMin && Number(distance) > 0) {
      const totalSec = totalMin * 60;
      const secPerKm = totalSec / Number(distance);
      const min = Math.floor(secPerKm / 60);
      const sec = Math.floor(secPerKm % 60);
      return `${min}:${sec < 10 ? '0' : ''}${sec} /км`;
    }
    return null;
  }, [distance, totalMin]);

  const formattedFullDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit' };
    const localeDate = new Intl.DateTimeFormat('ru-RU', options).format(d);
    return localeDate.charAt(0).toUpperCase() + localeDate.slice(1);
  }, [date]);

  const handleSave = async () => {
    const loadingToast = toast.loading("Сохранение...");
    const intensityZones = {
      zone1Min: parseInt(zones[0]) || 0, zone2Min: parseInt(zones[1]) || 0,
      zone3Min: parseInt(zones[2]) || 0, zone4Min: parseInt(zones[3]) || 0,
      zone5Min: parseInt(zones[4]) || 0,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, date, comment, effort, feeling, type, duration: totalMin, distance: Number(distance) || null, intensityZones }),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success("Обновлено", { id: loadingToast });
        onSave?.(updated);
        onClose();
      }
    } catch {
      toast.error("Ошибка сети", { id: loadingToast });
    }
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

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#1a1a1d]">
                <div className="min-w-0">
                  {!isEditing ? (
                    <div className="flex flex-col">
                      <span className="text-blue-500 text-sm font-black uppercase tracking-tight truncate">{formattedFullDate}</span>
                      <span className="text-[10px] text-gray-500 italic truncate uppercase font-bold tracking-widest">{name || "Без названия"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-600 rounded-full" />
                      <Dialog.Title className="text-xs font-black uppercase tracking-widest">Редактирование</Dialog.Title>
                    </div>
                  )}
                </div>
                <button onClick={onClose} className="p-1 text-gray-500 hover:text-white"><X size={22} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide pb-32">
                {loading ? (
                  <div className="h-40 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Загрузка данных...</div>
                ) : !isEditing ? (
                  /* --- ОБЗОР (VIEW) --- */
                  <div className="space-y-6">
                    {/* Метрики */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#2a2a2d] p-4 rounded-xl border border-gray-800 flex flex-col justify-center">
                        <span className="text-gray-500 text-[9px] font-bold uppercase mb-1">Дистанция</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black">{distance || "0"}</span>
                          <span className="text-gray-500 font-bold text-xs uppercase">км</span>
                        </div>
                      </div>
                      <div className="bg-[#2a2a2d] p-4 rounded-xl border border-gray-800 flex flex-col justify-center">
                        <span className="text-gray-500 text-[9px] font-bold uppercase mb-1">Время</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black">{Math.floor(totalMin/60)}ч {totalMin%60}м</span>
                        </div>
                      </div>
                      {pace && (
                        <div className="col-span-2 bg-blue-600/10 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between">
                          <span className="text-blue-500 text-[9px] font-bold uppercase tracking-widest">Средний темп</span>
                          <span className="text-lg font-black text-blue-400">{pace}</span>
                        </div>
                      )}
                    </div>

                    {/* Интенсивность */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Распределение интенсивности</h4>
                      <div className="flex h-8 w-full rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-inner">
                        {zones.map((val, i) => {
                          const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                          return width > 0 ? (
                            <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full transition-all flex items-center justify-center text-[8px] font-black text-black/40`}>
                              {parseInt(val) > 8 ? zoneLabels[i] : ""}
                            </div>
                          ) : null;
                        })}
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {zones.map((val, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`w-1 h-1 rounded-full ${zoneColors[i]}`}></div>
                            <span className="text-[10px] font-black text-gray-300">{val}м</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Состояние */}
                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-800/50">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full border-2 border-green-500/30 flex items-center justify-center text-sm font-black text-green-500 bg-green-500/5">{feeling || '-'}</div>
                         <span className="text-[9px] font-bold text-gray-500 uppercase leading-tight">Ваше<br/>состояние</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 flex items-center justify-center text-sm font-black text-blue-500 bg-blue-500/5">{effort || '-'}</div>
                         <span className="text-[9px] font-bold text-gray-500 uppercase leading-tight">Нагрузка<br/>(RPE)</span>
                      </div>
                    </div>

                    {comment && (
                      <div className="bg-[#2a2a2d]/30 p-4 rounded-xl border border-gray-800/50 border-dashed">
                        <div className="flex items-center gap-2 text-gray-500 mb-2"><MessageSquare size={12}/> <span className="text-[9px] font-black uppercase">Заметки</span></div>
                        <p className="text-gray-300 italic leading-snug text-xs">"{comment}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* --- ФОРМА РЕДАКТИРОВАНИЯ --- */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Название</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Дата</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 color-scheme-dark" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Дистанция (км)</label>
                      <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-lg font-black outline-none no-spinner" />
                    </div>

                    {/* Рейтинги 1-10 (Без скролла) */}
                    <div className="space-y-4">
                      {[
                        { label: 'Самочувствие', state: feeling, setter: setFeeling, color: 'bg-green-600' },
                        { label: 'Нагрузка (RPE)', state: effort, setter: setEffort, color: 'bg-blue-600' }
                      ].map((row, i) => (
                        <div key={i} className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">{row.label} <span className="text-white">{row.state || '-'}</span></label>
                          <div className="flex gap-1 justify-between">
                            {[...Array(10)].map((_, idx) => (
                              <button key={idx} type="button" onClick={() => row.setter(idx + 1)} className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${row.state === idx + 1 ? row.color : "bg-[#2a2a2d] text-gray-400"}`}>{idx + 1}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Зоны (минуты)</label>
                      <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                        {zones.map((val, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className={`${zoneColors[idx]} py-1 text-center text-[9px] font-black text-[#1a1a1d]`}>{zoneLabels[idx]}</div>
                            <input type="number" value={val} onChange={(e) => { const u = [...zones]; u[idx] = e.target.value; setZones(u); }} className="bg-[#2a2a2d] text-center py-2.5 text-sm outline-none border-t border-gray-800 no-spinner w-full focus:bg-[#323235]" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Комментарий</label>
                      <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none resize-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-[#1a1a1d] border-t border-gray-800 shrink-0 flex gap-2">
                <button onClick={onClose} className="flex-1 py-3.5 bg-[#2a2a2d] text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">Закрыть</button>
                {isEditing && (
                  <button onClick={handleSave} className="flex-[1.5] py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-900/20">
                    <Check size={16} strokeWidth={3} /> Сохранить
                  </button>
                )}
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>

        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } .color-scheme-dark { color-scheme: dark; }`}</style>
      </Dialog>
    </Transition>
  );
}