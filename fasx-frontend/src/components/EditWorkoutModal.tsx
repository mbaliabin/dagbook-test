import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Ruler, Activity, Edit2, Eye } from "lucide-react";
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

export default function EditWorkoutModal({
  workoutId,
  mode,
  isOpen,
  onClose,
  onSave,
}: EditWorkoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        const data: Workout = await res.json();

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
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId, isOpen]);

  const totalDuration = useMemo(() => {
    return zones.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  }, [zones]);

  const formattedDuration = `${Math.floor(totalDuration / 60)}ч ${totalDuration % 60}м`;

  const handleSave = async () => {
    const loadingToast = toast.loading("Обновление...");
    const intensityZones = {
      zone1Min: parseInt(zones[0]) || 0,
      zone2Min: parseInt(zones[1]) || 0,
      zone3Min: parseInt(zones[2]) || 0,
      zone4Min: parseInt(zones[3]) || 0,
      zone5Min: parseInt(zones[4]) || 0,
    };

    const updatedWorkout = {
      name, date, comment, effort, feeling, type,
      duration: totalDuration,
      distance: type !== "StrengthTraining" && type !== "Other" ? Number(distance) || null : null,
      intensityZones,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedWorkout),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Изменения сохранены", { id: loadingToast });
        onSave?.(data);
        onClose();
      } else {
        toast.error("Ошибка при сохранении", { id: loadingToast });
      }
    } catch {
      toast.error("Ошибка соединения", { id: loadingToast });
    }
  };

  const zoneLabels = ["I1", "I2", "I3", "I4", "I5"];
  const zoneColors = ["bg-green-500", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[95vh] overflow-y-auto p-8 rounded-2xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800 scrollbar-hide">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-10 text-white tracking-tight flex items-center gap-3">
          {isEditing ? <Edit2 className="text-blue-500" /> : <Eye className="text-green-500" />}
          {isEditing ? "Редактировать тренировку" : "Просмотр тренировки"}
        </Dialog.Title>

        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Загрузка данных...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 font-medium">Ошибка: {error}</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (isEditing) handleSave(); }} className="space-y-8">

            {/* Название и Дата */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Название</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all ${!isEditing && "opacity-60 cursor-default"}`}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Дата</label>
                <input
                  type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all color-scheme-dark ${!isEditing && "opacity-60 cursor-default"}`}
                  required
                />
              </div>
            </div>

            {/* Дистанция */}
            {type !== "StrengthTraining" && type !== "Other" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                  <Ruler size={14} /> Дистанция (км)
                </label>
                <input
                  type="number" step={0.1} value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-[#2a2a2d] border border-blue-900/30 text-white font-bold text-lg outline-none focus:border-blue-500 transition-all no-spinner ${!isEditing && "opacity-60 cursor-default"}`}
                />
              </div>
            )}

            {/* Шкалы */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                  Самочувствие <span className="text-green-500 font-black text-sm">{feeling || '-'}</span>
                </label>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      type="button" key={i}
                      onClick={() => isEditing && setFeeling(i + 1)}
                      disabled={!isEditing}
                      className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${feeling === i + 1 ? "bg-green-600 text-white scale-105 shadow-lg border-green-400" : "bg-[#2a2a2d] text-gray-400 border border-transparent"} ${!isEditing && feeling !== i + 1 && "opacity-30"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                  Нагрузка <span className="text-blue-500 font-black text-sm">{effort || '-'}</span>
                </label>
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      type="button" key={i}
                      onClick={() => isEditing && setEffort(i + 1)}
                      disabled={!isEditing}
                      className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${effort === i + 1 ? "bg-blue-600 text-white scale-105 shadow-lg border-blue-400" : "bg-[#2a2a2d] text-gray-400 border border-transparent"} ${!isEditing && effort !== i + 1 && "opacity-30"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Зоны */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Зоны интенсивности (мин)</label>
              <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                {zones.map((val, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className={`${zoneColors[idx]} py-1.5 text-center text-[10px] font-black text-[#1a1a1d]`}>
                      {zoneLabels[idx]}
                    </div>
                    <input
                      type="number" value={val}
                      onChange={(e) => {
                        if (!isEditing) return;
                        const updated = [...zones];
                        updated[idx] = e.target.value;
                        setZones(updated);
                      }}
                      disabled={!isEditing}
                      className={`bg-[#2a2a2d] text-white text-center py-3 text-sm outline-none border-t border-gray-800 focus:bg-[#323235] no-spinner ${!isEditing && "opacity-60"}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center bg-[#141416] px-4 py-3 rounded-xl border border-gray-800/50">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Итоговое время</span>
                <span className="text-lg font-bold text-blue-500 tracking-tight">{formattedDuration}</span>
              </div>
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Комментарий</label>
              <textarea
                rows={3} value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isEditing}
                className={`w-full p-4 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all resize-none ${!isEditing && "opacity-60"}`}
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3 pt-8 border-t border-gray-800">
              <button
                type="button" onClick={onClose}
                className="px-6 py-3 bg-[#2a2a2d] text-gray-400 rounded-xl hover:bg-[#323235] transition-colors text-sm font-semibold"
              >
                {isEditing ? "Отмена" : "Закрыть"}
              </button>
              {isEditing && (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 text-sm font-bold active:scale-95"
                >
                  <Check size={18} /> Сохранить изменения
                </button>
              )}
            </div>
          </form>
        )}
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </Dialog>
  );
}