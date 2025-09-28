import React, { useEffect, useState, useCallback } from 'react'
import {
  Timer,
  MapPin,
  Zap,
  Target,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'
import { ru } from 'date-fns/locale'

import IntensityZones from '../components/IntensityZones'
import TrainingLoadChart from "../components/TrainingLoadChart"
import WeeklySessions from "../components/WeeklySessions"
import RecentWorkouts from "../components/RecentWorkouts"
import ActivityTable from "../components/ActivityTable"
import AddWorkoutModal from "../components/AddWorkoutModal"
import { getUserProfile } from "../api/getUserProfile"
import TopSessions from "../components/TopSessions"

dayjs.extend(isBetween)
dayjs.extend(isoWeek)

interface Workout {
  id: string
  name: string
  date: string
  duration: number
  type: string
  distance?: number | null
  zone1Min?: number
  zone2Min?: number
  zone3Min?: number
  zone4Min?: number
  zone5Min?: number
}

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>({
    startDate: dayjs().startOf('isoWeek').toDate(),
    endDate: dayjs().endOf('isoWeek').toDate()
  })
  const [showDateRangePicker, setShowDateRangePicker] = useState(false)
  const navigate = useNavigate()

  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Ошибка загрузки тренировок")
      const data: Workout[] = await res.json()
      setWorkouts(data)
    } catch (err) {
      console.error("Ошибка:", err)
    } finally {
      setLoadingWorkouts(false)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile()
        setName(data.name || "Пользователь")
      } catch (err) {
        console.error("Ошибка профиля:", err)
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
    fetchWorkouts()
  }, [fetchWorkouts])

  const handleAddWorkout = (w: Workout) => setWorkouts(prev => [w, ...prev])
  const handleDeleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id))
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = dayjs(w.date)
    if (dateRange) {
      const start = dayjs(dateRange.startDate).startOf('day')
      const end = dayjs(dateRange.endDate).endOf('day')
      return workoutDate.isBetween(start, end, null, '[]')
    }
    return workoutDate.isSame(selectedMonth, 'month')
  })

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0)
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0)
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60
  const totalTimeStr = `${hours}:${minutes.toString().padStart(2, '0')}`

  const intensiveSessions = filteredWorkouts.filter(w => {
    const zones = [
      w.zone1Min || 0,
      w.zone2Min || 0,
      w.zone3Min || 0,
      w.zone4Min || 0,
      w.zone5Min || 0
    ]
    const maxZone = zones.indexOf(Math.max(...zones)) + 1
    return [3, 4, 5].includes(maxZone)
  }).length

  const onPrevMonth = () => { setSelectedMonth(prev => prev.subtract(1, 'month')); setDateRange(null) }
  const onNextMonth = () => { setSelectedMonth(prev => prev.add(1, 'month')); setDateRange(null) }
  const applyDateRange = () => { if (dateRange) setShowDateRangePicker(false) }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6 pb-24"> {/* pb-24 чтобы не перекрывало нижнее меню */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-white">{loadingProfile ? 'Загрузка...' : name}</h1>
              <p className="text-sm text-white">
                {!dateRange
                  ? selectedMonth.format('MMMM YYYY')
                  : `${dayjs(dateRange.startDate).format('DD MMM YYYY')} — ${dayjs(dateRange.endDate).format('DD MMM YYYY')}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Выбор периода */}
        {/* ... оставляем ваш существующий код выбора периода */}

        {/* Статистика */}
        {/* ... оставляем ваш существующий код статистики */}

        {/* Графики и таблицы */}
        {/* ... оставляем ваш существующий код графиков и таблиц */}

        {/* Список тренировок */}
        {/* ... оставляем ваш существующий код списка тренировок */}

        {/* Модалка */}
        <AddWorkoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddWorkout={handleAddWorkout}
        />
      </div>

      {/* Нижняя панель навигации */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1d] border-t border-gray-700 flex justify-around items-center py-3 z-50">
        <div className="flex flex-col items-center text-blue-400 cursor-pointer">
          <Home size={24} />
          <span className="text-[12px] mt-1">Главная</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-blue-400">
          <BarChart3 size={24} />
          <span className="text-[12px] mt-1">Тренировка</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-blue-400">
          <ClipboardList size={24} />
          <span className="text-[12px] mt-1">Планирование</span>
        </div>
        <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-blue-400">
          <CalendarDays size={24} />
          <span className="text-[12px] mt-1">Статистика</span>
        </div>
      </div>
    </div>
  )
}
