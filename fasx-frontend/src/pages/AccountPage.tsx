import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Users, Settings, Edit3, ChevronDown
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Внутри этого же файла) ---

const AccountHeader = ({ name, onLogout }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
    <div className="flex items-center space-x-4">
      <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800"/>
      <div>
        <h1 className="text-2xl font-bold text-white">{name || "Спортсмен"}</h1>
        <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded flex items-center transition-colors shadow-lg shadow-blue-900/20">
        <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/20 hover:text-red-500 text-white text-sm px-3 py-1.5 rounded flex items-center transition-all">
        <LogOut className="w-4 h-4 mr-1"/> Выйти
      </button>
    </div>
  </div>
);

const NavigationMenu = ({ menuItems, navigate, currentPath }) => (
  <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6 shadow-md">
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentPath.includes(item.path) || (item.path === "/profile" && currentPath === "/account");
      return (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center text-sm transition-colors py-1 px-4 rounded-lg
            ${isActive ? "text-blue-500 font-semibold bg-blue-500/5" : "text-gray-400 hover:text-white"}`}
        >
          <Icon className="w-6 h-6 mb-1"/>
          <span>{item.label}</span>
        </button>
      );
    })}
  </div>
);

// --- ОСНОВНАЯ СТРАНИЦА ---

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [openTrainers, setOpenTrainers] = useState(true);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const hrZones = [
    { id: "I1", range: "118 - 143", color: "bg-green-500/20", textColor: "text-green-400" },
    { id: "I2", range: "143 - 161", color: "bg-cyan-500/20", textColor: "text-cyan-400" },
    { id: "I3", range: "161 - 171", color: "bg-yellow-500/20", textColor: "text-yellow-400" },
    { id: "I4", range: "171 - 181", color: "bg-orange-500/20", textColor: "text-orange-400" },
    { id: "I5", range: "181 - 200", color: "bg-red-500/20", textColor: "text-red-400" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        if (err.message?.includes("авторизации")) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-xl font-light tracking-widest">
      ЗАГРУЗКА...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        <AccountHeader name={profile?.name} onLogout={handleLogout} />

        <NavigationMenu
          menuItems={menuItems}
          navigate={navigate}
          currentPath={location.pathname}
        />

        <div className="max-w-[1000px] mx-auto pt-4 space-y-6">
          <div className="bg-[#1a1a1d] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-12">

              {/* Секция: Персональная информация */}
              <section>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3 text-gray-500">
                    <User size={18} />
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Персональная информация</h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-xs text-blue-400 transition-all"
                  >
                    <Edit3 size={14} /> {isEditing ? "Сохранить" : "Изменить"}
                  </button>
                </div>
                <div className="ml-8">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{profile?.name}</h3>
                  <p className="text-gray-500 text-sm mt-2 font-light">Дата рождения: 10.12.1995</p>
                </div>
              </section>

              {/* Секция: Спорт */}
              <section>
                <div className="flex items-center gap-3 text-gray-500 mb-8">
                  <Trophy size={18} />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Спортивная информация</h2>
                </div>
                <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Спорт</p>
                    <p className="text-white font-medium">беговые лыжи</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Клуб</p>
                    <p className="text-white font-medium">IL Aasguten ski</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold">Федерация</p>
                    <p className="text-white font-medium leading-relaxed">Норвежская ассоциация</p>
                  </div>
                </div>
              </section>

              {/* Секция: Зоны ЧСС */}
              <section>
                <div className="flex items-center gap-3 text-gray-500 mb-8">
                  <Heart size={18} />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Зоны интенсивности</h2>
                </div>
                <div className="ml-8 space-y-6">
                  <div className="flex flex-wrap gap-3">
                    {hrZones.map((zone) => (
                      <div key={zone.id} className={`${zone.color} ${zone.textColor} px-4 py-2 rounded-xl text-xs font-bold border border-white/5 shadow-inner`}>
                        {zone.id} : <span className="text-white ml-1">{zone.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Аккордеон: Тренеры */}
            <div className="border-t border-gray-800/50 bg-[#1e1e21]/30">
              <button
                onClick={() => setOpenTrainers(!openTrainers)}
                className="w-full flex justify-between items-center p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-gray-500" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white">Мои тренеры</h2>
                </div>
                <ChevronDown className={`text-gray-600 transition-transform duration-300 ${openTrainers ? 'rotate-180' : ''}`} size={18} />
              </button>
              {openTrainers && (
                <div className="px-14 pb-8">
                  <p className="text-gray-500 text-sm italic font-light">Список тренеров пуст</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}