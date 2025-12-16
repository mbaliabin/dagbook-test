import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, X, Info, ChevronDown
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (В СТИЛЕ СТАТИСТИКИ) ---

const AccountHeader = ({ name, onLogout }: { name?: string; onLogout: () => void }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
    <div className="flex items-center space-x-4">
      <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-800"/>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
        <p className="text-sm text-gray-400">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded flex items-center transition-colors shadow-lg active:scale-95">
        <Plus className="w-4 h-4 mr-1.5 stroke-[3px]"/> Добавить тренировку
      </button>
      <button onClick={onLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded flex items-center transition-colors shadow-lg active:scale-95">
        <LogOut className="w-4 h-4 mr-1.5"/> Выйти
      </button>
    </div>
  </div>
);

// --- ТАБЛИЦА ЗОН (С ТЕМИ ЖЕ ЦВЕТАМИ, ЧТО В СТАТИСТИКЕ) ---
const HRZonesTable = () => {
  const zones = [
    { id: 'I1', color: '#4ade80', range: '118 - 143' },
    { id: 'I2', color: '#22d3ee', range: '143 - 161' },
    { id: 'I3', color: '#facc15', range: '161 - 171' },
    { id: 'I4', color: '#fb923c', range: '171 - 181' },
    { id: 'I5', color: '#ef4444', range: '181 - 200' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">
        Зоны частоты сердечных сокращений
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

// --- МОДАЛЬНОЕ ОКНО (В СТИЛЕ ТВОЕЙ СТРАНИЦЫ) ---
const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1d] w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl border border-gray-700 shadow-2xl flex flex-col">

        <div className="bg-[#1f1f22] p-5 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Редактировать профиль</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-xs font-bold uppercase">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm focus:border-blue-600 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-xs font-bold uppercase">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm focus:border-blue-600 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-xs font-bold uppercase flex items-center gap-1">Дата рождения <Info size={12}/></label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 text-gray-500 text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-xs font-bold uppercase">Секс</label>
              <select className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm outline-none">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 text-xs font-bold uppercase">Биография / О себе</label>
            <textarea placeholder="О себе..." rows={3} className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm focus:border-blue-600 outline-none resize-none" />
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs font-bold uppercase">Спорт</label>
                <select className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm">
                  <option>беговые лыжи</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs font-bold uppercase">Ассоциация</label>
                <select className="w-full bg-[#1f1f22] border border-gray-700 rounded-md px-4 py-2 text-white text-sm">
                  <option>Норвежская ассоциация</option>
                </select>
              </div>
            </div>
          </div>

          <HRZonesTable />

          <div className="space-y-3 pt-2">
             <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-blue-600" defaultChecked />
                <span className="text-gray-400 text-xs group-hover:text-white transition-colors">Уведомлять тренера о тренировках</span>
             </label>
          </div>
        </div>

        <div className="p-5 bg-[#1f1f22] border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 text-sm font-medium hover:text-white">Отмена</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 transition-all">Применить</button>
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

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">

        <AccountHeader name={profile?.name} onLogout={() => navigate('/login')} />

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

        {/* PROFILE CONTENT */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-800 shadow-xl overflow-hidden p-8">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">{profile?.name}</h2>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                Дата рождения: 10.12.1995 • Мужчина
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#1f1f22] border border-gray-700 hover:bg-[#2a2a2d] px-4 py-1.5 rounded text-sm text-gray-200 transition-all">
              <Edit3 size={16} /> Изменить данные
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Спортивные данные */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-500 border-b border-gray-800 pb-2">
                <Trophy size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Спортивная информация</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Вид спорта</p>
                  <p className="text-white text-sm">беговые лыжи</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Клуб</p>
                  <p className="text-white text-sm">IL Aasguten ski</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ассоциация</p>
                  <p className="text-white text-sm font-medium">Норвежская лыжная федерация</p>
                </div>
              </div>
            </div>

            {/* Зоны интенсивности */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-500 border-b border-gray-800 pb-2">
                <Heart size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Зоны интенсивности</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {hrZones.map((z) => (
                  <div key={z.label} className="flex items-center bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
                    <span style={{ backgroundColor: z.color }} className="px-2 py-1 text-[10px] font-black text-[#0f0f0f]">
                      {z.label}
                    </span>
                    <span className="px-3 py-1 text-xs text-gray-300">
                      {z.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}