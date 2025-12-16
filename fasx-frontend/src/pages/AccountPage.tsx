import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Users, Edit3, ChevronDown, X, Search
} from "lucide-react";

// API (замени на реальный путь, если нужно)
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const AccountHeader = ({ name, onLogout }: { name?: string; onLogout: () => void }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
    <div className="flex items-center space-x-4">
      <div className="relative group">
        <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800 transition-transform group-hover:scale-105"/>
        <div className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full border-2 border-[#0f0f0f]">
          <Trophy size={10} className="text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{name || "Спортсмен"}</h1>
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center transition-all shadow-lg shadow-blue-900/20 active:scale-95">
        <Plus className="w-3.5 h-3.5 mr-1.5 stroke-[3px]"/> Добавить
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/10 hover:text-red-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center transition-all">
        <LogOut className="w-3.5 h-3.5 mr-1.5"/> Выйти
      </button>
    </div>
  </div>
);

// --- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ---

const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

        {/* Шапка модалки */}
        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Настройки профиля</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-md">
            <X size={24} />
          </button>
        </div>

        {/* Форма */}
        <div className="p-6 space-y-6">

          {/* Блок 1: Имя и Фамилия */}
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

          {/* Блок 2: Биография */}
          <div className="space-y-1.5">
            <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Биография / О себе</label>
            <textarea
              placeholder="Расскажите о своем спортивном опыте или целях..."
              rows={3}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>

          {/* Блок 3: Спортивные настройки */}
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
                  <ChevronDown className="absolute right-4 top-3 text-gray-600 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Специальная ассоциация</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>Норвежская ассоциация</option>
                    <option>ФЛГР (Россия)</option>
                    <option>Другая</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600 pointer-events-none" size={16} />
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
                  <ChevronDown className="absolute right-4 top-3 text-gray-600 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Название клуба (вручную)</label>
                <input type="text" placeholder="Введите название..." className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>

          {/* Блок 4: Настройки связи */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Приватность и связь</h3>

             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 checked:border-blue-600 transition-all" defaultChecked />
                  <Plus size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-gray-300 text-[12px] font-medium group-hover:text-white transition-colors">Уведомлять тренера о прошедших тренировках</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 checked:border-blue-600 transition-all" />
                  <Plus size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-gray-300 text-[12px] font-medium group-hover:text-white transition-colors">Скрыть профиль из общего поиска</span>
             </label>
          </div>
        </div>

        {/* Футер */}
        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold transition-colors">
             Отмена
          </button>
          <button className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА (AccountPage) ---

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
        setProfile(data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Шапка */}
        <AccountHeader name={profile?.name} onLogout={() => navigate('/login')} />

        {/* Навигация */}
        <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-2 px-4 rounded-xl mb-6 shadow-md">
          {[
            { label: "Главная", icon: Home, path: "/daily" },
            { label: "Тренировки", icon: BarChart3, path: "/profile" },
            { label: "Планирование", icon: ClipboardList, path: "/planning" },
            { label: "Статистика", icon: CalendarDays, path: "/statistics" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center text-[10px] transition-all py-1.5 px-4 rounded-lg
                ${location.pathname.includes(item.path) || (item.path === "/profile" && location.pathname === "/account") ? "text-blue-500 bg-blue-500/5" : "text-gray-400"}`}
            >
              <item.icon className="w-5 h-5 mb-1"/>
              <span className="uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Контент профиля */}
        <div className="max-w-[800px] mx-auto bg-[#1a1a1d] rounded-2xl border border-gray-800 p-8 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3 text-blue-500">
              <User size={18} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Ваш Профиль</h2>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-xs text-blue-400 font-bold transition-all"
            >
              <Edit3 size={14} /> Изменить данные
            </button>
          </div>

          <div className="space-y-8">
            <div className="ml-8">
              <h3 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h3>
              <p className="text-gray-500 text-sm mt-1 italic tracking-wide">Лыжные гонки • IL Aasguten ski</p>
            </div>

            <div className="ml-8 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-gray-800 pt-8">
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1.5">Ассоциация</p>
                <p className="text-white text-sm font-bold">Норвежская ассоциация</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1.5">Пульсовые зоны</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(z => <div key={z} className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500/50"></div>)}
                </div>
              </div>
            </div>
          </div>
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