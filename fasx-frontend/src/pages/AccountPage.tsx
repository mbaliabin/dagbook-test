import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, ChevronDown, Camera,
  Shield, Activity, Globe
} from "lucide-react";

// Импорт модального окна
import EditAccountModal from "../components/AccountPage/EditAccountModal";
// API
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-400">Загрузка данных...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6 font-sans antialiased">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1d] border border-gray-700 flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="text-xl font-bold">{profile?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || "Пользователь"}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center transition-colors">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/profile" && location.pathname === "/account");
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
            );
          })}
        </div>

        {/* CONTENT CARD */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-700 p-6 md:p-10 space-y-12 shadow-lg">

          {/* 1. ПЕРСОНАЛЬНАЯ ИНФОРМАЦИЯ */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Личные данные</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#1f1f22] border border-gray-600 hover:bg-[#2a2a2d] px-3 py-1.5 text-xs text-white rounded transition-colors"
              >
                <Edit3 size={14} /> Изменить
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group mx-auto md:mx-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border border-gray-700 bg-[#0e0e10]">
                  <img src={profile?.avatarUrl || "/profile.jpg"} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <h3 className="text-3xl font-bold">{profile?.name || "—"}</h3>
                <p className="text-blue-500 text-sm font-medium">{profile?.profile?.gender || "Пол не указан"}</p>

                <div className="bg-[#0e0e10] p-4 rounded-lg border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Биография</p>
                  <p className="text-sm text-gray-300 leading-relaxed italic">
                    {profile?.profile?.bio || "Информация о себе не добавлена."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. СПОРТИВНАЯ ИНФОРМАЦИЯ (В СТОЛБИК) */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
              <Trophy size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Спортивная информация</h2>
            </div>

            <div className="bg-[#1f1f22] rounded-lg border border-gray-700 overflow-hidden max-w-2xl">
              {[
                { label: 'Вид спорта', value: profile?.profile?.sportType, icon: Activity },
                { label: 'Клуб / Команда', value: profile?.profile?.club, icon: Shield },
                { label: 'Ассоциация', value: profile?.profile?.association, icon: Globe }
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-5 ${i !== arr.length - 1 ? 'border-b border-gray-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {item.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. ЗОНЫ ИНТЕНСИВНОСТИ */}
          <section>
            <div className="flex items-center gap-2 mb-8 border-b border-gray-700 pb-4">
              <Heart size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Пульсовые зоны</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {hrZonesData.map((z) => (
                <div key={z.label} className="flex items-center bg-[#0e0e10] border border-gray-700 rounded overflow-hidden">
                  <div style={{ backgroundColor: z.color }} className="px-3 py-2 text-xs font-bold text-black uppercase">
                    {z.label}
                  </div>
                  <div className="px-4 py-2 text-sm font-bold border-l border-gray-700 min-w-[100px] text-center">
                    {z.range} <span className="text-[10px] text-gray-500 ml-1">BPM</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. МОИ ТРЕНЕРЫ */}
          <section>
            <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Мои тренеры</h2>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </div>
            <div className="bg-[#0e0e10] border border-dashed border-gray-700 p-8 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-4 italic">У вас пока нет привязанных тренеров</p>
              <button className="text-blue-500 text-[10px] font-black uppercase border border-blue-500/30 px-5 py-2 rounded hover:bg-blue-500/10 transition-all tracking-widest">
                Добавить тренера
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