import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, ChevronDown
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const hrZones = [
    { label: 'I1', range: '118 - 143', color: '#4ade80' },
    { label: 'I2', range: '143 - 161', color: '#22d3ee' },
    { label: 'I3', range: '161 - 171', color: '#facc15' },
    { label: 'I4', range: '171 - 181', color: '#fb923c' },
    { label: 'I5', range: '181 - 200', color: '#ef4444' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800"/>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Пользователь"}</h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center transition-colors">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path) || (item.path === "/profile" && location.pathname === "/account");
            return (
              <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center text-sm transition-colors ${isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-white"}`}
              >
                <Icon className="w-6 h-6"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ ПРОФИЛЯ */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-700 p-10 space-y-12">

          {/* 1. Персональная информация */}
          <section className="relative">
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <User size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Персональная информация</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute right-0 top-0 flex items-center gap-1.5 border border-gray-600 bg-[#1f1f22] hover:bg-[#2a2a2d] px-4 py-1 text-xs text-gray-200 transition-all"
              >
                <Edit3 size={14} /> Изменить
              </button>
            </div>
            <div className="ml-8">
              <h3 className="text-2xl font-bold text-white tracking-tight">{profile?.name}</h3>
              <p className="text-gray-500 text-sm mt-1 italic">Дата рождения: 10.12.1995 • Мужчина</p>
            </div>
          </section>

          {/* 2. Спортивная информация */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Trophy size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Спортивная информация</h2>
            </div>
            <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Спорт</p>
                <p className="text-white text-sm font-semibold">беговые лыжи</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Клуб</p>
                <p className="text-white text-sm font-semibold">IL Aasguten ski</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Федерация</p>
                <p className="text-white text-sm font-semibold">Норвежская ассоциация</p>
              </div>
            </div>
          </section>

          {/* 3. Зоны интенсивности (НИЖЕ Спортивной информации) */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Heart size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Зоны интенсивности</h2>
            </div>
            <div className="ml-8 flex flex-wrap gap-2">
              {hrZones.map((z) => (
                <div key={z.label} className="flex items-center bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
                  <span style={{ backgroundColor: z.color }} className="px-3 py-1 text-[10px] font-black text-black">{z.label}</span>
                  <span className="px-4 py-1 text-xs text-gray-300 font-medium">{z.range}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Мои тренеры (ДОБАВЛЕНО) */}
          <section className="border-t border-gray-800 pt-10">
            <div className="flex justify-between items-center text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Мои тренеры</h2>
              </div>
              <ChevronDown size={20} />
            </div>
            <div className="ml-8 space-y-4">
              <p className="text-sm text-gray-600 italic">У вас пока нет привязанных тренеров.</p>
              <button className="flex items-center gap-2 border border-gray-600 bg-[#1f1f22] hover:bg-[#2a2a2d] px-5 py-2 rounded text-xs text-gray-200 font-bold transition-all shadow-sm">
                <Plus size={16} /> Добавить тренера
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Вызов твоей модалки (здесь используй свой импорт или код модалки, который не трогаем) */}
      {/* <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} /> */}
    </div>
  );
}