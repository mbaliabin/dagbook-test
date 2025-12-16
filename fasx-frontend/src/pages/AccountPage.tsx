import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Users, Edit3, ChevronDown, X, Search
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

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

// --- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ (УВЕЛИЧЕННОЕ) ---

const EditAccountModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Увеличен max-w до 700px и добавлен масштаб */}
      <div className="bg-[#1a1a1d] w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-200">

        {/* Хедер: крупнее текст и падинги */}
        <div className="bg-[#2a2a2d] p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Изменить информацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full">
            <X size={28} />
          </button>
        </div>

        {/* Тело: текст 16px (base) вместо 12-14px */}
        <div className="p-8 space-y-8 text-base">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Дата рождения</label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f]/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 text-lg cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium ml-1">Пол</label>
              <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:border-blue-500 outline-none appearance-none cursor-pointer">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-6">Настройки обучения</h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <select className="bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-base outline-none cursor-pointer hover:border-gray-600"><option>Беговые лыжи</option></select>
              <select className="bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-3 text-white text-base outline-none cursor-pointer hover:border-gray-600"><option>Норвежская ассоциация</option></select>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-4 text-gray-500" size={20} />
              <input type="text" placeholder="Поиск клуба (например: IL Aasguten ski)" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white text-base outline-none focus:border-blue-500 transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-gray-400 text-sm font-medium ml-1">Зоны интенсивности ЧСС</label>
            <div className="border border-gray-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="grid grid-cols-5 text-xs font-black text-center">
                <div className="bg-green-500/20 text-green-400 py-3 border-r border-gray-800/50">I1</div>
                <div className="bg-cyan-500/20 text-cyan-400 py-3 border-r border-gray-800/50">I2</div>
                <div className="bg-yellow-500/20 text-yellow-400 py-3 border-r border-gray-800/50">I3</div>
                <div className="bg-orange-500/20 text-orange-400 py-3 border-r border-gray-800/50">I4</div>
                <div className="bg-red-500/20 text-red-400 py-3">I5</div>
              </div>
              <div className="grid grid-cols-5 bg-[#0a0a0c] text-center border-t border-gray-800">
                <input className="bg-transparent py-4 border-r border-gray-800/50 text-center outline-none text-white text-base font-medium" defaultValue="118 - 143" />
                <input className="bg-transparent py-4 border-r border-gray-800/50 text-center outline-none text-white text-base font-medium" defaultValue="143 - 161" />
                <input className="bg-transparent py-4 border-r border-gray-800/50 text-center outline-none text-white text-base font-medium" defaultValue="161 - 171" />
                <input className="bg-transparent py-4 border-r border-gray-800/50 text-center outline-none text-white text-base font-medium" defaultValue="171 - 181" />
                <input className="bg-transparent py-4 text-center outline-none text-white text-base font-medium" defaultValue="181 - 200" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-xl border border-transparent hover:border-gray-700 transition-all">
                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" defaultChecked />
                <span className="text-gray-300 group-hover:text-white text-sm leading-snug">Уведомлять тренера об изменениях и комментариях</span>
             </label>
             <label className="flex items-center gap-4 cursor-pointer group bg-white/5 p-4 rounded-xl border border-transparent hover:border-gray-700 transition-all">
                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded" defaultChecked />
                <span className="text-gray-300 group-hover:text-white text-sm leading-snug">Скрыть мой профиль из общего поиска пользователей</span>
             </label>
          </div>
        </div>

        {/* Футер: выше кнопки, четче акценты */}
        <div className="p-6 bg-[#141417] border-t border-gray-800 flex justify-between items-center sticky bottom-0">
          <button onClick={onClose} className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-colors flex items-center gap-2 text-lg">
             <span>Отмена</span>
          </button>
          <button className="px-12 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg transition-all shadow-[0_4_20_rgba(37,99,235,0.4)]">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА ---

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans relative">
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
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-5 py-2 rounded-xl text-sm font-bold text-blue-400 transition-all active:scale-95"
                  >
                    <Edit3 size={16} /> Изменить
                  </button>
                </div>
                <div className="ml-8">
                  <h3 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h3>
                  <p className="text-gray-500 text-base mt-2 font-light">Дата рождения: 10.12.1995</p>
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
                    <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-bold text-blue-500/80">Спорт</p>
                    <p className="text-white text-lg font-medium">Беговые лыжи</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-bold text-blue-500/80">Клуб</p>
                    <p className="text-white text-lg font-medium">IL Aasguten ski</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-bold text-blue-500/80">Федерация</p>
                    <p className="text-white text-lg font-medium leading-relaxed">Норвежская ассоциация</p>
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
                  <div className="flex flex-wrap gap-4">
                    {hrZones.map((zone) => (
                      <div key={zone.id} className={`${zone.color} ${zone.textColor} px-6 py-3 rounded-2xl text-sm font-black border border-white/5 shadow-lg`}>
                        {zone.id} : <span className="text-white ml-2">{zone.range}</span>
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
                className="w-full flex justify-between items-center p-8 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Users size={20} className="text-gray-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">Мои тренеры</h2>
                </div>
                <ChevronDown className={`text-gray-600 transition-transform duration-300 ${openTrainers ? 'rotate-180' : ''}`} size={24} />
              </button>
              {openTrainers && (
                <div className="px-16 pb-10">
                  <p className="text-gray-500 text-base italic font-light">Список тренеров пока пуст</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}