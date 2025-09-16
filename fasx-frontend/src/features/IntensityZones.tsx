import React from 'react'

export default function IntensityZones() {
  const zones = [
    { label: 'Z1 – Easy', color: '#2ecc71', percent: 60, time: '1h 45m' },
    { label: 'Z2 – Moderate', color: '#f1c40f', percent: 25, time: '45m' },
    { label: 'Z3 – Hard', color: '#e67e22', percent: 10, time: '20m' },
    { label: 'Z4 – Very Hard', color: '#e74c3c', percent: 5, time: '10m' },
  ]

  return (
    <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4 text-white">
      <h2 className="text-lg font-semibold">Intensity Zones</h2>
      {zones.map((zone, idx) => (
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

