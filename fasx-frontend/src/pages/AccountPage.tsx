import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, ChevronDown, Camera
} from "lucide-react";

import EditAccountModal from "../components/AccountPage/EditAccountModal";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Ошибка загрузки профиля:", err);
      if (err instanceof Error && (err.message.includes("401"))) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const hrZonesData = [
    { label: 'I1', range: profile?.profile?.hrZones?.I1 || '---', color: '#4ade80', shadow: 'shadow-green-500/20' },
    { label: 'I2', range: profile?.profile?.hrZones?.I2 || '---', color: '#22d3ee', shadow: 'shadow-cyan-500/20' },
    { label: 'I3', range: profile?.profile?.hrZones?.I3 || '---', color: '#facc15', shadow: 'shadow-yellow-500/20' },
    { label: 'I4', range: profile?.profile?.hrZones?.I4 || '---', color: '#fb923c', shadow: 'shadow-orange-500/20' },
    { label: 'I5', range: profile?.profile?.hrZones?.I5 || '---', color: '#ef4444', shadow: 'shadow-red-500/20' },
  ];

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 w-full font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto space-y-8 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
          <div className="flex items-center space-x-5">
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-500/20 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="text-xl">{profile?.name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {profile?.name || "Пользователь"}
              </h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{dayjs().format("D MMMM YYYY")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs px-5 py-2.5 rounded-xl flex items-center transition-all font-bold shadow-lg shadow-indigo-500/25 active:scale-95 uppercase tracking-wider">
              <Plus className="w-4 h-4 mr-1.5 stroke-[3]"/> Тренировка
            </button>
            <button onClick={() => navigate("/login")} className="bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs px-5 py-2.5 rounded-xl flex items-center transition-all border border-slate-700/50 uppercase tracking-wider font-bold">
              <LogOut className="w-4 h-4 mr-1.5"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="flex justify-around bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-2 rounded-2xl shadow-2xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/profile" && location.pathname === "/account");
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1.5 transition-all py-2 w-24 rounded-xl
                  ${isActive ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]" : "text-slate-500 hover:text-slate-200"}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`}/>
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* MAIN CONTENT CARD */}
        <div className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/60 p-8 md:p-12 space-y-16 shadow-2xl backdrop-blur-sm">

          {/* SECTION 1: PERSONAL */}
          <section className="relative">
            <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg"><User size={18} className="text-indigo-400" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-100">Аккаунт</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] text-indigo-300 transition-all rounded-xl font-black uppercase tracking-widest border border-indigo-500/20"
              >
                <Edit3 size={14} /> Изменить
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
              <div className="relative group">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2rem] overflow-hidden border-4 border-slate-800 shadow-2xl group-hover:border-indigo-500/50 transition-all duration-500 rotate-2 group-hover:rotate-0">
                  <img src={profile?.avatarUrl || "/profile.jpg"} alt="Avatar" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                    <Camera className="text-white w-10 h-10" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-8 text-center md:text-left">
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">{profile?.name || "Спортсмен"}</h3>
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-slate-700">
                    {profile?.profile?.gender || "Пол не указан"}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full hidden md:block"></div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">О себе</p>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xl">
                    {profile?.profile?.bio || "Легенды начинаются с первого шага. Добавьте описание своего пути."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: SPORT INFO */}
          <section>
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-800/50">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Trophy size={18} className="text-indigo-400" /></div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-100">Спортивная база</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Вид спорта', value: profile?.profile?.sportType },
                { label: 'Клуб', value: profile?.profile?.club },
                { label: 'Ассоциация', value: profile?.profile?.association }
              ].map((item, i) => (
                <div key={i} className="group bg-slate-800/20 hover:bg-slate-800/40 p-6 rounded-3xl border border-slate-800/50 transition-all">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">{item.label}</p>
                  <p className="text-white text-lg font-bold tracking-tight">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: HR ZONES */}
          <section>
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-800/50">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Heart size={18} className="text-indigo-400" /></div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-100">Пульсовые зоны</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {hrZonesData.map((z) => (
                <div key={z.label} className={`flex items-center bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl transition-all hover:-translate-y-1 ${z.shadow} hover:shadow-2xl`}>
                  <div style={{ backgroundColor: z.color }} className="w-12 h-12 flex items-center justify-center text-xs font-black text-black italic">
                    {z.label}
                  </div>
                  <div className="px-6 py-2">
                    <span className="text-lg text-white font-black tracking-tighter">{z.range}</span>
                    <span className="text-[9px] text-slate-500 font-bold ml-1 uppercase">bpm</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: COACHES */}
          <section className="pb-4">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg"><Users size={18} className="text-indigo-400" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-100">Команда</h2>
              </div>
              <ChevronDown size={20} className="text-slate-600" />
            </div>
            <div className="bg-gradient-to-b from-slate-800/10 to-transparent border-2 border-dashed border-slate-800 p-12 rounded-[2rem] text-center">
              <p className="text-slate-500 font-medium mb-6">У вас пока нет наставников</p>
              <button className="bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/30 px-8 py-3 rounded-2xl text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] transition-all">
                Найти тренера
              </button>
            </div>
          </section>
        </div>
      </div>

      {isModalOpen && (
        <EditAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          profile={profile}
          onUpdate={fetchProfile}
        />
      )}
    </div>
  );
}