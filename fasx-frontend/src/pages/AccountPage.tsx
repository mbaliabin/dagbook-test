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
        <h1 className="text-2xl font-bold text-white tracking-tight">{name || "Спортсмен"}</h1>
        <p className="text-xs text-gray-400 font-medium">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center transition-all shadow-lg shadow-blue-900/20 active:scale-95">
        <Plus className="w-4 h-4 mr-1.5"/> Добавить
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/20 hover:text-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center transition-all">
        <LogOut className="w-4 h-4 mr-1.5"/> Выйти
      </button>
    </div>
  </div>
);

const NavigationMenu = ({ menuItems, navigate, currentPath }) => (
  <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl mb-6 shadow-md">
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentPath.includes(item.path) || (item.path === "/profile" && currentPath === "/account");
      return (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center text-[10px] transition-all py-1.5 px-4 rounded-lg
            ${isActive ? "text-blue-500 font-bold bg-blue-500/5" : "text-gray-400 hover:text-white"}`}
        >
          <Icon className="w-5 h-5 mb-1"/>
          <span className="uppercase tracking-widest">{item.label}</span>
        </button>
      );
    })}
  </div>
);

// --- МОДАЛЬНОЕ ОКНО (Сбалансированный размер) ---

const EditAccountModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col">

        {/* Хедер */}
        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Редактирование профиля</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Тело формы */}
        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Дата рождения</label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Пол</label>
              <div className="relative">
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none appearance-none cursor-pointer">
                  <option>Мужчина</option>
                  <option>Женщина</option>
                </select>
                <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
              </div>
            </div>
          </div>

          {/* Спорт */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Спортивные данные</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Вид спорта</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>Лыжные гонки</option>
                    <option>Легкая атлетика</option>
                    <option>Велоспорт</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Ассоциация</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>Норвежская ассоциация</option>
                    <option>ФЛГР (Россия)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Выбрать клуб</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>IL Aasguten ski</option>
                    <option>Spitfire Team</option>
                    <option>Другой</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Своё название клуба</label>
                <input type="text" placeholder="Введите название..." className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>

          {/* Пульсовые зоны */}
          <div className="space-y-2">
            <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Зоны ЧСС</label>
            <div className="grid grid-cols-5 border border-gray-800 rounded-xl overflow-hidden text-[10px]">
              {['I1', 'I2', 'I3', 'I4', 'I5'].map((z, i) => (
                <div key={z} className="bg-[#2a2a2d] py-1 border-r border-gray-800 text-center text-gray-400 font-bold">{z}</div>
              ))}
              <input className="bg-transparent py-2 border-r border-gray-800 text-center text-white text-xs outline-none" defaultValue="118-143" />
              <input className="bg-transparent py-2 border-r border-gray-800 text-center text-white text-xs outline-none" defaultValue="143-161" />
              <input className="bg-transparent py-2 border-r border-gray-800 text-center text-white text-xs outline-none" defaultValue="161-171" />
              <input className="bg-transparent py-2 border-r border-gray-800 text-center text-white text-xs outline-none" defaultValue="171-181" />
              <input className="bg-transparent py-2 text-center text-white text-xs outline-none" defaultValue="181-200" />
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold transition-colors">
             Отмена
          </button>
          <button className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all active:scale-95">
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

  useEffect(() => {
    getUserProfile().then(data => {
      setProfile(data);
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-xs tracking-widest uppercase animate-pulse">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        <AccountHeader name={profile?.name} onLogout={() => navigate('/login')} />

        <NavigationMenu
          menuItems={[
            { label: "Главная", icon: Home, path: "/daily" },
            { label: "Тренировки", icon: BarChart3, path: "/profile" },
            { label: "Планирование", icon: ClipboardList, path: "/planning" },
            { label: "Статистика", icon: CalendarDays, path: "/statistics" },
          ]}
          navigate={navigate}
          currentPath={location.pathname}
        />

        <div className="max-w-[800px] mx-auto bg-[#1a1a1d] rounded-2xl border border-gray-800 p-8 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3 text-blue-500">
              <User size={18} />
              <h2 className="text-[10px] font-black uppercase tracking-widest">Профиль</h2>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-xs text-blue-400 font-bold transition-all">
              <Edit3 size={14} /> Изменить
            </button>
          </div>

          <div className="space-y-8">
            <div className="ml-8">
              <h3 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h3>
              <p className="text-gray-500 text-sm mt-1 italic">Беговые лыжи • IL Aasguten ski</p>
            </div>

            <div className="ml-8 grid grid-cols-3 gap-4 border-t border-gray-800 pt-6">
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black mb-1">Федерация</p>
                <p className="text-white text-sm font-medium">Норвежская ассоциация</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black mb-1">Зоны ЧСС</p>
                <p className="text-white text-sm font-medium">5 настроено</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}