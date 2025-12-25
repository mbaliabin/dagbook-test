import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, ChevronLeft, ChevronRight, Activity,
  Calendar as CalendarIcon, ChevronDown, Maximize2, X
} from "lucide-react";
import { Calendar as DatePicker } from "react-date-range";
import { ru } from "date-fns/locale";
import toast, { Toaster } from "react-hot-toast";

// Стили
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import TrainingCalendar from "../components/Calendar";
import { getUserProfile } from "../api/getUserProfile";

// ИМПОРТ ТВОЕЙ МОДАЛКИ
import CalendarModalAdd from "../components/CalendarModalAdd";

dayjs.locale("ru");

export default function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  // СОСТОЯНИЕ ДЛЯ МОДАЛКИ
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Ключ для принудительного ререндера календаря после добавления тренировки
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleWorkoutAdded = (newWorkout: any) => {
    // Увеличиваем ключ, чтобы TrainingCalendar обновил данные с сервера
    setCalendarKey(prev => prev + 1);
  };

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
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
    <div className={`min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans transition-colors duration-500 ${isMaximized ? "overflow-hidden" : ""}`}>
      <Toaster position="top-center" />

      <div className={`max-w-[1600px] mx-auto space-y-6 px-4 ${isMaximized ? "h-screen flex flex-col space-y-0" : ""}`}>

        {!isMaximized && (
          <>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div
                className="flex items-center space-x-5 group cursor-pointer"
                onClick={() => navigate("/account")}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#131316] flex items-center justify-center border border-white/0 group-hover:border-white/10 transition-all">
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
                    {profile?.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity size={12} className="text-blue-500/50" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Training Calendar</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* КНОПКА ТЕПЕРЬ ОТКРЫВАЕТ ТВОЮ МОДАЛКУ */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-2 stroke-[3px]"/> Добавить
                </button>

                <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#131316] border border-white/[0.05] hover:border-red-500/50 hover:text-red-400 text-gray-400 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all">
                  <LogOut className="w-4 h-4 mr-2"/> Выйти
                </button>
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="flex justify-around bg-[#131316] border border-white/[0.03] py-2 px-4 rounded-xl shadow-2xl mb-8">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.path);
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-1 transition-all py-1 w-24 ${isActive ? "text-blue-500" : "text-gray-600 hover:text-gray-300"}`}>
                    <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}/>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em]`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
        {!isMaximized && (
          <div className="flex flex-wrap items-center gap-4 bg-[#131316] p-4 rounded-xl border border-white/[0.03] shadow-xl relative mb-6">
            <div className="flex items-center bg-black/40 rounded-lg border border-white/[0.05] p-1">
              <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="p-1.5 hover:text-blue-500 transition-colors text-gray-400"><ChevronLeft size={18}/></button>
              <div className="relative" ref={pickerRef}>
                <button onClick={() => setShowPicker(!showPicker)} className={`flex items-center gap-2 px-6 py-1 text-[10px] font-black uppercase tracking-[0.2em] min-w-[160px] text-center transition-all ${showPicker ? 'text-blue-500' : 'text-white hover:text-blue-400'}`}>
                  <CalendarIcon size={14} /> {currentDate.format('MMMM YYYY')} <ChevronDown size={14} className={`transition-transform ${showPicker ? 'rotate-180' : ''}`} />
                </button>
                {showPicker && (
                  <div className="absolute top-full left-0 mt-4 z-[110] bg-[#0f0f11] border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-2">
                    <DatePicker date={currentDate.toDate()} onChange={(date) => { setCurrentDate(dayjs(date)); setShowPicker(false); }} locale={ru} color="#3b82f6" />
                  </div>
                )}
              </div>
              <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="p-1.5 hover:text-blue-500 transition-colors text-gray-400"><ChevronRight size={18}/></button>
            </div>

            <button
              onClick={() => setIsMaximized(true)}
              className="bg-white/[0.03] text-gray-400 border border-white/[0.05] hover:bg-white/[0.08] hover:text-white flex items-center gap-2 px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
            >
              <Maximize2 size={14} /> Весь экран
            </button>
          </div>
        )}

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className={`transition-all duration-700 ease-in-out flex flex-col ${
          isMaximized
            ? "fixed inset-0 z-[100] bg-[#0f0f0f] p-4 md:p-8 overflow-hidden h-screen"
            : "bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-2xl h-auto"
        }`}>
          {isMaximized && (
            <div className="flex justify-between items-center mb-6 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                    <CalendarDays className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">{currentDate.format('MMMM YYYY')}</h2>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Full Screen Analysis</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                    <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))} className="p-2 hover:text-blue-500 transition-colors text-gray-400"><ChevronLeft size={20}/></button>
                    <span className="px-4 text-[11px] font-black uppercase tracking-widest text-white">{currentDate.format('MMMM')}</span>
                    <button onClick={() => setCurrentDate(currentDate.add(1, "month"))} className="p-2 hover:text-blue-500 transition-colors text-gray-400"><ChevronRight size={20}/></button>
                  </div>
                  <button onClick={() => setIsMaximized(false)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all">
                    <X size={24} />
                  </button>
               </div>
            </div>
          )}

          <div className={`flex-grow w-full overflow-hidden flex flex-col ${isMaximized ? "" : "p-4 md:p-8"}`}>
            <TrainingCalendar key={calendarKey} currentMonth={currentDate} isMaximized={isMaximized} />
          </div>
        </div>
      </div>

      {/* ПОДКЛЮЧЕНИЕ ТВОЕЙ МОДАЛКИ */}
      <CalendarModalAdd
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWorkout={handleWorkoutAdded}
      />
    </div>
  );
}