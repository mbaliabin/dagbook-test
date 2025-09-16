import React from 'react';

interface Workout {
  id: string;
  type: string;
  duration: number; // в минутах
}

interface Props {
  workouts: Workout[];
}

export default function ActivityTable({ workouts }: Props) {
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);

  const grouped = workouts.reduce((acc, workout) => {
    if (!acc[workout.type]) {
      acc[workout.type] = { duration: 0, sessions: 0 };
    }
    acc[workout.type].duration += workout.duration;
    acc[workout.type].sessions += 1;
    return acc;
  }, {} as Record<string, { duration: number; sessions: number }>);

  const activityRows = Object.entries(grouped)
    .map(([type, { duration, sessions }]) => {
      const h = Math.floor(duration / 60);
      const m = duration % 60;
      const timeStr = `${h}ч ${m}м`;
      const share = totalMinutes
        ? Math.round((duration / totalMinutes) * 100)
        : 0;

      return {
        type: type.replace(/_/g, ' '),
        time: timeStr,
        share: `${share}%`,
        sessions,
      };
    })
    .sort((a, b) => b.sessions - a.sessions); // по убыванию по числу сессий
return (
    <div className="bg-[#1a1a1d] rounded-xl p-4 w-full">
      <h2 className="text-lg font-semibold text-white mb-3">Activities</h2>

      <div className="flex text-gray-400 text-xs border-b border-[#333] pb-1 mb-1">
        <div className="flex-1">Type</div>
        <div className="w-28 text-right">Time / Share</div>
        <div className="w-16 text-right">Sessions</div>
      </div>

      {activityRows.map((activity, idx) => (
        <div key={idx} className="flex items-center text-sm text-white py-1">
          <div className="flex-1 truncate">{activity.type}</div>
          <div className="w-28 text-right text-gray-300">
            {activity.time} — {activity.share}
          </div>
          <div className="w-16 text-right">{activity.sessions}</div>
        </div>
      ))}
    </div>
  );
}
