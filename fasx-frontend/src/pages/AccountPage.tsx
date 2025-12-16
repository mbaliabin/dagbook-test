import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Users, Edit3, ChevronDown, X, Search
} from "lucide-react";

// API (Убедитесь, что путь верный)
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const AccountHeader = ({ name, onLogout }: { name?: string, onLogout: () => void }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
    <div className="flex items-center space-x-4">
      <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800"/>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{name || "Спортсмен"}</h1>
        <p className="text-xs text-gray-400 font-medium">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center transition-all shadow-lg active:scale-95">
        <Plus className="w-4 h-4 mr-1.5"/> Добавить
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/20 hover:text-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center transition-all">
        <LogOut className="w-4 h-4 mr-1.5"/> Выйти
      </button>
    </div>
  </div>
);

// --- МОДАЛЬНОЕ ОКНО ---

const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col">
        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Редактирование профиля</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Биография / О себе</label>
            <textarea rows={3} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600 resize-none" placeholder="Расскажите о себе..." />
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Вид спорта</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>Лыжные гонки</option>
                  <option>Легкая атлетика</option>
                  <option>Велоспорт</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Ассоциация</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>ФЛГР (Россия)</option>
                  <option>Норвежская ассоциация</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-3">
             <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-5 w-5 rounded border-gray-700 bg-[#0f0f0f] accent-blue-600" defaultChecked />
                <span className="text-gray-300 text-xs font-medium">Уведомлять тренера о прошедших тренировках</span>
             </label>
          </div>
        </div>

        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 text-sm font-bold">Отмена</button>
          <button className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile().then(data => {
      setProfile(data);
      setLoading(false);
    }).catch(() => navigate('/login'));
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-xs uppercase tracking-widest animate-pulse">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <AccountHeader name={profile?.name} onLogout={() => navigate('/login')} />

        <div className="max-w-[800px] mx-auto bg-[#1a1a1d] rounded-2xl border border-gray-800 p-8 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Ваш Профиль</h2>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-gray-700 px-4 py-1.5 rounded-lg text-xs text-blue-400 font-bold hover:bg-gray-800 transition-all">
              <Edit3 size={14} /> Изменить
            </button>
          </div>

          <div className="ml-8">
            <h3 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h3>
            <p className="text-gray-500 text-sm mt-1">Лыжные гонки • IL Aasguten ski</p>
          </div>
        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}