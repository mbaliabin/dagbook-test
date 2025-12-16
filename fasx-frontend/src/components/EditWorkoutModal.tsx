import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Activity, Edit2, Eye, Calendar, Clock, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

// ... (интерфейсы Workout и EditWorkoutModalProps остаются прежними)

export default function EditWorkoutModal({ workoutId, mode, isOpen, onClose, onSave }: EditWorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);

  // Состояния для редактирования
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
        const data: Workout = await res.json();
        setWorkout(data);
        // Заполняем стейты для редактирования
        setName(data.name);
        setDate(data.date.slice(0, 10));
        setComment(data.comment || "");
        setEffort(data.effort ?? null);
        setFeeling(data.feeling ?? null);
        setType(data.type);
        setZones([(data.zone1Min ?? 0).toString(), (data.zone2Min ?? 0).toString(), (data.zone3Min ?? 0).toString(), (data.zone4Min ?? 0).toString(), (data.zone5Min ?? 0).toString()]);
        setDistance(data.distance ?? "");
      } catch (e) { toast.error("Ошибка загрузки"); } finally { setLoading(false); }
    };
    fetchWorkout();
  }, [workoutId, isOpen]);

  const totalMin = useMemo(() => zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0), [zones]);

  // Расчет темпа для "Обзора"
  const pace = useMemo(() => {
    if (distance && totalMin) {
      const totalSec = totalMin * 60;
      const secPerKm = totalSec / Number(distance);
      const min = Math.floor(secPerKm / 60);
      const sec = Math.floor(secPerKm % 60);
      return `${min}:${sec < 10 ? '0' : ''}${sec} /км`;
    }
    return null;
  }, [distance, totalMin]);

  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto rounded-3xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">

        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1d]/80 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{date}</span>
            </div>
            <Dialog.Title className="text-2xl font-black tracking-tight">{name || "Без названия"}</Dialog.Title>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse font-medium">Загрузка данных тренировки...</div>
          ) : !isEditing ? (
            /* --- РЕЖИМ ОБЗОРА (VIEW) --- */
            <div className="space-y-10">

              {/* Grid с показателями */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2">Дистанция</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{distance || "0"}</span>
                    <span className="text-gray-500 font-bold">км</span>
                  </div>
                </div>
                <div className="bg-[#2a2a2d] p-5 rounded-2xl border border-gray-800">
                  <span className="text-gray-500 text-[10px] font-bold uppercase block mb-2">Длительность</span>
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

              {/* Зоны как визуальный график */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Распределение нагрузки</h4>
                <div className="flex h-12 w-full rounded-xl overflow-hidden shadow-inner bg-gray-900">
                  {zones.map((val, i) => {
                    const width = totalMin > 0 ? (parseInt(val) / totalMin) * 100 : 0;
                    return width > 0 ? (
                      <div key={i} style={{ width: `${width}%` }} className={`${zoneColors[i]} h-full transition-all duration-500 flex items-center justify-center text-[10px] font-black text-black/50`}>
                        {val > 5 ? zoneLabels[i] : ""}
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {zones.map((val, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${zoneColors[i]} mx-auto mb-1`}></div>
                      <div className="text-[10px] font-bold text-white">{val} мин</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Самочувствие и Нагрузка (Круговые или полоски) */}
              <div className="grid grid-cols-2 gap-8 py-4 border-y border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                    <span className="text-xl font-black text-green-500">{feeling || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Состояние</span>
                    <span className="text-sm font-bold">Самочувствие</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                    <span className="text-xl font-black text-blue-500">{effort || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Нагрузка</span>
                    <span className="text-sm font-bold">RPE шкала</span>
                  </div>
                </div>
              </div>

              {/* Комментарий */}
              {comment && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageSquare size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Заметки о тренировке</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic">"{comment}"</p>
                </div>
              )}
            </div>
          ) : (
            /* --- РЕЖИМ РЕДАКТИРОВАНИЯ (Твой текущий UI) --- */
            <div className="space-y-8">
               {/* Здесь оставляем тот же код формы, что был выше в AddWorkoutModal */}
               {/* Название, Дата, Дистанция, Шкалы, Зоны... */}
               <p className="text-gray-500 text-sm text-center">Форма редактирования доступна</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-12 pt-8 border-t border-gray-800">
            {!isEditing ? (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#2a2a2d] text-gray-400 rounded-xl hover:bg-[#323235] font-bold text-sm"
              >
                Закрыть
              </button>
            ) : (
              <>
                <button onClick={onClose} className="px-6 py-3 text-gray-400 font-bold text-sm">Отмена</button>
                <button onClick={handleSave} className="bg-blue-600 px-10 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                   <Check size={18}/> Сохранить
                </button>
              </>
            )}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}