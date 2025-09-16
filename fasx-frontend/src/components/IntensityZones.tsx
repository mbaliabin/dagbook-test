import React, { useMemo } from 'react'

interface Workout {
  zone1Min?: number
  zone2Min?: number
  zone3Min?: number
  zone4Min?: number
  zone5Min?: number
}

interface Props {
  workouts: Workout[]
}

export default function IntensityZones({ workouts }: Props) {
  const totals = useMemo(() => {
    const sums = [0, 0, 0, 0, 0]

    for (const workout of workouts) {
      sums[0] += workout.zone1Min ?? 0
      sums[1] += workout.zone2Min ?? 0
      sums[2] += workout.zone3Min ?? 0
      sums[3] += workout.zone4Min ?? 0
      sums[4] += workout.zone5Min ?? 0
    }

    const totalMinutes = sums.reduce((a, b) => a + b, 0)

    const percent = totalMinutes
      ? sums.map((min) => Math.round((min / totalMinutes) * 100))
      : [0, 0, 0, 0, 0]

    const format = (min: number) => {
      const h = Math.floor(min / 60)
      const m = min % 60
      return `${h > 0 ? `${h}h ` : ''}${m}m`
    }

    return sums.map((min, idx) => ({
      label: `Z${idx + 1}`,
      color: ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#c0392b'][idx],
      time: format(min),
      percent: percent[idx],
    }))
  }, [workouts])

  return (
    <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4 text-white">
      <h2 className="text-lg font-semibold">Intensity Zones</h2>
      {totals.map((zone, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-sm text-gray-300">
            <span>{zone.label}</span>
            <span className="text-gray-400">
              {zone.time} · {zone.percent}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${zone.percent}%`,
                backgroundColor: zone.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

