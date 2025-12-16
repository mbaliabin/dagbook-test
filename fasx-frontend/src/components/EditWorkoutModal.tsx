import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Calendar, MessageSquare, Edit2, Eye, Activity } from "lucide-react";
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

  // Состояния для формы
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

  // Форматирование даты для режима просмотра
  const formattedFullDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit' };
    const localeDate = new Intl.DateTimeFormat('ru-RU', options).format(d);
    // Делаем первую букву заглавной (Вторник 16.12)
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[92vh] overflow-y-auto rounded-3xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">

        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1d]/90 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            {!isEditing ? (
              /* --- ЗАГОЛОВОК ПРИ ПРОСМОТРЕ --- */
              <div className="space-y-0.5">
                <div className="text-blue-500 text-2xl font-black tracking-tight">
                  {formattedFullDate}
                </div>
                <Dialog.Title className="text-gray-400 font-medium tracking-tight italic">
                  {name || "Без названия"}
                </Dialog.Title>
              </div>
            ) : (
              /* --- ЗАГОЛОВОК ПРИ РЕДАКТИРОВАНИИ (БЕЗ ИЗМЕНЕНИЙ) --- */
              <>
                <div className="flex items-center gap-2 text-blue-500 mb-0.5">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{date}</span>
                </div>
                <Dialog.Title className="text-xl font-black tracking-tight">Редактирование</Dialog.Title>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400"><X size={24} /></button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse font-medium">Загрузка данных...</div>
          ) : !isEditing ? (
            /* --- ОБЗОР (VIEW) --- */
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2">Дистанция</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{distance || "0"}</span>
                    <span className="text-gray-400 font-bold text-sm">км</span>
                  </div>
                </div>
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2">Время</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{Math.floor(totalMin/60)}ч {totalMin%60}м</span>
                  </div>
                </div>
                {pace && (
                  <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20">
                    <span className="text-blue-500 text-[10px] font-bold uppercase block mb-2">Средний темп</span>
                    <span className="text-2xl font-black text-blue-400">{pace}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Интенсивность</h4>
                <div className="flex h-10 w-full rounded-xl overflow-hidden bg-gray-900 shadow-inner">
                  {zones.map((val, i) => {
                    const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                    return width > 0 ? (
                      <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full transition-all flex items-center justify-center text-[9px] font-black text-black/50`}>
                        {parseInt(val) > 5 ? zoneLabels[i] : ""}
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-5 gap-2 px-1">
                  {zones.map((val, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${zoneColors[i]} mx-auto mb-1`}></div>
                      <div className="text-[10px] font-bold text-gray-300">{val}м</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-800">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center text-lg font-black text-green-500">{feeling || '-'}</div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Самочувствие</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-lg font-black text-blue-500">{effort || '-'}</div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Нагрузка</span>
                </div>
              </div>

              {comment && (
                <div className="bg-[#2a2a2d]/50 p-6 rounded-2xl border border-gray-800 border-dashed">
                  <div className="flex items-center gap-2 text-gray-500 mb-3"><MessageSquare size={14}/> <span className="text-[10px] font-bold uppercase">Комментарий</span></div>
                  <p className="text-gray-300 italic leading-relaxed text-sm">"{comment}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- ФОРМА РЕДАКТИРОВАНИЯ --- */
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Название</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Дата</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 color-scheme-dark" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-500 uppercase">Дистанция (км)</label>
                <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-lg font-black outline-none focus:border-blue-500 no-spinner" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">Самочувствие <span className="text-green-500">{feeling}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setFeeling(i + 1)} className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white" : "bg-[#2a2a2d] text-gray-500 hover:bg-[#323235]"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">Нагрузка <span className="text-blue-500">{effort}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setEffort(i + 1)} className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white" : "bg-[#2a2a2d] text-gray-500 hover:bg-[#323235]"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Зоны (минуты)</label>
                <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                  {zones.map((val, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className={`${zoneColors[idx]} py-1 text-center text-[9px] font-black text-[#1a1a1d]`}>{zoneLabels[idx]}</div>
                      <input type="number" value={val} onChange={(e) => { const u = [...zones]; u[idx] = e.target.value; setZones(u); }} className="bg-[#2a2a2d] text-white text-center py-2.5 text-sm outline-none border-t border-gray-800 no-spinner" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Комментарий</label>
                <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
            </form>
          )}

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-800">
             <button onClick={onClose} className="px-6 py-3 bg-[#2a2a2d] text-gray-400 rounded-xl hover:bg-[#323235] font-bold text-xs uppercase tracking-widest">Закрыть</button>
             {isEditing && (
               <button onClick={handleSave} className="bg-blue-600 px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                 <Check size={16}/> Сохранить
               </button>
             )}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}