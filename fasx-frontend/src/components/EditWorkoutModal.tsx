import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, MessageSquare } from "lucide-react";
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
  const formattedDuration = `${Math.floor(totalMin / 60)}ч ${totalMin % 60}м`;

  // Форматирование даты: Вторник, 16.12
  const formattedFullDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit' };
    const localeDate = new Intl.DateTimeFormat('ru-RU', options).format(d);
    // Делаем первую букву заглавной
    return localeDate.charAt(0).toUpperCase() + localeDate.slice(1);
  }, [date]);

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

  const handleSave = async () => {
    if (!name || !date || !type) {
      alert("Заполните обязательные поля");
      return;
    }

    const intensityZones = {
      zone1Min: parseInt(zones[0]) || 0,
      zone2Min: parseInt(zones[1]) || 0,
      zone3Min: parseInt(zones[2]) || 0,
      zone4Min: parseInt(zones[3]) || 0,
      zone5Min: parseInt(zones[4]) || 0,
    };

    const updatedWorkout = {
      name, date, comment, effort, feeling, type,
      duration: totalMin,
      distance: type !== "StrengthTraining" && type !== "Other" ? Number(distance) || null : null,
      ...intensityZones,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedWorkout),
      });

      if (res.ok) {
        const updated = await res.json();
        onSave?.(updated);
        onClose();
        toast.success("Сохранено");
      }
    } catch {
      toast.error("Ошибка соединения");
    }
  };

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto rounded-2xl w-[95%] max-w-xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">

        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1d]/95 backdrop-blur-md z-10 px-6 py-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            {!isEditing ? (
              <>
                <div className="text-blue-500 font-black text-2xl tracking-tight leading-none mb-1">
                  {formattedFullDate}
                </div>
                <Dialog.Title className="text-lg font-medium text-gray-400 italic">
                  {name || "Без названия"}
                </Dialog.Title>
              </>
            ) : (
              <Dialog.Title className="text-xl font-bold">Редактирование</Dialog.Title>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-500"><X size={24} /></button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Загрузка...</p>
          ) : !isEditing ? (
            /* --- РЕЖИМ ОБЗОРА --- */
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2d] p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Дистанция</span>
                  <div className="text-2xl font-black">{distance || "0"} <span className="text-sm font-normal text-gray-500">км</span></div>
                </div>
                <div className="bg-[#2a2a2d] p-4 rounded-xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Время</span>
                  <div className="text-2xl font-black">{formattedDuration}</div>
                </div>
                {pace && (
                  <div className="bg-blue-600/10 p-4 rounded-xl border border-blue-500/20 col-span-2 md:col-span-1">
                    <span className="text-blue-500 text-[10px] font-bold uppercase block mb-1">Темп</span>
                    <div className="text-2xl font-black text-blue-400">{pace}</div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Зоны интенсивности</span>
                <div className="flex h-10 w-full rounded-lg overflow-hidden bg-gray-900 shadow-inner border border-gray-800">
                  {zones.map((val, i) => {
                    const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                    return width > 0 ? (
                      <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full transition-all flex items-center justify-center text-[9px] font-black text-black/50`}>
                        {parseInt(val) > 5 ? zoneLabels[i] : ""}
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {zones.map((val, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[10px] font-bold text-gray-300">{val}м</div>
                      <div className={`w-full h-1 mt-1 rounded-full ${zoneColors[i]}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Самочувствие</span>
                  <span className="text-xl font-black text-green-500">{feeling || '-'}<span className="text-xs text-gray-600">/10</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Нагрузка</span>
                  <span className="text-xl font-black text-blue-500">{effort || '-'}<span className="text-xs text-gray-600">/10</span></span>
                </div>
              </div>

              {comment && (
                <div className="bg-[#2a2a2d]/30 p-5 rounded-xl border border-gray-800 border-dashed">
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase mb-2"><MessageSquare size={12}/> Заметки</div>
                  <p className="text-gray-300 italic leading-relaxed text-sm">"{comment}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- РЕЖИМ РЕДАКТИРОВАНИЯ --- */
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white outline-none border border-gray-700 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Дата</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white outline-none border border-gray-700 focus:border-blue-500 color-scheme-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Комментарий</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full p-2 rounded-lg bg-[#2a2a2d] text-white outline-none border border-gray-700 focus:border-blue-500" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-400 mb-2">Зоны (минуты)</label>
                <div className="grid grid-cols-5 gap-2">
                  {zones.map((val, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-xs text-gray-400 mb-1">{zoneLabels[i]}</span>
                      <input type="text" inputMode="numeric" value={val} onChange={(e) => { const u = [...zones]; u[i] = e.target.value; setZones(u); }} className="w-full text-center bg-[#2a2a2d] border border-gray-700 py-1.5 rounded-lg focus:border-blue-500 outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              {type !== "StrengthTraining" && type !== "Other" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Расстояние (км)</label>
                  <input type="number" step={0.1} value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-2 rounded-lg bg-[#2a2a2d] border border-gray-700 outline-none focus:border-blue-500" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Нагрузка (1-10)</label>
                  <div className="flex gap-1">
                    {[1,3,5,7,10].map(v => (
                      <button type="button" key={v} onClick={() => setEffort(v)} className={`flex-1 py-1 rounded ${effort === v ? 'bg-blue-600' : 'bg-[#2a2a2d]'}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Самочувствие (1-10)</label>
                  <div className="flex gap-1">
                    {[1,3,5,7,10].map(v => (
                      <button type="button" key={v} onClick={() => setFeeling(v)} className={`flex-1 py-1 rounded ${feeling === v ? 'bg-green-600' : 'bg-[#2a2a2d]'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="flex justify-end gap-2 mt-8">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-[#2a2a2d] text-gray-400 hover:bg-[#323235] text-xs font-bold uppercase tracking-widest transition-colors">{isEditing ? "Отмена" : "Закрыть"}</button>
            {isEditing && (
              <button onClick={handleSave} className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all">
                <Check size={16} /> Сохранить
              </button>
            )}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}