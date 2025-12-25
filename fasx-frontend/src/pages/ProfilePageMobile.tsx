import React, { useEffect, useState, useCallback } from 'react'
import {
  Timer, MapPin, Zap, Target, Plus, LogOut, ChevronLeft,
  ChevronRight, Activity, CalendarDays, BarChart3, ClipboardList
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { Toaster } from "react-hot-toast"

// Компоненты
import IntensityZones from '../components/IntensityZonesMobile'
import TrainingLoadChart from "../components/TrainingLoadChartMobile"
import RecentWorkouts from "../components/RecentWorkoutsMobile"
import AddWorkoutModal from "../components/AddWorkoutModalMobile"
import EditWorkoutModal from "../components/EditWorkoutModalMobile" // ИСПРАВЛЕНО ИМЯ И КАВЫЧКА
import { getUserProfile } from "../api/getUserProfile"
import TopSessionMobile from "../components/TopSessionMobile"
import ActivityTableMobile from "../components/ActivityTableMobile"

dayjs.locale('ru')

export default function ProfilePageMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // СОСТОЯНИЯ ДЛЯ МОДАЛОК
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"view" | "edit">("view");

  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [profileData, workoutsRes] = await Promise.all([
        getUserProfile(),
        fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setProfile(profileData);
      if (workoutsRes.ok) setWorkouts(await workoutsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ФУНКЦИЯ ОТКРЫТИЯ РЕДАКТИРОВАНИЯ
  const handleOpenEdit = (id: string, mode: "view" | "edit" = "view") => {
    setEditingWorkoutId(id);
    setEditMode(mode);
    setIsEditModalOpen(true);
  };

  const filteredWorkouts = workouts.filter(w => dayjs(w.date).isSame(selectedMonth, 'month'));
  const totalTime = filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планы", icon: ClipboardList, path: "/planning" },
    { label: "Статы", icon: Activity, path: "/statistics" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200 pb-32 font-sans overflow-x-hidden">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-md border-b border-white/[0.03] px-4 py-2 flex items-center">
        <div className="flex items-center gap-2 shrink-0 pr-2" onClick={() => navigate("/account")}>
          <div className="w-8 h-8 rounded-full border border-white/10 bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 transition-transform active:scale-90">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <span className="text-white text-[10px] font-black">{profile?.name?.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-stretch bg-[#131316] rounded-xl border border-white/5 p-0.5 min-h-[40px] w-full max-w-[180px]">
            <button onClick={() => setSelectedMonth(selectedMonth.subtract(1, "month"))} className="px-2 text-gray-400 active:text-blue-500 transition-colors"><ChevronLeft size={16}/></button>
            <div className="flex-1 flex flex-col items-center justify-center px-1 border-x border-white/[0.03]">
              <span className="text-[9px] font-black uppercase tracking-tighter text-white leading-none">{selectedMonth.format("MMMM")}</span>
              <span className="text-[6px] font-bold uppercase text-blue-500/80 tracking-[0.1em] mt-0.5">{selectedMonth.format("YYYY")}</span>
            </div>
            <button onClick={() => setSelectedMonth(selectedMonth.add(1, "month"))} className="px-2 text-gray-400 active:text-blue-500 transition-colors"><ChevronRight size={16}/></button>
          </div>
        </div>

        <div className="w-8 shrink-0 flex items-center justify-end">
           <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="text-gray-600 active:text-red-500 transition-colors"><LogOut size={16} /></button>
        </div>
      </div>

      <div className="p-3 space-y-5">
        <button onClick={() => setIsModalOpen(true)} className="w-full bg-[#131316] border border-white/[0.05] text-gray-400 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all">
            <Plus size={14} strokeWidth={3} className="text-blue-500" /> Добавить тренировку
        </button>

        <div className="grid grid-cols-2 gap-2">
            {[
                { label: 'Время', val: `${Math.floor(totalTime/60)}ч ${totalTime%60}м`, icon: Timer, col: 'text-blue-500' },
                { label: 'Дистанция', val: `${totalDistance.toFixed(1)} км`, icon: MapPin, col: 'text-emerald-500' },
                { label: 'Сессии', val: filteredWorkouts.length, icon: Zap, col: 'text-amber-500' },
                { label: 'План', val: '94%', icon: Target, col: 'text-purple-500' },
            ].map((s, i) => (
                <div key={i} className="bg-[#131316] border border-white/[0.05] p-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 mb-1.5 opacity-40">
                        <s.icon size={10} className={s.col} />
                        <span className="text-[7px] font-black uppercase tracking-widest whitespace-nowrap">{s.label}</span>
                    </div>
                    <div className="text-sm font-black text-white">{s.val}</div>
                </div>
            ))}
        </div>

        {filteredWorkouts.length > 0 && <TopSessionMobile workouts={filteredWorkouts} />}

        <div className="bg-[#131316] border border-white/[0.05] rounded-xl p-4 shadow-xl">
           <TrainingLoadChart workouts={filteredWorkouts} />
        </div>

        <ActivityTableMobile workouts={filteredWorkouts} />

        <div className="bg-[#131316] border border-white/[0.05] rounded-xl p-4 shadow-xl">
          <IntensityZones workouts={filteredWorkouts} />
        </div>

        <div className="bg-[#131316] border border-white/[0.05] rounded-xl p-4 shadow-xl pb-6">
          <div className="text-center mb-4 border-b border-white/5 pb-2">
             <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Недавняя активность</p>
          </div>
          <RecentWorkouts
            workouts={filteredWorkouts}
            onDeleteWorkout={fetchData}
            onUpdateWorkout={fetchData}
            onEditClick={(id: string) => handleOpenEdit(id, "edit")} // Пробрасываем клик
            onViewClick={(id: string) => handleOpenEdit(id, "view")} // Пробрасываем клик
          />
        </div>
      </div>

      {/* BOTTOM MENU */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-[#131316]/95 backdrop-blur-md border border-white/10 p-1 rounded-xl flex justify-around shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all ${isActive ? "bg-blue-600/10 text-blue-500" : "text-gray-600"}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* МОДАЛКИ */}
      <AddWorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWorkout={fetchData}
      />

      <EditWorkoutModal
        isOpen={isEditModalOpen}
        mode={editMode}
        workoutId={editingWorkoutId}
        onClose={() => setIsEditModalOpen(false)}
        onSave={() => { fetchData(); setIsEditModalOpen(false); }}
      />
    </div>
  )
}