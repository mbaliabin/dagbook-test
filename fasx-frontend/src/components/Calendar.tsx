import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import { Activity, Plus, Loader2, Zap, Dumbbell, BarChart3, Clock } from "lucide-react";
import CalendarModalAdd from "./CalendarModalAdd";
import CalendarWorkoutDetails from "./CalendarWorkoutDetails";

dayjs.extend(isoWeek);
dayjs.locale("ru");

const activityStyles: any = {
  run: { dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  ski: { dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" },
  strength: { dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" },
};

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface TrainingCalendarProps {
  currentMonth: dayjs.Dayjs;
  isMaximized?: boolean;
}

export default function TrainingCalendar({ currentMonth, isMaximized }: TrainingCalendarProps) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  }, []);

  const startOfMonth = currentMonth.startOf("month");
  const monthValue = currentMonth.month();
  const startCalendar = startOfMonth.startOf("isoWeek");

  const days = Array.from({ length: 42 }, (_, i) => startCalendar.add(i, "day"));

  const trainings: Record<string, any[]> = {};
  workouts.forEach(w => {
    if (!w) return;
    const key = dayjs(w.date).format("YYYY-MM-DD");
    if (!trainings[key]) trainings[key] = [];
    trainings[key].push(w);
  });

  const stats: Record<number, any> = {};
  workouts.forEach(w => {
    if (!w) return;
    const wNum = dayjs(w.date).isoWeek();
    if (!stats[wNum]) {
      stats[wNum] = { distance: 0, sessions: 0, intense: 0, strength: 0, totalDuration: 0 };
    }
    const type = (w.type || "").toLowerCase();
    const isStrength = type.includes("strength") || type.includes("сила");
    const intenseMinutes = (w.zone3Min || 0) + (w.zone4Min || 0) + (w.zone5Min || 0);
    const isIntense = intenseMinutes > 0 && !isStrength;

    stats[wNum].distance += w.distance ?? 0;
    stats[wNum].sessions += 1;
    stats[wNum].totalDuration += w.duration || 0;
    if (isStrength) stats[wNum].strength += 1;
    if (isIntense) stats[wNum].intense += 1;
  });

  const weeksInCalendar = Array.from(new Set(days.map(d => d.isoWeek()))).slice(0, 6);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 bg-[#1c1c1f] rounded-[1.5rem] border border-white/[0.05]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Загрузка данных...</span>
    </div>
  );

  return (
    <div className={`w-full bg-[#1c1c1f] transition-all duration-500 flex flex-col border border-white/[0.05] shadow-2xl ${
      isMaximized ? "h-full rounded-2xl" : "rounded-[1.5rem] overflow-hidden"
    }`}>

      {/* ГРИД КОНТЕЙНЕР */}
      <div
        className="grid grid-cols-[135px_repeat(7,1fr)] bg-[#1c1c1f] flex-grow overflow-hidden"
        style={isMaximized ? { gridTemplateRows: 'auto repeat(6, 1fr)' } : {}}
      >
        {/* ЗАГОЛОВКИ */}
        <div className="py-3 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] border-b border-r border-white/[0.05] bg-black/10 shrink-0">Аналитика</div>
        {weekdays.map(d => (
          <div key={d} className="py-3 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] border-b border-r border-white/[0.05] bg-black/10 shrink-0">{d}</div>
        ))}

        {weeksInCalendar.map(weekNum => {
          const s = stats[weekNum] || { distance: 0, sessions: 0, intense: 0, strength: 0, totalDuration: 0 };
          const weekDays = days.filter(d => d.isoWeek() === weekNum);

          return (
            <React.Fragment key={weekNum}>
              {/* ПАНЕЛЬ АНАЛИТИКИ НЕДЕЛИ */}
              <div className={`border-r border-b border-white/[0.08] p-4 flex flex-col justify-center gap-2 transition-colors ${
                isMaximized ? "bg-[#161619] h-full" : "bg-[#1e1e22] min-h-[140px]"
              }`}>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-1 mb-1">
                    <span className="text-[10px] text-blue-500 font-black tracking-widest uppercase">Нед {weekNum}</span>
                    <BarChart3 size={12} className="text-gray-600" />
                </div>
                <div className={isMaximized ? "space-y-3" : "space-y-2"}>
                    <div className="flex flex-col">
                        <span className={`font-black text-white tracking-tighter tabular-nums leading-none transition-all ${isMaximized ? "text-xl" : "text-lg"}`}>
                            {s.distance > 0 ? s.distance.toFixed(1) : "0"}<span className="text-[9px] ml-0.5 text-gray-500 font-normal tracking-normal">КМ</span>
                        </span>
                        <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Дистанция</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-black text-blue-400 tracking-tighter tabular-nums leading-none transition-all ${isMaximized ? "text-xl" : "text-lg"}`}>
                            {Math.floor(s.totalDuration / 60)}<span className="text-[9px] font-normal text-gray-500 mx-0.5">ч</span>{s.totalDuration % 60}<span className="text-[9px] font-normal text-gray-500">м</span>
                        </span>
                        <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Время</span>
                    </div>
                </div>
              </div>

              {/* ЯЧЕЙКИ ДНЕЙ */}
              {weekDays.map(d => {
                const dateStr = d.format("YYYY-MM-DD");
                const items = trainings[dateStr] || [];
                const isCurrentMonth = d.month() === monthValue;
                const isToday = d.isSame(dayjs(), 'day');

                return (
                  <div key={dateStr} className={`
                    group relative transition-all duration-300 border-r border-b border-white/[0.05] p-2 flex flex-col
                    ${isMaximized ? "h-full overflow-hidden" : "min-h-[140px]"}
                    ${!isCurrentMonth ? "bg-black/20 opacity-30" : "bg-[#1c1c1f] hover:bg-white/[0.01]"}
                  `}>
                    <div className="flex justify-between items-center mb-2 text-[11px] font-black shrink-0">
                        <span className={isToday ? "text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md" : isCurrentMonth ? "text-gray-400" : "text-gray-700"}>
                          {d.date()}
                        </span>
                    </div>

                    {/* КОНТЕЙНЕР ТРЕНИРОВОК СО СКРОЛЛОМ */}
                    <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 custom-scrollbar-mini h-0 min-h-0">
                      {items.map(e => {
                        const type = (e.type || "").toLowerCase();
                        let mode = "run";
                        if (type.includes("strength") || type.includes("сила")) mode = "strength";
                        if (type.includes("ski") || type.includes("лыжи")) mode = "ski";
                        const st = activityStyles[mode] || activityStyles.run;
                        const intenseMin = (e.zone3Min || 0) + (e.zone4Min || 0) + (e.zone5Min || 0);

                        return (
                          <button key={e.id} onClick={() => { setViewWorkoutId(e.id); setViewModalOpen(true); }}
                            className="w-full flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.08] transition-all text-left relative overflow-hidden group/item">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                                <span className="text-[9px] text-gray-100 font-black truncate uppercase tracking-tight leading-tight">
                                  {e.name || "Тренировка"}
                                </span>
                                {intenseMin > 0 && mode !== "strength" && (
                                    <Zap size={8} className="text-orange-500 fill-orange-500 shrink-0 ml-auto" />
                                )}
                            </div>

                            <div className="text-[8px] text-gray-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                {Math.floor(e.duration / 60)}ч {e.duration % 60}м {e.distance ? `• ${e.distance}км` : ""}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={() => { setSelectedDate(dateStr); setModalAddOpen(true); }}
                      className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-[#2a2a2e] text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white border border-white/10 shadow-xl scale-90 group-hover:scale-100 cursor-pointer z-10">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <CalendarModalAdd
        isOpen={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onAddWorkout={(nw) => setWorkouts(p => [...p, nw])}
        initialDate={selectedDate}
      />

      {viewWorkoutId && (
        <CalendarWorkoutDetails
          workoutId={viewWorkoutId}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          onSave={(updatedWorkout) => {
            if (updatedWorkout === null) {
              setWorkouts(prev => prev.filter(w => w?.id !== viewWorkoutId));
            } else {
              setWorkouts(prev => prev.map(w => (w?.id === updatedWorkout.id ? updatedWorkout : w)));
            }
          }}
        />
      )}
    </div>
  );
}