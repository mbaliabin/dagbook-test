import React, { useMemo } from "react";

interface Workout {
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

interface Props {
  workouts: Workout[];
}

export default function IntensityZonesMobile({ workouts }: Props) {
  const totals = useMemo(() => {
    const sums = [0, 0, 0, 0, 0];

    for (const workout of workouts) {
      sums[0] += workout.zone1Min ?? 0;
      sums[1] += workout.zone2Min ?? 0;
      sums[2] += workout.zone3Min ?? 0;
      sums[3] += workout.zone4Min ?? 0;
      sums[4] += workout.zone5Min ?? 0;
    }

    const totalMinutes = sums.reduce((a, b) => a + b, 0);

    const percent = totalMinutes
      ? sums.map((min) => Math.round((min / totalMinutes) * 100))
      : [0, 0, 0, 0, 0];

    return sums.map((min, idx) => ({
      label: `Z${idx + 1}`,
      color: ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b"][idx],
      time: min,
      percent: percent[idx],
    }));
  }, [workouts]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
  };

  return (
    <div className="bg-[#1a1a1d] p-3 rounded-xl text-white">
      <h2 className="text-sm font-semibold mb-2">Intensity Zones</h2>
      <div className="flex flex-col gap-2">
        {totals.map((zone, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-[10px] text-gray-300">{zone.label}</span>
            <div className="flex-1 h-3 bg-[#333] rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-700"
                style={{
                  width: `${zone.percent}%`,
                  backgroundColor: zone.color,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-300 w-20 text-right">
              {zone.percent}% ({formatTime(zone.time)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}





