import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import {
  Loader2, Zap, Plus, Activity,
  Gauge, ChartBar, Target
} from "lucide-react";
import CalendarModalAdd from "./AddCalendarModalMobile";
import CalendarWorkoutDetails from "./EditWorkoutModalMobile";

dayjs.extend(isoWeek);
dayjs.locale("ru");

// --- Вспомогательные функции (оставлены без изменений) ---
const getDisplayType = (dbType: string = "") => {
  const t = dbType.toLowerCase();
  if (t.includes('ski') && t.includes('classic')) return "Лыжи / Классика";
  if (t.includes('ski') && (t.includes('skate') || t.includes('конь'))) return "Лыжи / Коньковый";
  if (t.includes('roller') && (t.includes('skate') || t.includes('конь'))) return "Лыжероллеры / Коньковый";
  if (t.includes('roller') && t.includes('classic')) return "Лыжероллеры / Классика";
  if (t.includes('imitation') || t.includes('имитация')) return "Бег / Имитация";
  if (t.includes('bike') || t.includes('вело')) return "Велосипед";
  if (t.includes('strength') || t.includes('силовая')) return "Силовая тренировка";
  if (t.includes('run') || t.includes('бег')) return "Бег";
  return "Другое";
};

const formatDuration = (totalMinutes: number) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
};

