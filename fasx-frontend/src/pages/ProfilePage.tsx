import React, { useEffect, useState, useCallback } from 'react'
import {
  Timer, MapPin, Zap, Target, Plus, LogOut, ChevronLeft,
  ChevronRight, ChevronDown, Calendar, Home, BarChart3,
  ClipboardList, CalendarDays, Activity
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'
import { DateRange } from 'react-date-range'
import { ru } from 'date-fns/locale'

// Стили
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import '../App.css'

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
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: Activity, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white font-sans">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER С КЛИКАБЕЛЬНЫМ ПРОФИЛЕМ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div
            className="flex items-center space-x-5 group cursor-pointer"
            onClick={() => navigate("/account")}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#131316] transition-transform group-hover:scale-105 border border-white/[0.05]">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 font-bold text-white text-lg">
                  {profile?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1 group-hover:text-blue-400 transition-colors">
                {profile?.name || "Пользователь"}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-300">
                <Calendar size={12} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  {!dateRange ? selectedMonth.format('MMMM YYYY') : `${dayjs(dateRange.startDate).format('D MMM')} — ${dayjs(dateRange.endDate).format('D MMM YYYY')}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all shadow-lg active:scale-95">
              <Plus className="w-4 h-4 mr-2 stroke-[3px]"/> Добавить
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1a1a1d] border border-gray-800 hover:border-red-500/50 hover:text-red-400 text-gray-400 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all">
              <LogOut className="w-4 h-4 mr-2"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#131316] border border-white/[0.03] py-2 px-4 rounded-xl shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all py-1 w-24 ${isActive ? "text-blue-500" : "text-gray-600 hover:text-gray-300"}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}/>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em]`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ ПЕРИОДОМ */}
        <div className="flex flex-wrap items-center gap-3 bg-[#131316] p-2 rounded-xl border border-white/[0.03] shadow-xl">
          <div className="flex items-center bg-black/40 rounded-lg border border-white/[0.05] p-1">
            <button onClick={() => { setSelectedMonth(prev => prev.subtract(1, 'month')); setDateRange(null); }} className="p-1.5 hover:text-blue-500 transition-colors"><ChevronLeft size={18}/></button>
            <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] min-w-[130px] text-center text-gray-300">{selectedMonth.format('MMM YYYY')}</span>
            <button onClick={() => { setSelectedMonth(prev => prev.add(1, 'month')); setDateRange(null); }} className="p-1.5 hover:text-blue-500 transition-colors"><ChevronRight size={18}/></button>
          </div>
          <button
            onClick={() => setDateRange({ startDate: dayjs().startOf('isoWeek').toDate(), endDate: dayjs().endOf('isoWeek').toDate() })}
            className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border transition-all ${!dateRange ? 'border-white/[0.05] text-gray-500' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}
          >
            Неделя
          </button>
          <div className="relative ml-auto">
            <button
              onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border transition-all ${showDateRangePicker ? 'border-blue-500 bg-blue-600 text-white' : 'border-white/[0.05] bg-[#1a1a1d] text-gray-400 hover:border-white/10'}`}
            >
              <CalendarDays size={14} />
              {dateRange ? `${dayjs(dateRange.startDate).format('DD.MM')} — ${dayjs(dateRange.endDate).format('DD.MM')}` : "Период"}
              <ChevronDown size={14} className={`transition-transform duration-300 ${showDateRangePicker ? 'rotate-180' : ''}`} />
            </button>
            {showDateRangePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDateRangePicker(false)} />
                <div className="absolute z-50 mt-3 right-0 bg-[#0f0f11] border border-white/[0.08] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-4 w-[330px] animate-in fade-in zoom-in duration-200">
                  <DateRange
                    onChange={item => setDateRange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })}
                    ranges={[{ startDate: dateRange?.startDate || new Date(), endDate: dateRange?.endDate || new Date(), key: 'selection' }]}
                    locale={ru}
                    rangeColors={['#3b82f6']}
                    showDateDisplay={false}
                    months={1}
                  />
                  <button onClick={() => setShowDateRangePicker(false)} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                    Применить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* СТАТИСТИКА - ГРИД С ФИКСИРОВАННЫМИ КОЛОНКАМИ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { label: 'Total Duration', val: `${hours}:${minutes.toString().padStart(2, '0')}`, sub: `${filteredWorkouts.length} сессий`, icon: Timer, color: 'text-blue-500' },
            { label: 'Distance', val: `${filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0).toFixed(1)} km`, sub: 'Всего за период', icon: MapPin, color: 'text-emerald-500' },
            { label: 'Workouts', val: filteredWorkouts.length, sub: 'Активности', icon: Zap, color: 'text-amber-500' },
            { label: 'Compliance', val: '94%', sub: 'Выполнение плана', icon: Target, color: 'text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#131316] border border-white/[0.03] p-5 rounded-xl shadow-sm hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{stat.label}</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">{stat.val}</div>
              <div className="text-[9px] font-bold text-gray-600 uppercase mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ГРАФИКИ С МИНИМАЛЬНОЙ ВЫСОТОЙ */}
        <div className="grid lg:grid-cols-2 gap-6 w-full">
          <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-6 shadow-xl min-h-[400px] flex flex-col justify-center">
             <TrainingLoadChart workouts={filteredWorkouts} />
          </div>
          <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-6 shadow-xl min-h-[400px] flex flex-col justify-center">
            <IntensityZones workouts={filteredWorkouts} />
          </div>
        </div>

        {/* ТАБЛИЦА И ТОП С МИНИМАЛЬНОЙ ВЫСОТОЙ */}
        <div className="grid lg:grid-cols-2 gap-6 w-full">
          <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-6 shadow-xl min-h-[450px] flex flex-col">
            <TopSessions workouts={filteredWorkouts} />
          </div>
          <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-6 shadow-xl min-h-[450px] flex flex-col">
            <ActivityTable workouts={filteredWorkouts} />
          </div>
        </div>

        {/* ПОСЛЕДНИЕ ТРЕНИРОВКИ С ОБРАБОТКОЙ ПУСТОГО СОСТОЯНИЯ */}
        <div className="bg-[#131316] border border-white/[0.03] rounded-xl p-6 shadow-xl mb-10 min-h-[300px] flex flex-col">
          {filteredWorkouts.length > 0 ? (
            <RecentWorkouts workouts={filteredWorkouts} onDeleteWorkout={() => fetchData()} onUpdateWorkout={fetchData} />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-gray-600">
              <BarChart3 size={40} className="mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Нет данных для отображения</p>
            </div>
          )}
        </div>
      </div>

      <AddWorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorkout={() => fetchData()} />
    </div>
  )
}