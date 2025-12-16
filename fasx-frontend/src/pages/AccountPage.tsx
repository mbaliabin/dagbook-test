import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Users, Edit3, ChevronDown, X, Search, Info
} from "lucide-react";

// API
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
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center transition-all shadow-lg active:scale-95">
        <Plus className="w-3.5 h-3.5 mr-1.5 stroke-[3px]"/> Добавить
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/10 hover:text-red-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center transition-all">
        <LogOut className="w-3.5 h-3.5 mr-1.5"/> Выйти
      </button>
    </div>
  </div>
);

// --- МОДАЛЬНОЕ ОКНО ---

const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col">

        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Настройки профиля</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 1. Имя, Фамилия */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          {/* 2. Дата рождения (Read-only) и Пол */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider flex items-center gap-1">
                Дата рождения <Info size={10} className="text-gray-600" />
              </label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Пол</label>
              <div className="relative">
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                  <option>Мужчина</option>
                  <option>Женщина</option>
                </select>
                <ChevronDown className="absolute right-4 top-3 text-gray-600 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* 3. Биография */}
          <div className="space-y-1.5">
            <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Биография / О себе</label>
            <textarea placeholder="Расскажите о себе..." rows={3} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all resize-none" />
          </div>

          {/* 4. Спортивные данные */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Спортивные данные</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Вид спорта</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>Лыжные гонки</option>
                  <option>Легкая атлетика</option>
                  <option>Велоспорт</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Ассоциация</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>Норвежская ассоциация</option>
                  <option>ФЛГР (Россия)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Выбрать клуб</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>IL Aasguten ski</option>
                  <option>Другой</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 tracking-wider">Своё название клуба</label>
                <input type="text" placeholder="Введите название..." className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>

          {/* 5. Уведомления */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
             <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-700 bg-[#0f0f0f] accent-blue-600" defaultChecked />
                <span className="text-gray-300 text-[12px] font-medium group-hover:text-white transition-colors">Уведомлять тренера о прошедших тренировках</span>
             </label>
          </div>
        </div>

        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 text-sm font-bold">Отмена</button>
          <button className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg active:scale-95">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА ---

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile().then(data => { setProfile(data); setLoading(false); })
    .catch(() => navigate('/login'));
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-xs uppercase animate-pulse tracking-[0.3em]">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        <AccountHeader name={profile?.name} onLogout={() => navigate('/login')} />

        {/* Карточка профиля */}
        <div className="max-w-[900px] mx-auto bg-[#1a1a1d] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tight">{profile?.name}</h2>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5"><CalendarDays size={14}/> 10.12.1995</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <span>Мужчина</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-xl text-xs text-blue-400 font-bold transition-all">
                <Edit3 size={14} /> Редактировать профиль
              </button>
            </div>

            {/* Блок: О себе */}
            <div className="bg-[#0f0f0f]/50 p-5 rounded-2xl border border-gray-800/50">
              <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">Биография</p>
              <p className="text-gray-400 text-sm leading-relaxed italic">
                {profile?.bio || "Информация о себе не заполнена. Расскажите о своих спортивных достижениях..."}
              </p>
            </div>

            {/* Сетка данных */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Вид спорта</p>
                <p className="text-white text-sm font-bold">Лыжные гонки</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Команда / Клуб</p>
                <p className="text-white text-sm font-bold">IL Aasguten ski</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Ассоциация</p>
                <p className="text-white text-sm font-bold leading-tight">Норвежская ассоциация</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Пульсовые зоны</p>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(z => <div key={z} className="w-4 h-1.5 rounded-full bg-blue-500/30"></div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Дополнительный блок (Тренеры) */}
          <div className="bg-[#1e1e21]/40 p-6 border-t border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Мои тренеры</span>
            </div>
            <span className="text-[10px] text-gray-600 font-medium px-3 py-1 bg-black/30 rounded-full italic">Список пуст</span>
          </div>
        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}