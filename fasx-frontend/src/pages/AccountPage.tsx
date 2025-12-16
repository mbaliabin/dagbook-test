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
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-white">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1d] border border-gray-700 overflow-hidden shadow-xl">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-blue-600">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || "Пользователь"}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center transition-colors">
              <Edit3 className="w-4 h-4 mr-2"/> Изменить профиль
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#1a1a1d] border border-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded transition-colors">
              Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/profile" && location.pathname === "/account");
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500" : "text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-700 p-8 space-y-12">

          {/* SECTION 1: PERSONAL */}
          <section>
            <div className="flex items-center gap-2 mb-8 border-b border-gray-800 pb-4">
              <User size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Основная информация</h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-widest">Биография</p>
                <div className="text-gray-300 text-base leading-relaxed max-w-3xl">
                  {profile?.profile?.bio || "Информация о себе не добавлена."}
                </div>
              </div>
              <div className="flex gap-10">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">Пол</p>
                  <p className="text-blue-500 font-semibold">{profile?.profile?.gender || "—"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: SPORT — ЧИСТЫЙ СПИСОК */}
          <section>
            <div className="flex items-center gap-2 mb-8 border-b border-gray-800 pb-4">
              <Trophy size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Спортивные данные</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 max-w-xl">
              {[
                { label: 'Вид спорта', value: profile?.profile?.sportType },
                { label: 'Клуб / Команда', value: profile?.profile?.club },
                { label: 'Ассоциация', value: profile?.profile?.association }
              ].map((item, i) => (
                <div key={i} className="flex flex-col border-b border-gray-800/50 pb-4">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.15em] mb-1">{item.label}</span>
                  <span className="text-lg font-semibold text-white">{item.value || "—"}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: HR ZONES */}
          <section>
            <div className="flex items-center gap-2 mb-8 border-b border-gray-800 pb-4">
              <Heart size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Пульсовые зоны</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {hrZonesData.map((z) => (
                <div key={z.label} className="flex flex-col bg-[#0e0e10] border border-gray-700 rounded-lg min-w-[120px] p-4">
                   <div className="flex items-center gap-2 mb-1">
                      <div style={{ backgroundColor: z.color }} className="w-2 h-2 rounded-full"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{z.label}</span>
                   </div>
                   <span className="text-xl font-bold">{z.range}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: COACHES */}
          <section>
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Тренеры</h2>
              </div>
              <ChevronDown size={20} className="text-gray-500 cursor-pointer" />
            </div>
            <div className="text-gray-500 italic text-sm border border-dashed border-gray-800 p-8 rounded-lg text-center">
              Список тренеров пуст
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