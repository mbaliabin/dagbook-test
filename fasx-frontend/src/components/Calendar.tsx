import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { FaRunning, FaSkiingNordic, FaDumbbell } from "react-icons/fa";
import CalendarModalAdd from "./CalendarModalAdd";
import CalendarModalReader from "./CalendarModalReader"; // Импорт модалки просмотра/редактирования

dayjs.extend(isoWeek);

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  distance?: number | null;
}

const activityStyles = {
  run: { icon: <FaRunning />, bg: "bg-blue-600/30", text: "text-blue-300" },
  ski: { icon: <FaSkiingNordic />, bg: "bg-blue-400/30", text: "text-blue-200" },
  strength: { icon: <FaDumbbell />, bg: "bg-blue-500/30", text: "text-blue-100" },
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TrainingCalendar() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month());

  // Состояния для модалок
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
        if (!res.ok) throw new Error("Failed to load workouts");
        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const startOfMonth = dayjs(new Date(year, month, 1));
  const startCalendar = startOfMonth.startOf("isoWeek");
  const days = Array.from({ length: 35 }, (_, i) => startCalendar.add(i, "day"));

  // Группировка тренировок по дате
  const trainings: Record<string, Workout[]> = {};
  for (const w of workouts) {
    const dateKey = w.date.split("T")[0];
    if (!trainings[dateKey]) trainings[dateKey] = [];
    trainings[dateKey].push(w);
  }

  type WeekStat = { hours: number; sessions: number; distance: number };
  const stats: Record<number, WeekStat> = {};

  workouts.forEach((w) => {
    const d = dayjs(w.date);
    const wNum = d.isoWeek();
    if (!stats[wNum]) stats[wNum] = { hours: 0, sessions: 0, distance: 0 };
    stats[wNum].hours += w.duration / 60;
    stats[wNum].sessions += 1;
    stats[wNum].distance += w.distance ?? 0;
  });

  const weeksInCalendar = Array.from(new Set(days.map((d) => d.isoWeek())));
  const weeksDays = weeksInCalendar.map((wNum) =>
    days.filter((d) => d.isoWeek() === wNum)
  );
  weeksInCalendar.forEach((w) => {
    if (!stats[w]) stats[w] = { hours: 0, sessions: 0, distance: 0 };
  });

  const prevMonth = () => {
    const prev = dayjs(new Date(year, month, 1)).subtract(1, "month");
    setYear(prev.year());
    setMonth(prev.month());
  };
  const nextMonth = () => {
    const next = dayjs(new Date(year, month, 1)).add(1, "month");
    setYear(next.year());
    setMonth(next.month());
  };

  if (loading) {
    return <div className="text-center p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 bg-[#0e0e10] text-sm text-gray-100">
      <div className="flex justify-center items-center gap-4 mb-4 text-gray-300 text-sm select-none">
        <button
          onClick={prevMonth}
          className="px-2 py-1 rounded hover:bg-[#1a1b1e]"
          aria-label="Previous month"
        >
          &lt;
        </button>
        <div>{startOfMonth.format("MMMM YYYY")}</div>
        <button
          onClick={nextMonth}
          className="px-2 py-1 rounded hover:bg-[#1a1b1e]"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      <table className="w-full border-collapse border border-[#2a2b2e] text-xs select-none">
        <thead>
          <tr>
            <th
              className="border border-[#2a2b2e] bg-[#1a1b1e] text-center px-3 py-3"
              style={{ width: 140 }}
            >
              Statistics
            </th>
            {weekdays.map((d) => (
              <th
                key={d}
                className="border border-[#2a2b2e] bg-[#1a1b1e] text-center px-3 py-3"
                style={{ width: 140 }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeksInCalendar.map((weekNum, i) => {
            const s = stats[weekNum];
            const weekDays = weeksDays[i];
            return (
              <tr key={weekNum} className="h-36 align-top">
                <td
                  className="border border-[#2a2b2e] bg-[#1a1b1e] px-4 py-3 text-gray-300 align-top"
                  style={{ width: 140, minWidth: 140 }}
                >
                  <div className="font-medium mb-1">Week {weekNum}</div>
                  <div>Hours: {s.hours.toFixed(1)}</div>
                  <div>Sessions: {s.sessions}</div>
                  <div>Distance: {s.distance.toFixed(1)} km</div>
                </td>

                {weekDays.map((d) => {
                  const dateStr = d.format("YYYY-MM-DD");
                  const day = d.date();
                  const items = trainings[dateStr] || [];
                  return (
                    <td
                      key={dateStr}
                      className={`group relative border border-[#2a2b2e] bg-[#1a1b1e] px-3 py-3 align-top text-gray-100 ${
                        d.month() !== month ? "opacity-40" : ""
                      }`}
                      style={{ width: 140, maxWidth: 140, minWidth: 140 }}
                    >
                      <div className="text-xs text-gray-500 font-semibold mb-2">{day}</div>

                      <div className="flex flex-col gap-1 overflow-hidden text-xs max-h-[90px] mb-10">
                        {items.map((e) => {
                          const mode = e.type.toLowerCase().includes("styrke")
                            ? "strength"
                            : e.type.toLowerCase().includes("ski")
                            ? "ski"
                            : "run";
                          const st = activityStyles[mode] || {};
                          return (
                            <button
                              key={e.id}
                              onClick={() => {
                                setViewWorkoutId(e.id);
                                setViewModalOpen(true);
                              }}
                              className={`flex items-center gap-1 p-1 rounded ${st.bg} w-full text-left hover:bg-[#2a2b2e] transition`}
                              title={`${e.name} — ${Math.floor(e.duration / 60)}h ${e.duration % 60}m`}
                            >
                              <span className={`text-xs ${st.text}`}>{st.icon}</span>
                              <span className="whitespace-nowrap overflow-hidden max-w-[40px] text-ellipsis">
                                {Math.floor(e.duration / 60)}h {e.duration % 60}m
                              </span>
                              <span className="truncate max-w-[calc(100%-50px)]">{e.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setModalAddOpen(true);
                        }}
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-100 bg-[#1a1b1e] rounded px-3 py-1 text-lg"
                        aria-label={`Добавить тренировку на ${dateStr}`}
                        title="Добавить тренировку"
                      >
                        +
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Модалка добавления */}
      <CalendarModalAdd
        isOpen={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onAddWorkout={(newWorkout) => {
          setWorkouts((prev) => [...prev, newWorkout]);
        }}
        initialDate={selectedDate || undefined}
      />

      {/* Модалка просмотра/редактирования */}
      {viewWorkoutId && (
        <CalendarModalReader
          workoutId={viewWorkoutId}
          mode="view"
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          onSave={(updatedWorkout) => {
            setWorkouts((prev) =>
              prev.map((w) => (w.id === updatedWorkout.id ? updatedWorkout : w))
            );
          }}
        />
      )}
    </div>
  );
}



