import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, ChevronDown, Camera,
  Shield, Activity, Globe, Info
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
    { label: 'I1', range: profile?.profile?.hrZones?.I1 || '---', color: '#4ade80' },
    { label: 'I2', range: profile?.profile?.hrZones?.I2 || '---', color: '#22d3ee' },
    { label: 'I3', range: profile?.profile?.hrZones?.I3 || '---', color: '#facc15' },
    { label: 'I4', range: profile?.profile?.hrZones?.I4 || '---', color: '#fb923c' },
    { label: 'I5', range: profile?.profile?.hrZones?.I5 || '---', color: '#ef4444' },
  ];

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-white italic">
       Загрузка...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6 font-sans antialiased">
      <div className="max-w-[1200px] mx-auto space-y-8 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full border-2 border-gray-800 p-1">
              <div className="w-full h-full rounded-full bg-[#1a1a1d] flex items-center justify-center overflow-hidden border border-gray-700">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <span className="text-2xl font-bold">{profile?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{profile?.name || "Пользователь"}</h1>
              <p className="text-sm text-blue-500 font-medium uppercase tracking-widest">{profile?.profile?.gender || "Пол не указан"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black hover:bg-gray-200 text-xs px-5 py-2.5 rounded font-bold transition-all flex items-center">
              <Edit3 size={14} className="mr-2" /> Редактировать профиль
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1a1a1d] border border-gray-700 text-white text-xs px-5 py-2.5 rounded font-bold hover:bg-gray-800 transition-all">
              Выйти
            </button>
          </div>
        </div>

        {/* NAV */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-800 py-3 rounded-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/profile" && location.pathname === "/account");
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-blue-500" : "text-gray-500 hover:text-white"}`}>
                <Icon size={22} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY */}
        <div className="grid md:grid-cols-3 gap-10 pt-4">

          {/* LEFT COLUMN: BIO & SPORT */}
          <div className="md:col-span-2 space-y-12">

            {/* БИОГРАФИЯ - ТЕПЕРЬ ПРОСТО ТЕКСТ */}
            <section>
              <h2 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={14} className="text-blue-500" /> О себе
              </h2>
              <div className="text-gray-300 leading-relaxed text-base max-w-2xl">
                {profile?.profile?.bio ? (
                  <p>{profile.profile.bio}</p>
                ) : (
                  <p className="text-gray-600 italic">Биография не заполнена. Расскажите о своих спортивных целях и достижениях.</p>
                )}
              </div>
            </section>

            {/* СПОРТ - ЧИСТЫЙ СПИСОК БЕЗ РАМОК */}
            <section>
              <h2 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                <Trophy size={14} className="text-blue-500" /> Спортивные данные
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'Вид спорта', value: profile?.profile?.sportType, icon: Activity },
                  { label: 'Команда / Клуб', value: profile?.profile?.club, icon: Shield },
                  { label: 'Ассоциация', value: profile?.profile?.association, icon: Globe }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col border-l-2 border-gray-800 pl-4 py-1">
                    <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">{item.label}</span>
                    <div className="flex items-center gap-2 text-white font-semibold text-lg">
                      <item.icon size={16} className="text-blue-500/50" />
                      {item.value || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ZONES & COACHES */}
          <div className="space-y-12">

            {/* ЗОНЫ ЧСС */}
            <section>
              <h2 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                <Heart size={14} className="text-blue-500" /> Зоны (BPM)
              </h2>
              <div className="space-y-3">
                {hrZonesData.map((z) => (
                  <div key={z.label} className="flex items-center justify-between bg-[#1a1a1d]/50 p-3 rounded border border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: z.color }} className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase">{z.label}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white tracking-tighter">{z.range}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ТРЕНЕРЫ */}
            <section>
              <h2 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                <Users size={14} className="text-blue-500" /> Тренеры
              </h2>
              <div className="border border-dashed border-gray-800 rounded-lg p-6 text-center">
                <p className="text-[11px] text-gray-600 italic">На данный момент тренеры не привязаны к аккаунту.</p>
              </div>
            </section>
          </div>

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