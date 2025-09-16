// src/pages/TrainingPage.tsx
import TrainingCalendar from '@/components/TrainingCalendar'
import TrainingList from '@/components/TrainingList'

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold">Тренировки</h1>
      <TrainingCalendar />
      <TrainingList />
    </div>
  )
}

