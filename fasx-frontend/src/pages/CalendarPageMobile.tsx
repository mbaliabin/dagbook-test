import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  ChevronLeft, ChevronRight, CalendarDays,
  BarChart3, Activity, ClipboardList, Timer, LogOut
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// Компоненты
import TrainingCalendar from "../components/CalendarMobile";
import CalendarModalAdd from "../components/AddCalendarModalMobile";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

export default function CalendarPageMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleWorkoutAdded = () => {
    setCalendarKey(prev => prev + 1);
    setIsAddModalOpen(false);
  };

  const menuItems = [
    { label: "Главная", icon: Timer, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Календарь", icon: CalendarDays, path: "/calendar" },
    { label: "Планы", icon: ClipboardList, path: "/planning" },
    { label: "Статы", icon: Activity, path: "/statistics" },
  ];

  if (loading && !profile) return (
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
          <div className="w-8 h-8 rounded-full border border-white/10 bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 transition-transform active:scale-90 cursor-pointer">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <span className="text-white text-[10px] font-black">{profile?.name?.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-stretch bg-[#131316] rounded-xl border border-white/5 p-0.5 min-h-[40px] w-full max-w-[180px]">
            <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="px-2 text-gray-400 active:text-blue-500 transition-colors">
              <ChevronLeft size={16}/>
            </button>
            <div className="flex-1 flex flex-col items-center justify-center px-1 border-x border-white/[0.03]">
              <span className="text-[9px] font-black uppercase tracking-tighter text-white leading-none">
                {currentDate.format("MMMM")}
              </span>
              <span className="text-[6px] font-bold uppercase text-blue-500/80 tracking-[0.1em] mt-0.5">
                {currentDate.format("YYYY")}
              </span>
            </div>
            <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="px-2 text-gray-400 active:text-blue-500 transition-colors">
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>

        <div className="w-8 shrink-0 flex items-center justify-end">
           <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="text-gray-600 active:text-red-500 transition-colors">
              <LogOut size={16} />
           </button>
        </div>
      </div>

      <div className="p-3">
        {/* ОСНОВНОЙ КОМПОНЕНТ КАЛЕНДАРЯ */}
        <div className="bg-[#131316] border border-white/[0.03] rounded-2xl shadow-2xl overflow-hidden min-h-[400px]">
          <TrainingCalendar
            key={calendarKey}
            currentMonth={currentDate}
            // Передаем функцию открытия модалки в календарь, если он это поддерживает
            onDayClick={() => setIsAddModalOpen(true)}
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
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all ${isActive ? "bg-blue-600/10 text-blue-500" : "text-gray-600"}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* МОДАЛКА */}
      <CalendarModalAdd
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWorkout={handleWorkoutAdded}
      />
    </div>
  );
}