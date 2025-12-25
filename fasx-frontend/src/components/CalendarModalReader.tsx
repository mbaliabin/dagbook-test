import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Calendar, MessageSquare, Edit2, Activity, Trash2, Smile, Zap } from "lucide-react";
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
  onSave?: (updatedWorkout: Workout | null) => void;
}

export default function EditWorkoutModal({ workoutId, mode: initialMode, isOpen, onClose, onSave }: EditWorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);

  // Состояния формы
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [effort, setEffort] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const [type, setType] = useState("");
  const [zones, setZones] = useState(["0", "0", "0", "0", "0"]);
  const [distance, setDistance] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) setIsEditing(initialMode === "edit");
  }, [initialMode, isOpen]);

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
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(d)
      .replace(/^\w/, (c) => c.toUpperCase());
  }, [date]);

  const handleSave = async () => {
    const loadingToast = toast.loading("Сохранение...");
    const payload = {
      name, date, comment, effort, feeling, type,
      duration: totalMin,
      distance: Number(distance) || null,
      intensityZones: {
        zone1Min: parseInt(zones[0]) || 0,
        zone2Min: parseInt(zones[1]) || 0,
        zone3Min: parseInt(zones[2]) || 0,
        zone4Min: parseInt(zones[3]) || 0,
        zone5Min: parseInt(zones[4]) || 0,
      }
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success("Обновлено", { id: loadingToast });
        onSave?.(updated);
        setIsEditing(false);
        setWorkout(updated);
      }
    } catch {
      toast.error("Ошибка сети", { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить эту тренировку?")) return;
    const loadingToast = toast.loading("Удаление...");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Удалено", { id: loadingToast });
        onSave?.(null);
        onClose();
      }
    } catch { toast.error("Ошибка удаления", { id: loadingToast }); }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />
      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[92vh] overflow-y-auto rounded-3xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">

        {/* HEADER */}
        <div className="sticky top-0 bg-[#1a1a1d]/90 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            {!isEditing ? (
              <div className="space-y-0.5">
                <div className="text-blue-500 text-2xl font-black tracking-tight">{formattedFullDate}</div>
                <div className="text-gray-400 font-medium italic">{workout?.name || "Без названия"}</div>
              </div>
            ) : (
              <div className="text-xl font-black uppercase tracking-widest">Редактирование</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl transition-all border border-blue-500/20 text-xs font-bold uppercase"><Edit2 size={14} /> Изменить</button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><X size={24} /></button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse uppercase tracking-widest text-xs">Загрузка данных...</div>
          ) : !isEditing ? (
            /* --- ПРОСМОТР --- */
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2 tracking-widest">Дистанция</span>
                  <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">{distance || "0"}</span><span className="text-gray-400 font-bold text-sm">км</span></div>
                </div>
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2 tracking-widest">Время</span>
                  <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">{Math.floor(totalMin/60)}ч {totalMin%60}м</span></div>
                </div>
                {pace && (
                  <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20">
                    <span className="text-blue-500 text-[10px] font-bold uppercase block mb-2 tracking-widest">Темп</span>
                    <span className="text-2xl font-black text-blue-400">{pace}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Интенсивность</h4>
                <div className="flex h-10 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  {zones.map((val, i) => {
                    const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                    return width > 0 ? (
                      <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full flex items-center justify-center text-[9px] font-black text-black/50`}>{parseInt(val) > 8 ? zoneLabels[i] : ""}</div>
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-5 gap-2 px-1">
                  {zones.map((val, i) => (
                    <div key={i} className="text-center"><div className={`w-1.5 h-1.5 rounded-full ${zoneColors[i]} mx-auto mb-1`}></div><div className="text-[10px] font-bold text-gray-300">{val}м</div></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-800/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl border border-green-500/20 flex items-center justify-center text-lg font-black text-green-500 bg-green-500/5">{feeling || '-'}</div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Самочувствие</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl border border-blue-500/20 flex items-center justify-center text-lg font-black text-blue-500 bg-blue-500/5">{effort || '-'}</div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Нагрузка</span>
                </div>
              </div>

              {comment && (
                <div className="bg-[#2a2a2d]/30 p-6 rounded-2xl border border-gray-800 border-dashed">
                  <p className="text-gray-300 italic text-sm">"{comment}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- РЕДАКТИРОВАНИЕ --- */
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Название</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 shadow-inner" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Дата</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 color-scheme-dark shadow-inner" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2"><Ruler size={12}/> Дистанция (км)</label>
                <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-xl font-black outline-none focus:border-blue-500 no-spinner shadow-inner" />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">Самочувствие <span className="text-green-500 font-black">{feeling}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setFeeling(i + 1)} className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-[#2a2a2d] text-gray-500 hover:bg-[#323235]"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">Нагрузка (RPE) <span className="text-blue-500 font-black">{effort}</span></label>
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setEffort(i + 1)} className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "bg-[#2a2a2d] text-gray-500 hover:bg-[#323235]"}`}>{i + 1}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Зоны интенсивности</label>
                <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800 shadow-inner">
                  {zones.map((val, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className={`${zoneColors[idx]} py-1.5 text-center text-[9px] font-black text-[#1a1a1d]`}>{zoneLabels[idx]}</div>
                      <input type="number" value={val} onChange={(e) => { const u = [...zones]; u[idx] = e.target.value; setZones(u); }} className="bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-gray-800 no-spinner" />
                    </div>
                  ))}
                </div>
              </div>

              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-sm outline-none focus:border-blue-500 transition-all resize-none shadow-inner" placeholder="Комментарий..." />
            </form>
          )}

          {/* FOOTER */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-800">
             <div>
                {isEditing && (
                  <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 text-[10px] font-bold uppercase tracking-widest"><Trash2 size={14} /> Удалить</button>
                )}
             </div>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-3 bg-[#2a2a2d] text-gray-400 rounded-xl hover:bg-[#323235] font-bold text-[10px] uppercase tracking-widest">Закрыть</button>
                {isEditing && (
                  <button onClick={handleSave} className="bg-blue-600 px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"><Check size={16}/> Сохранить</button>
                )}
             </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}