const calculatePace = (duration: number, distance: number) => {
  if (!distance || distance <= 0) return null;
  const totalSeconds = duration * 60;
  const secondsPerKm = totalSeconds / distance;
  const min = Math.floor(secondsPerKm / 60);
  const sec = Math.round(secondsPerKm % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

const getIntensityLabel = (w: any) => {
  const { zone3Min = 0, zone4Min = 0, zone5Min = 0, duration = 1 } = w;
  const intenseMin = zone3Min + zone4Min + zone5Min;
  if (intenseMin < duration * 0.15) {
    return { label: "I2 Восстановительная", color: "text-green-400", desc: "восстановление" };
  }
  const zones = [
    { id: "I3", min: zone3Min, label: "Интенсивная", color: "text-yellow-400", desc: "выносливость" },
    { id: "I4", min: zone4Min, label: "Высокоинтенсивная", color: "text-orange-400", desc: "порог / лактат" },
    { id: "I5", min: zone5Min, label: "Максимум", color: "text-red-500", desc: "пиковая нагрузка" }
  ];
  const primaryZone = zones.reduce((prev, current) => (prev.min > current.min) ? prev : current);
  return { label: `${primaryZone.id} ${primaryZone.label}`, color: primaryZone.color, desc: primaryZone.desc };
};

const activityStyles: any = {
  run: "bg-blue-500",
  ski: "bg-cyan-400",
  strength: "bg-purple-500",
  cycling: "bg-orange-500",
  default: "bg-gray-500"
};

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function CalendarMobile({ currentMonth }: { currentMonth: dayjs.Dayjs }) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [viewWorkoutId, setViewWorkoutId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWorkouts(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchWorkouts();
  }, [currentMonth]);

  const days = useMemo(() => {
    const startOfMonth = currentMonth.startOf("month");
    const startCalendar = startOfMonth.startOf("isoWeek");
    return Array.from({ length: 42 }, (_, i) => startCalendar.add(i, "day"));
  }, [currentMonth]);

  const trainingsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    workouts.forEach(w => {
      if (!w) return;
      const key = dayjs(w.date).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [workouts]);

  const selectedWorkouts = trainingsMap[selectedDate] || [];

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 bg-[#131316]">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Синхронизация...</span>
    </div>
  );

  return (
    <div className="flex flex-col bg-[#131316] animate-in fade-in duration-500 min-h-screen">

      {/* КАЛЕНДАРЬ */}
      <div className="p-3 bg-[#131316] border-b border-white/[0.03] sticky top-0 z-20 shadow-2xl">
        <div className="grid grid-cols-7 mb-2 text-center text-[9px] font-black text-gray-600 uppercase">
          {weekdays.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const dateStr = d.format("YYYY-MM-DD");
            const isCurrentMonth = d.month() === currentMonth.month();
            const isToday = d.isSame(dayjs(), 'day');
            const isSelected = selectedDate === dateStr;
            const dailyItems = trainingsMap[dateStr] || [];
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 ${isSelected ? "bg-blue-600 text-white shadow-lg scale-105 z-10" : "bg-white/[0.02]"} ${!isCurrentMonth && !isSelected ? "opacity-20" : ""}`}
              >
                <span className={`text-[12px] font-black ${isToday && !isSelected ? "text-blue-500" : ""}`}>{d.date()}</span>
                <div className="flex gap-0.5 mt-1 h-1">
                  {dailyItems.slice(0, 3).map((item: any, idx: number) => {
                    const t = (item.type || "").toLowerCase();
                    const color = activityStyles[t.includes("run") ? "run" : t.includes("ski") ? "ski" : t.includes("strength") ? "strength" : "default"];
                    return <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : color}`} />;
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* СПИСОК ТРЕНИРОВОК */}
      <div className="p-4 space-y-4 bg-[#0a0a0b] flex-grow pb-32 text-left text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h3 className="text-[14px] font-black uppercase italic leading-none tracking-tight">{dayjs(selectedDate).format("D MMMM")}</h3>
            <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1.5">{dayjs(selectedDate).format("dddd")}</span>
          </div>

          {/* ОБНОВЛЕННАЯ СЕРАЯ КНОПКА */}
          <button
            onClick={() => setModalAddOpen(true)}
            className="p-2.5 bg-[#1c1c1f] border border-white/[0.05] rounded-xl text-gray-400 shadow-sm active:scale-90 transition-all active:bg-[#252529]"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {selectedWorkouts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.03] rounded-3xl bg-white/[0.01]">
            <Target size={24} className="text-gray-800 mb-2" />
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">Отдых</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedWorkouts.map((w) => {
              const intensity = getIntensityLabel(w);
              const intenseMin = (w.zone3Min || 0) + (w.zone4Min || 0) + (w.zone5Min || 0);
              const pace = calculatePace(w.duration, w.distance);
              const baseTime = w.duration - intenseMin;
              const displayType = getDisplayType(w.type);

              return (
                <button
                  key={w.id}
                  onClick={() => { setViewWorkoutId(w.id); setViewModalOpen(true); }}
                  className="w-full relative overflow-hidden bg-[#131316] border border-white/[0.05] rounded-2xl p-4 active:scale-[0.98] transition-all flex flex-col gap-4 text-left shadow-xl"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${activityStyles[(w.type||"").toLowerCase().includes("run")?"run":"default"]}`} />

                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-white uppercase tracking-tight truncate leading-tight">
                          {w.name || displayType}
                        </span>
                        {intenseMin > 10 && <Zap size={10} className="text-orange-500 fill-orange-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1.5 leading-none">
                        {displayType}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end flex-shrink-0">
                      <div className="text-[16px] font-black text-white tabular-nums leading-none italic uppercase">
                        {w.distance
                          ? `${Number(w.distance) % 1 === 0 ? w.distance : Number(w.distance).toFixed(2).replace('.', ',')} км`
                          : formatDuration(w.duration)}
                      </div>
                      <span className={`text-[7px] font-black uppercase tracking-tighter leading-none mt-2 px-2 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] shadow-sm ${intensity.color}`}>
                        {intensity.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                     {w.avgHr && (
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-gray-200 tabular-nums">{w.avgHr}</span>
                          <span className="text-[7px] font-bold text-gray-600 uppercase mt-0.5 tracking-tighter">Пульс</span>
                       </div>
                     )}
                     {pace && (
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-sky-400 flex items-center gap-1 tabular-nums"><Gauge size={10} /> {pace}</span>
                          <span className="text-[7px] font-bold text-gray-600 uppercase mt-0.5 tracking-tighter">Темп</span>
                       </div>
                     )}
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.03]">
                    <div className="flex justify-between items-center px-0.5">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <ChartBar size={10} className="text-white" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-white">Зоны I1-I5</span>
                      </div>
                      <div className="flex gap-1.5">
                        {["I1", "I2", "I3", "I4", "I5"].map((z, i) => (
                          <span key={z} className={`text-[6px] font-bold uppercase ${[ "text-sky-400", "text-green-500", "text-yellow-400", "text-orange-500", "text-red-500" ][i]}`}>{z}</span>
                        ))}
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                      <div className="h-full bg-sky-400" style={{ width: `${Math.max(2, (baseTime * 0.4 / w.duration) * 100)}%` }} />
                      <div className="h-full bg-green-500" style={{ width: `${Math.max(2, (baseTime * 0.6 / w.duration) * 100)}%` }} />
                      {w.zone3Min > 0 && <div className="h-full bg-yellow-400" style={{ width: `${(w.zone3Min / w.duration) * 100}%` }} />}
                      {w.zone4Min > 0 && <div className="h-full bg-orange-500" style={{ width: `${(w.zone4Min / w.duration) * 100}%` }} />}
                      {w.zone5Min > 0 && <div className="h-full bg-red-600" style={{ width: `${(w.zone5Min / w.duration) * 100}%` }} />}
                    </div>

                    <div className="flex justify-between items-center px-0.5 mt-0.5">
                       <div className="flex items-center gap-1.5">
                         <div className="w-1 h-1 rounded-full bg-gray-600" />
                         <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tight italic">База: {formatDuration(baseTime)}</span>
                       </div>
                       <div className="flex items-center">
                         <span className="text-[7px] font-black text-white uppercase italic tracking-tighter bg-white/[0.05] px-2 py-0.5 rounded-sm flex items-center gap-1">
                           ЭФФЕКТ: <span className={`${intensity.color} text-[7px] underline decoration-white/10`}>{intensity.desc}</span>
                         </span>
                       </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <CalendarModalAdd isOpen={modalAddOpen} onClose={() => setModalAddOpen(false)} onAddWorkout={(nw) => { setWorkouts(p => [...p, nw]); setModalAddOpen(false); }} initialDate={selectedDate} />
      {viewWorkoutId && <CalendarWorkoutDetails workoutId={viewWorkoutId} isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} onSave={() => { window.location.reload(); }} />}
    </div>
  );
}