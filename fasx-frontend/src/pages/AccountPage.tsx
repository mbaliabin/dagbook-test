import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, X, Info, Users, ChevronDown
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- КОМПОНЕНТ ТАБЛИЦЫ ЗОН ДЛЯ МОДАЛКИ (ЦВЕТА ИЗ СТАТИСТИКИ) ---
const HRZonesTable = () => {
  const zones = [
    { id: 'I1', color: '#4ade80', range: '118 - 143' },
    { id: 'I2', color: '#22d3ee', range: '143 - 161' },
    { id: 'I3', color: '#facc15', range: '161 - 171' },
    { id: 'I4', color: '#fb923c', range: '171 - 181' },
    { id: 'I5', color: '#ef4444', range: '181 - 200' },
  ];

  return (
    <div className="space-y-3 mt-4">
      <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-1">
        Мои зоны частоты сердечных сокращений
      </label>
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#0f0f0f]">
        <div className="grid grid-cols-5 text-center text-[10px] font-black uppercase">
          {zones.map(z => (
            <div key={z.id} style={{ backgroundColor: `${z.color}33`, color: z.color }} className="py-2 border-r border-gray-800 last:border-0">
              {z.id}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 text-center">
          {zones.map((z, i) => (
            <input
              key={i}
              type="text"
              defaultValue={z.range}
              className="w-full py-3 text-center outline-none border-r border-gray-800 last:border-0 bg-transparent text-white text-sm focus:bg-blue-600/10 transition-colors"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- МОДАЛЬНОЕ ОКНО ---
const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1d] w-full max-w-[600px] max-h-[95vh] overflow-y-auto rounded-xl border border-gray-700 shadow-2xl flex flex-col">
        <div className="bg-[#1f1f22] p-5 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Изменить информацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1">Имя</label>
              <input type="text" defaultValue="Максим Игоревич" className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm focus:border-blue-600 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1">Фамилия</label>
              <input type="text" defaultValue="Балябин" className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm focus:border-blue-600 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1">Дата рождения</label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 text-gray-500 text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase ml-1">Пол</label>
              <select className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm outline-none bg-[#1f1f22]">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Спортивные настройки</h3>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm outline-none"><option>беговые лыжи</option></select>
              <select className="bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm outline-none"><option>Норвежская ассоциация</option></select>
            </div>
            <input type="text" defaultValue="IL Aasguten ski" className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm" />
          </div>

          <HRZonesTable />
        </div>

        <div className="p-5 bg-[#1f1f22] border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400 text-sm font-bold hover:text-white px-4">Отмена</button>
          <button className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm transition-all shadow-lg active:scale-95">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile().then(data => { setProfile(data); setLoading(false); }).catch(() => navigate('/login'));
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

        {/* HEADER (Стиль как на StatsPage) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800"/>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{profile?.name || "Максим Балябин"}</h1>
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

        {/* MENU (Стиль как на StatsPage) */}
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

        {/* PROFILE CARD */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-700 p-10 space-y-12">

          {/* Секция: Персональная информация */}
          <section className="relative">
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <User size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Персональная информация</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute right-0 top-0 flex items-center gap-2 border border-gray-700 bg-[#1f1f22] hover:bg-[#2a2a2d] px-4 py-1.5 rounded text-[11px] text-gray-200 font-bold transition-all"
              >
                <Edit3 size={14} /> Изменить
              </button>
            </div>
            <div className="ml-8">
              <h3 className="text-3xl font-black text-white tracking-tight">{profile?.name || "Максим Игоревич Балябин"}</h3>
              <p className="text-gray-500 text-sm mt-2 flex items-center gap-2 italic">
                Дата рождения: 10.12.1995 • Мужчина
              </p>
            </div>
          </section>

          {/* Секция: Спортивная информация (ВЫШЕ ЗОН) */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Trophy size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Спортивная информация</h2>
            </div>
            <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1.5">Спорт</p>
                <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2.5 px-4 rounded-lg border border-gray-800">беговые лыжи</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1.5">Клуб</p>
                <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2.5 px-4 rounded-lg border border-gray-800">IL Aasguten ski</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1.5">Федерация</p>
                <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2.5 px-4 rounded-lg border border-gray-800">Норвежская лыжная ассоциация</p>
              </div>
            </div>
          </section>

          {/* Секция: Зоны интенсивности (НИЖЕ СПОРТА) */}
          <section>
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Heart size={18} className="text-blue-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Зоны интенсивности</h2>
            </div>
            <div className="ml-8 space-y-4">
              <div className="flex flex-wrap gap-3">
                {hrZones.map((z) => (
                  <div key={z.label} className="flex items-center bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden shadow-inner">
                    <span style={{ backgroundColor: z.color }} className="px-3 py-1.5 text-[11px] font-black text-black uppercase">
                      {z.label}
                    </span>
                    <span className="px-4 py-1.5 text-xs text-gray-200 font-bold">
                      {z.range}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 flex items-center gap-1 uppercase font-bold tracking-widest ml-1">
                <Info size={12}/> зоны частоты сердечных сокращений
              </p>
            </div>
          </section>

          {/* Секция: Мои тренеры */}
          <section className="border-t border-gray-800 pt-10">
            <div className="flex justify-between items-center text-gray-500 mb-8 cursor-pointer group">
              <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                <Users size={18} className="text-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Мои тренеры</h2>
              </div>
              <ChevronDown size={20} />
            </div>
            <div className="ml-8 space-y-5">
              <p className="text-sm text-gray-600 italic">У вас пока нет привязанных тренеров.</p>
              <button className="flex items-center gap-2 border border-gray-700 bg-[#1f1f22] hover:bg-blue-600/10 hover:border-blue-500/50 px-6 py-2.5 rounded-xl text-xs text-blue-400 font-black uppercase tracking-widest transition-all shadow-md active:scale-95">
                <Plus size={16} className="stroke-[3px]"/> Добавить тренера / Предоставить доступ
              </button>
            </div>
          </section>

        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}