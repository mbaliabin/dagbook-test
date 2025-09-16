import React, { useMemo } from "react";

interface Workout {
  id: string;
  type: string;
  duration: number; // в минутах
}

interface Props {
  workouts: Workout[];
}

const colors: Record<string, string> = {
  Running: "#2ecc71",
  Cycling: "#3498db",
  Strength: "#e67e22",
  Other: "#9b59b6",
};

export default function ActivityTableMobile({ workouts }: Props) {
  const totalMinutes = useMemo(
    () => workouts.reduce((sum, w) => sum + w.duration, 0),
    [workouts]
  );

  const grouped = useMemo(() => {
    const acc: Record<string, { duration: number; sessions: number }> = {};
    for (const workout of workouts) {
      if (!acc[workout.type]) {
        acc[workout.type] = { duration: 0, sessions: 0 };
      }
      acc[workout.type].duration += workout.duration;
      acc[workout.type].sessions += 1;
    }
    return Object.entries(acc)
      .map(([type, { duration, sessions }]) => ({
        type,
        duration,
        sessions,
        color: colors[type] || "#7f8c8d",
        percent: totalMinutes ? Math.round((duration / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [workouts, totalMinutes]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
  };

  return (
    <div className="bg-[#1a1a1d] p-8 rounded-xl text-white" style={{ maxWidth: 400 }}>
      <h2 className="text-sm font-semibold mb-2">Activities</h2>

      <div className="flex flex-col gap-2">
        {grouped.map((activity, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {/* Тип активности */}
            <div className="w-20 text-[10px] text-gray-300">{activity.type}</div>

            {/* Прогресс по времени */}
            <div className="flex-1 h-3 bg-[#333] rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-700"
                style={{ width: `${activity.percent}%`, backgroundColor: activity.color }}
              />
            </div>

            {/* Время и сессии */}
            <div className="w-20 text-[10px] text-gray-300 text-right">
              {formatTime(activity.duration)} — {activity.percent}%
            </div>
            <div className="w-12 text-[10px] text-gray-300 text-right">{activity.sessions}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
