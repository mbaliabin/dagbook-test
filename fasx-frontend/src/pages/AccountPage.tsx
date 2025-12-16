import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Edit3, ChevronDown, X, User, Trophy, Heart, Users, LogOut, Info, Plus, CalendarDays
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- КОМПОНЕНТ ТАБЛИЦЫ ЗОН ДЛЯ МОДАЛКИ (В ТЕМНОМ СТИЛЕ) ---
const HRZonesTable = () => {
  const zones = [
    { id: 'I1', color: 'bg-[#b3ffcc]/20 text-[#b3ffcc]', border: 'border-[#b3ffcc]/40', range: '118 - 143' },
    { id: 'I2', color: 'bg-[#50fa7b]/20 text-[#50fa7b]', border: 'border-[#50fa7b]/40', range: '143 - 161' },
    { id: 'I3', color: 'bg-[#f1fa8c]/20 text-[#f1fa8c]', border: 'border-[#f1fa8c]/40', range: '161 - 171' },
    { id: 'I4', color: 'bg-[#ffb86c]/20 text-[#ffb86c]', border: 'border-[#ffb86c]/40', range: '171 - 181' },
    { id: 'I5', color: 'bg-[#ff79c6]/20 text-[#ff79c6]', border: 'border-[#ff79c6]/40', range: '181 - 200' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
        <Heart size={12} className="text-blue-500" /> Зоны частоты сердечных сокращений
      </label>
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#0a0a0a]">
        <div className="grid grid-cols-5 text-center text-[10px] font-black uppercase">
          {zones.map(z => (
            <div key={z.id} className={`${z.color} py-2 border-r border-gray-800 last:border-0`}>{z.id}</div>
          ))}
        </div>
        <div className="grid grid-cols-5 text-center text-[12px]">
          {zones.map((z, i) => (
            <input
              key={i}
              type="text"
              defaultValue={z.range}
              className="w-full py-3 text-center outline-none border-r border-gray-800 last:border-0 bg-transparent text-white focus:bg-blue-500/5 transition-colors"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- МОДАЛЬНОЕ ОКНО (ТЕМНОЕ) ---
const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col text-gray-200">

        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white tracking-tight">Изменить информацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Имя</label>
              <input type="text" defaultValue="Максим Игоревич" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Фамилия</label>
              <input type="text" defaultValue="Балябин" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1 flex items-center gap-1">Дата рождения <Info size={10}/></label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Пол</label>
              <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Биография</label>
            <textarea placeholder="О себе..." rows={3} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none resize-none transition-all" />
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Спортивные данные</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Вид спорта</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>беговые лыжи</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Ассоциация</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>Норвежская ассоциация</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Клуб (выбор)</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                  <option>IL Aasguten ski</option>
                  <option>Другой</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase ml-1">Своё название</label>
                <input type="text" placeholder="Введите название..." className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
              </div>
            </div>
          </div>

          <HRZonesTable />

          <div className="pt-4 border-t border-gray-800 space-y-3">
             <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-700 bg-[#0f0f0f] accent-blue-600" defaultChecked />
                <span className="text-gray-400 text-xs group-hover:text-white transition-colors">Уведомить тренера о прошедших тренировках</span>
             </label>
          </div>
        </div>

        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 text-sm font-bold hover:text-white transition-colors">Отмена</button>
          <button className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА (ТЕМНЫЙ СТИЛЬ) ---
export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(() => navigate('/login'));
  }, [navigate]);

  const hrZones = [
    { label: 'I1', range: '118 - 143', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { label: 'I2', range: '143 - 161', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'I3', range: '161 - 171', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { label: 'I4', range: '171 - 181', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { label: 'I5', range: '181 - 200', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans flex flex-col items-center">

      {/* Меню переключения */}
      <div className="flex mb-8 bg-[#1a1a1d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <button className="px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest">Моя страница</button>
        <button className="px-8 py-3 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors border-x border-gray-800">Мои спортсмены</button>
        <button className="px-8 py-3 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Передовой</button>
      </div>

      <div className="w-full max-w-[900px] space-y-6">

        {/* Основная карточка */}
        <div className="bg-[#1a1a1d] rounded-3xl border border-gray-800 shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full"></div>

          <div className="space-y-12">
            {/* 1. Персоналка */}
            <section>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 text-blue-500">
                  <User size={20} />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Персональная информация</h2>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-gray-700 bg-gray-800/30 hover:bg-gray-800 px-5 py-2 rounded-xl text-xs text-blue-400 font-bold transition-all">
                  <Edit3 size={14} /> Изменить
                </button>
              </div>
              <div className="ml-8 space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">Максим Игоревич Балябин</h3>
                <p className="text-gray-500 text-sm flex items-center gap-2 italic">
                  <CalendarDays size={14}/> Дата рождения: 10.12.1995 • Мужчина
                </p>
              </div>
            </section>

            {/* 2. Спортивная инфа */}
            <section className="pt-8 border-t border-gray-800/50">
              <div className="flex items-center gap-3 text-blue-500 mb-6">
                <Trophy size={20} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Спортивная информация</h2>
              </div>
              <div className="ml-8 grid grid-cols-3 gap-10">
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-2">Спорт</p>
                  <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2 px-4 rounded-lg border border-gray-800">беговые лыжи</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-2">Клуб</p>
                  <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2 px-4 rounded-lg border border-gray-800">IL Aasguten ski</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-2">Федерация</p>
                  <p className="text-white text-sm font-bold bg-[#0f0f0f] py-2 px-4 rounded-lg border border-gray-800">Норвежская ассоциация</p>
                </div>
              </div>
            </section>

            {/* 3. Зоны */}
            <section className="pt-8 border-t border-gray-800/50">
              <div className="flex items-center gap-3 text-blue-500 mb-6">
                <Heart size={20} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Зоны интенсивности</h2>
              </div>
              <div className="ml-8 space-y-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                   <Info size={14} className="text-gray-700" /> зоны частоты сердечных сокращений
                </div>
                <div className="flex flex-wrap gap-3">
                  {hrZones.map((z) => (
                    <div key={z.label} className={`${z.color} border px-4 py-2 rounded-xl text-xs font-black`}>
                      {z.label} <span className="mx-1.5 opacity-40">|</span> {z.range}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Аккордеоны */}
            <div className="space-y-4 pt-4">
              <div className="border-t border-gray-800 pt-6 group cursor-pointer">
                <div className="flex justify-between items-center text-gray-500 group-hover:text-blue-500 transition-colors">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Мои тренеры</h2>
                  <ChevronDown size={20} />
                </div>
                <div className="mt-6 ml-4 space-y-4">
                  <p className="text-sm text-gray-600 italic">У вас пока нет привязанных тренеров.</p>
                  <button className="flex items-center gap-2 border border-gray-800 bg-blue-600/5 hover:bg-blue-600/10 px-6 py-2.5 rounded-xl text-xs text-blue-400 font-bold transition-all">
                    <Plus size={16} /> Предоставить доступ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Выход */}
        <div className="flex justify-center pt-4">
           <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-bold text-xs uppercase tracking-[0.2em] transition-all">
              <LogOut size={16} /> Выйти из аккаунта
           </button>
        </div>
      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}