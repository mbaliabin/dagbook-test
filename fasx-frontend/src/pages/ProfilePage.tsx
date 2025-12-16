import React, { useEffect, useState, useCallback } from 'react'
import {
  Timer, MapPin, Zap, Target, Plus, LogOut, ChevronLeft,
  ChevronRight, ChevronDown, Calendar, Home, BarChart3,
  ClipboardList, CalendarDays
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { DateRange } from 'react-date-range'
import { ru } from 'date-fns/locale'

// Компоненты и API
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
dayjs.locale("ru");

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Состояния
  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>({
    startDate: dayjs().startOf('isoWeek').toDate(),
    endDate: dayjs().endOf('isoWeek').toDate()
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      const [profileData, workoutsRes] = await Promise.all([
        getUserProfile(),
        fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
      ]);

      setProfile(profileData);
      if (workoutsRes.ok) {
        const wData = await workoutsRes.json();
        setWorkouts(wData);
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Фильтрация и расчеты (оставил твою логику)
  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = dayjs(w.date)
    if (dateRange) {
      return workoutDate.isBetween(dayjs(dateRange.startDate).startOf('day'), dayjs(dateRange.endDate).endOf('day'), null, '[]')
    }
    return workoutDate.isSame(selectedMonth, 'month')
  });

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER (Стиль как в AccountPage) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : (profile?.name?.charAt(0) || "U")}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Загрузка..."}</h1>
              <p className="text-sm text-gray-400">
                {!dateRange ? selectedMonth.format('MMMM YYYY') : `${dayjs(dateRange.startDate).format('D MMM')} — ${dayjs(dateRange.endDate).format('D MMM YYYY')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-all font-semibold shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1f1f22] border border-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-colors">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION (Стиль как в AccountPage) */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl mb-6 shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-xs transition-colors py-1 w-20 ${isActive ? "text-blue-500 font-bold" : "text-gray-500 hover:text-white"}`}>
                <Icon className="w-5 h-5 mb-1"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ ПЕРИОДОМ */}
        <div className="flex flex-wrap items-center gap-3 bg-[#1a1a1d] p-3 rounded-xl border border-gray-800">
           <div className="flex items-center bg-[#0f0f0f] rounded-lg border border-gray-800 p-1">
              <button onClick={() => { setSelectedMonth(prev => prev.subtract(1, 'month')); setDateRange(null); }} className="p-1.5 hover:text-blue-500 transition-colors"><ChevronLeft size={18}/></button>
              <span className="px-4 text-sm font-bold min-w-[120px] text-center uppercase tracking-widest">{selectedMonth.format('MMM YYYY')}</span>
              <button onClick={() => { setSelectedMonth(prev => prev.add(1, 'month')); setDateRange(null); }} className="p-1.5 hover:text-blue-500 transition-colors"><ChevronRight size={18}/></button>
           </div>

           <button onClick={() => setDateRange({ startDate: dayjs().startOf('isoWeek').toDate(), endDate: dayjs().endOf('isoWeek').toDate() })}
                   className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d] transition-all">
             Текущая неделя
           </button>

           <div className="relative">
              <button onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d] transition-all">
                <Calendar size={14} /> Период <ChevronDown size={14} />
              </button>
              {showDateRangePicker && (
                <div className="absolute z-50 mt-2 right-0 bg-[#1a1a1d] border border-gray-800 rounded-2xl shadow-2xl p-4">
                  <DateRange
                    onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
                    ranges={[{ startDate: dateRange?.startDate || new Date(), endDate: dateRange?.endDate || new Date(), key: 'selection' }]}
                    locale={ru} rangeColors={['#3b82f6']}
                  />
                  <button onClick={() => setShowDateRangePicker(false)} className="w-full mt-4 bg-blue-600 py-2 rounded-lg font-bold text-sm">Применить</button>
                </div>
              )}
           </div>
        </div>

        {/* СТАТИСТИКА (Карточки в новом стиле) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Training', val: `${hours}:${minutes.toString().padStart(2, '0')}`, sub: `${filteredWorkouts.length} сессий`, icon: Timer },
            { label: 'Distance', val: `${filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0).toFixed(1)} km`, sub: 'Всего за период', icon: MapPin },
            { label: 'Intensive', val: filteredWorkouts.length, sub: 'Высокая зона', icon: Zap },
            { label: 'Specific', val: '1', sub: 'Целевые', icon: Target },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1d] border border-gray-800 p-5 rounded-2xl shadow-sm hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <stat.icon size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.val}</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ГРАФИКИ (Обернуты в карточки) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><TrainingLoadChart workouts={filteredWorkouts} /></div>
          <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><IntensityZones workouts={filteredWorkouts} /></div>
        </div>

        {/* ТАБЛИЦА И ТОП */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><TopSessions workouts={filteredWorkouts} /></div>
          <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl"><ActivityTable workouts={filteredWorkouts} /></div>
        </div>

        <div className="bg-[#1a1a1d] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <RecentWorkouts workouts={filteredWorkouts} onDeleteWorkout={() => {}} onUpdateWorkout={fetchData} />
        </div>
      </div>

      <AddWorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorkout={() => fetchData()} />
    </div>
  )
}