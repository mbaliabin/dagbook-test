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
import { useNavigate, useLocation } from 'react-router-dom'
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
  const [showBottomMenu, setShowBottomMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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

  const handleAddWorkout = (w: Workout) => {
    setWorkouts(prev => [w, ...prev])
  }

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
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

  const onPrevMonth = () => {
    setSelectedMonth(prev => prev.subtract(1, 'month'))
    setDateRange(null)
  }

  const onNextMonth = () => {
    setSelectedMonth(prev => prev.add(1, 'month'))
    setDateRange(null)
  }

  const applyDateRange = () => {
    if (dateRange) setShowDateRangePicker(false)
  }

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ]

  // Появление нижнего меню при скролле
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setShowBottomMenu(scrollY > 300) // например, после 300px
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive =
              (item.path === "/daily" && location.pathname === "/daily") ||
              (item.path === "/profile" && location.pathname === "/profile") ||
              (item.path !== "/daily" && item.path !== "/profile" && location.pathname === item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${
                  isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Header + кнопки + выбор периода */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {loadingProfile ? 'Загрузка...' : name}
              </h1>
              <p className="text-sm text-white">
                {!dateRange
                  ? selectedMonth.format('MMMM YYYY')
                  : `${dayjs(dateRange.startDate).format('DD MMM YYYY')} — ${dayjs(dateRange.endDate).format('DD MMM YYYY')}`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Выбор периода */}
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                className="flex items-center text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onPrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                className="relative bg-[#1f1f22] text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer select-none"
                onClick={() => { setShowDateRangePicker(false); setDateRange(null) }}
                title="Показать текущий месяц"
              >
                {selectedMonth.format('MMMM YYYY')}
              </div>

              <button
                className="text-sm text-gray-300 bg-[#1f1f22] px-3 py-1 rounded hover:bg-[#2a2a2d]"
                onClick={onNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setDateRange({ startDate: dayjs().startOf('isoWeek').toDate(), endDate: dayjs().endOf('isoWeek').toDate() })
                  setShowDateRangePicker(false)
                }}
                className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]"
              >
                Текущая неделя
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDateRangePicker(prev => !prev)}
                  className="ml-2 text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d] flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Произвольный период
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {showDateRangePicker && (
                  <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                    <DateRange
                      onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                      showSelectionPreview={true}
                      moveRangeOnFirstSelection={false}
                      months={1}
                      ranges={[{ startDate: dateRange?.startDate || new Date(), endDate: dateRange?.endDate || new Date(), key: 'selection' }]}
                      direction="horizontal"
                      rangeColors={['#3b82f6']}
                      className="text-white"
                      locale={ru}
                      weekStartsOn={1}
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => setShowDateRangePicker(false)}
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={applyDateRange}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" /> Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center">
              <Timer className="w-4 h-4 mr-1" /> Total Training
            </p>
            <h2 className="text-xl font-semibold">{totalTimeStr}</h2>
            <p className="text-xs text-gray-500">{filteredWorkouts.length} Sessions</p>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> Distance
            </p>
            <h2 className="text-xl font-semibold">{totalDistance.toFixed(1)} km</h2>
            <p className="text-xs text-gray-500">
              {filteredWorkouts.filter(w => w.distance).length} Sessions
            </p>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center">
              <Zap className="w-4 h-4 mr-1" /> Intensive
            </p>
            <h2 className="text-xl font-semibold">{intensiveSessions}</h2>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center">
              <Target className="w-4 h-4 mr-1" /> Specific
            </p>
            <h2 className="text-xl font-semibold">1</h2>
          </div>
        </div>

        {/* Графики и таблицы */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TrainingLoadChart workouts={filteredWorkouts} />
            <IntensityZones workouts={filteredWorkouts} />
          </div>
          <div className="space-y-6">
            <TopSessions workouts={filteredWorkouts} />
            <ActivityTable workouts={filteredWorkouts} />
          </div>
        </div>

        {/* Список тренировок */}
        <div>
          {loadingWorkouts ? (
            <p className="text-gray-400">Загрузка тренировок...</p>
          ) : (
            <RecentWorkouts
              workouts={filteredWorkouts}
              onDeleteWorkout={handleDeleteWorkout}
              onUpdateWorkout={fetchWorkouts}
            />
          )}
        </div>
      </div>

      {/* Модалка */}
      <AddWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWorkout={handleAddWorkout}
      />

      {/* Нижняя навигация — появляется при скролле */}
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-7xl bg-[#1a1a1d] border-t border-gray-700 flex justify-around py-2 px-4 transition-all duration-300 ${
          showBottomMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            (item.path === "/daily" && location.pathname === "/daily") ||
            (item.path === "/profile" && location.pathname === "/profile") ||
            (item.path !== "/daily" && item.path !== "/profile" && location.pathname === item.path)

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center text-sm transition-colors ${
                isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
