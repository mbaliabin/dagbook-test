// src/components/TrainingList.tsx

const dummyTrainings = [
  {
    id: 1,
    title: 'Бег 5 км',
    date: '2025-06-12',
    duration: '25 мин',
    intensity: 'Средняя',
  },
  {
    id: 2,
    title: 'Велотренажер',
    date: '2025-06-11',
    duration: '40 мин',
    intensity: 'Низкая',
  },
  {
    id: 3,
    title: 'Силовая тренировка',
    date: '2025-06-10',
    duration: '50 мин',
    intensity: 'Высокая',
  },
]

export default function TrainingList() {
  return (
    <div className="bg-zinc-900 p-4 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Последние тренировки</h2>
      <ul className="space-y-4">
        {dummyTrainings.map((t) => (
          <li
            key={t.id}
            className="bg-zinc-800 p-4 rounded-xl hover:bg-zinc-700 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="text-sm text-zinc-400">
                  {t.date} • {t.duration} • {t.intensity}
                </p>
              </div>
              <span className="text-xs text-zinc-400">#{t.id}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

