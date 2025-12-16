import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, ChevronDown, Camera
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        console.log("Загруженные данные профиля:", data); // Отладка в консоли
        setProfile(data);
      } catch (err) {
        console.error("Ошибка профиля:", err);
        if (err instanceof Error && err.message.includes("авторизации")) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Загрузка профиля...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            {/* Аватарка в хедере: фото или инициал */}
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-12 h-12 rounded-full object-cover border border-gray-800" alt="Avatar" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {profile?.name || "Пользователь"}
              </h1>
              <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-colors font-semibold shadow-lg shadow-blue-900/20">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-[#1f1f22] border border-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg flex items-center transition-colors">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl mb-6 shadow-sm">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path) || (item.path === "/profile" && location.pathname === "/account");
            return (
              <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center text-xs transition-colors py-1 w-20
                              ${isActive ? "text-blue-500 font-bold" : "text-gray-500 hover:text-white"}`}
              >
                <Icon className="w-5 h-5 mb-1"/>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ ПРОФИЛЯ */}
        <div className="bg-[#1a1a1d] rounded-2xl border border-gray-800 p-8 md:p-12 space-y-12 shadow-xl">

          {/* 1. Персональная информация */}
          <section className="relative">
            <div className="flex items-center gap-2 text-gray-500 mb-8 border-b border-gray-800 pb-4">
              <User size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Персональная информация</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="ml-auto flex items-center gap-1.5 border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d] px-4 py-1.5 text-[10px] text-gray-200 transition-all rounded-lg font-bold uppercase tracking-wider"
              >
                <Edit3 size={14} /> Изменить
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
              {/* БОЛЬШОЕ ФОТО ПРОФИЛЯ */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl group-hover:border-blue-500 transition-all duration-300">
                    <img
                      src={profile?.avatarUrl || "/profile.jpg"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Edit3 size={12} /> Изменить фото
                </button>
              </div>

              {/* ТЕКСТ: ИМЯ, БИО */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">
                    {profile?.name || "Имя не указано"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                    <span>10.12.1995</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>Мужчина</span>
                  </p>
                </div>

                <div className="max-w-2xl mx-auto md:mx-0">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.15em] mb-2">Биография</p>
                  <p className="text-gray-400 text-sm leading-relaxed italic bg-[#1f1f22]/30 p-5 rounded-xl border border-gray-800/50 min-h-[80px]">
                    {profile?.bio || "Информация о себе еще не добавлена."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Спортивная информация */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-8 border-b border-gray-800 pb-4">
              <Trophy size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Спортивная информация</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:ml-8">
              <div className="bg-[#1f1f22]/50 p-5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Вид спорта</p>
                <p className="text-white text-base font-semibold">{profile?.sportType || "Не указан"}</p>
              </div>
              <div className="bg-[#1f1f22]/50 p-5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Название клуба</p>
                <p className="text-white text-base font-semibold">{profile?.club || "Не указан"}</p>
              </div>
              <div className="bg-[#1f1f22]/50 p-5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Ассоциация</p>
                <p className="text-white text-base font-semibold">{profile?.association || "Не указана"}</p>
              </div>
            </div>
          </section>

          {/* 3. Зоны интенсивности */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-8 border-b border-gray-800 pb-4">
              <Heart size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Зоны интенсивности (ЧСС)</h2>
            </div>
            <div className="md:ml-8 flex flex-wrap gap-3">
              {hrZones.map((z) => (
                <div key={z.label} className="flex items-center bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-default">
                  <span style={{ backgroundColor: z.color }} className="px-4 py-2 text-[11px] font-black text-black uppercase">
                    {z.label}
                  </span>
                  <span className="px-5 py-2 text-sm text-gray-200 font-bold">
                    {z.range} <span className="text-[10px] text-gray-500 font-normal ml-1">уд/мин</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Мои тренеры */}
          <section className="pt-4">
            <div className="flex justify-between items-center text-gray-500 mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Мои тренеры</h2>
              </div>
              <ChevronDown size={20} className="text-gray-700 cursor-pointer hover:text-white" />
            </div>
            <div className="md:ml-8">
              <div className="bg-[#1f1f22]/30 border border-dashed border-gray-700 p-10 rounded-2xl text-center">
                <p className="text-sm text-gray-500 italic mb-5">У вас пока нет привязанных тренеров.</p>
                <button className="inline-flex items-center gap-2 border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 px-6 py-3 rounded-xl text-[11px] text-blue-400 font-bold uppercase tracking-widest transition-all">
                  <Plus size={16} /> Добавить тренера / Предоставить доступ
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Модальное окно */}
      <EditAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}