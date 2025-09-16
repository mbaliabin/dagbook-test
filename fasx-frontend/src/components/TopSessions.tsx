import React, { useMemo } from "react";
import { Bike, Footprints, Dumbbell, MapPin } from "lucide-react";
import dayjs from "dayjs";

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
  feeling?: number;
}

interface Props {
  workouts: Workout[];
}

function getTypeIcon(type: string) {
  const base = "w-4 h-4 p-1 rounded-full bg-[#2a2a2d]";
  if (type.toLowerCase().includes("run")) return <Footprints className={`${base} text-green-400`} />;
  if (type.toLowerCase().includes("bike")) return <Bike className={`${base} text-orange-400`} />;
  if (type.toLowerCase().includes("strength")) return <Dumbbell className={`${base} text-purple-400`} />;
  return <MapPin className={`${base} text-gray-400`} />;
}

export default function TopSessions({ workouts }: Props) {
  const { longest, hardest, bestFeeling } = useMemo(() => {
    if (workouts.length === 0) return { longest: null, hardest: null, bestFeeling: null };

    const longest = [...workouts].sort((a, b) => b.duration - a.duration)[0];

    const hardest = [...workouts].sort((a, b) => {
      const aZones = [a.zone1Min ?? 0, a.zone2Min ?? 0, a.zone3Min ?? 0, a.zone4Min ?? 0, a.zone5Min ?? 0];
      const bZones = [b.zone1Min ?? 0, b.zone2Min ?? 0, b.zone3Min ?? 0, b.zone4Min ?? 0, b.zone5Min ?? 0];
      return Math.max(...bZones) - Math.max(...aZones);
    })[0];

    const bestFeeling = [...workouts]
      .filter(w => w.feeling !== undefined)
      .sort((a, b) => (b.feeling ?? 0) - (a.feeling ?? 0))[0];

    return { longest, hardest, bestFeeling };
  }, [workouts]);

  const renderItem = (
    label: string,
    workout: Workout | null,
    colorClass: string
  ) => {
    if (!workout) return (
      <li className="text-gray-400">{label}: —</li>
    );

    const maxZone = (() => {
      const zones = [
        workout.zone1Min ?? 0,
        workout.zone2Min ?? 0,
        workout.zone3Min ?? 0,
        workout.zone4Min ?? 0,
        workout.zone5Min ?? 0
      ];
      return zones.indexOf(Math.max(...zones)) + 1;
    })();

    return (
      <li className="text-sm text-gray-300 flex flex-col space-y-1 border-l-4 pl-3" style={{ borderColor: colorClass }}>
        <span className={`font-semibold text-sm`} style={{ color: colorClass }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {getTypeIcon(workout.type)}
          <span className="font-medium text-white">{workout.name}</span>
          <span className="text-xs text-gray-500">{dayjs(workout.date).format("DD.MM.YYYY")}</span>
        </div>
        <div className="text-xs text-gray-400">
          ⏱ {workout.duration} min &nbsp; | &nbsp; 🧭 Max Zone: <span className="text-blue-400">Z{maxZone}</span> &nbsp; | &nbsp; 😊 Feeling: <span className="text-pink-400">{workout.feeling ?? "—"}</span>
        </div>
      </li>
    );
  };

  return (
    <div className="bg-[#1a1a1d] p-4 rounded-xl text-white space-y-4 shadow-md">
      <h2 className="text-lg font-semibold">Top Sessions</h2>
      <ul className="space-y-4">
        {renderItem("Longest", longest, "#3b82f6")}      {/* blue */}
        {renderItem("Most Intensive", hardest, "#ef4444")}  {/* red */}
        {renderItem("Best Feeling", bestFeeling, "#a855f7")}  {/* purple */}
      </ul>
    </div>
  );
}

