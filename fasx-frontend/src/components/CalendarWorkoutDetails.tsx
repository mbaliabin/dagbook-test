import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Calendar, MessageSquare, Edit2, Trash2, Clock } from "lucide-react";
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

interface Props {
  workoutId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedWorkout: Workout | null) => void;
}

// Экспорт по умолчанию для корректного импорта в Calendar.tsx
export default function CalendarWorkoutDetails({ workoutId, isOpen, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [localMode, setLocalMode] = useState<"view" | "edit">("view");

  // Состояния для формы
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [effort, setEffort] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [zones, setZones] = useState(["0", "0", "0", "0", "0"]);
  const [distance, setDistance] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) setLocalMode("view");
  }, [isOpen]);

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
        setName(data.name || "");
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

  const isEditing = localMode === "edit";
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
        body: JSON.stringify({
            name, date, comment, effort, feeling, type,
            duration: totalMin,
            distance: Number(distance) || null,
            intensityZones
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success("Обновлено", { id: loadingToast });
        onSave?.(updated);
        setLocalMode("view");
      }
    } catch {
      toast.error("Ошибка сети", { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить тренировку?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        toast.success("Удалено");
        onSave?.(null);
        onClose();
      }
    } catch { toast.error("Ошибка удаления"); }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    /* ИЗМЕНЕНО: z-50 -> z-[1001] для перекрытия полноэкранного календаря */
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[92vh] overflow-y-auto rounded-3xl w-[95%] max-w-2xl z-[1002] text-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 scrollbar-hide animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1d]/95 backdrop-blur-md z-10 px-6 md:px-8 py-5 border-b border-white/5 flex justify-between items-center">
          <div>
            {!isEditing ? (
              <div className="space-y-0.5">
                <div className="text-blue-500 text-xl md:text-2xl font-black tracking-tight uppercase">{formattedFullDate}</div>
                <Dialog.Title className="text-gray-400 text-xs font-bold uppercase tracking-widest italic">{name || "Без названия"}</Dialog.Title>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-blue-500 mb-0.5">
                  <Calendar size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{date}</span>
                </div>
                <Dialog.Title className="text-xl font-black uppercase tracking-tight">Редактирование</Dialog.Title>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && !loading && (
               <button onClick={() => setLocalMode("edit")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl transition-all hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                 <Edit2 size={14}/> Изменить
               </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X size={24} /></button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Загрузка данных</span>
            </div>
          ) : !isEditing ? (
            /* --- РЕЖИМ ПРОСМОТРА --- */
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Дистанция</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tabular-nums">{distance || "0"}</span>
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">км</span>
                  </div>
                </div>
                <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest block mb-2">Время</span>
                  <div className="flex items-baseline gap-1 font-black text-white tabular-nums">
                    <span className="text-3xl">{Math.floor(totalMin/60)}</span><span className="text-xs text-gray-500 ml-0.5 mr-1.5 uppercase font-bold">ч</span>
                    <span className="text-3xl">{totalMin%60}</span><span className="text-xs text-gray-500 ml-0.5 uppercase font-bold">м</span>
                  </div>
                </div>
                {pace && (
                  <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20">
                    <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest block mb-2">Средний темп</span>
                    <span className="text-2xl font-black text-blue-400 tabular-nums">{pace}</span>
                  </div>
                )}
              </div>

              {/* График зон */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Распределение интенсивности</h4>
                    <span className="text-[10px] font-bold text-gray-400">{totalMin} мин</span>
                </div>
                <div className="flex h-12 w-full rounded-2xl overflow-hidden bg-black/40 p-1 border border-white/5">
                  {zones.map((val, i) => {
                    const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                    return width > 0 ? (
                      <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full transition-all flex items-center justify-center text-[10px] font-black text-black/40`}>
                        {parseInt(val) > 5 ? zoneLabels[i] : ""}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Самочувствие / Нагрузка */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                   <div className="w-12 h-12 rounded-full border-2 border-green-500/30 flex items-center justify-center text-xl font-black text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">{feeling || '-'}</div>
                   <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Самочувствие</span>
                       <span className="text-[11px] font-bold text-gray-300">Состояние тела</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl">
                   <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center text-xl font-black text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">{effort || '-'}</div>
                   <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Нагрузка</span>
                       <span className="text-[11px] font-bold text-gray-300">Уровень RPE</span>
                   </div>
                </div>
              </div>

              {comment && (
                <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/30" />
                  <div className="flex items-center gap-2 text-gray-500 mb-3 uppercase tracking-widest text-[9px] font-black">
                      <MessageSquare size={12}/> Комментарий
                  </div>
                  <p className="text-gray-300 italic leading-relaxed text-sm">"{comment}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- РЕЖИМ РЕДАКТИРОВАНИЯ --- */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Название</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-white/5 text-sm outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Дата</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-white/5 text-sm outline-none focus:border-blue-500 color-scheme-dark" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Дистанция (км)</label>
                <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3.5 rounded-2xl bg-[#2a2a2d] border border-blue-500/20 text-xl font-black outline-none focus:border-blue-500 no-spinner" />
              </div>

              {/* Редактирование Самочувствие/Нагрузка */}
              <div className="space-y-6 bg-black/20 p-5 rounded-3xl border border-white/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">Самочувствие <span className="text-green-500">{feeling}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setFeeling(i + 1)} className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">Нагрузка <span className="text-blue-500">{effort}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setEffort(i + 1)} className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Зоны (минуты)</label>
                <div className="grid grid-cols-5 gap-1 rounded-2xl overflow-hidden border border-white/5">
                  {zones.map((val, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className={`${zoneColors[idx]} py-1.5 text-center text-[9px] font-black text-black/50`}>{zoneLabels[idx]}</div>
                      <input type="number" value={val} onChange={(e) => { const u = [...zones]; u[idx] = e.target.value; setZones(u); }} className="bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-white/5 no-spinner focus:bg-[#323235]" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center bg-blue-600/10 px-4 py-3 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-500 uppercase text-[9px] font-black">
                        <Clock size={14} /> Общее время
                    </div>
                    <span className="text-lg font-black">{totalMin} мин</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Комментарий</label>
                <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 rounded-2xl bg-[#2a2a2d] border border-white/5 text-sm outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner" placeholder="Опишите ваши впечатления..." />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-white/5">
             <div className="w-full md:w-auto">
               {isEditing && (
                 <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 text-[10px] font-black uppercase tracking-widest group">
                   <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> Удалить тренировку
                 </button>
               )}
             </div>
             <div className="flex gap-3 w-full md:w-auto">
               <button onClick={onClose} className="flex-1 md:flex-none px-8 py-3.5 bg-white/5 text-gray-400 rounded-2xl hover:bg-white/10 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Закрыть</button>
               {isEditing && (
                 <button onClick={handleSave} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                   <Check size={16}/> Сохранить изменения
                 </button>
               )}
             </div>
          </div>
        </div>
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </Dialog>
  );
}