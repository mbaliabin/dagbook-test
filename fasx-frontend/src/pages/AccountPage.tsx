import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Edit3, ChevronDown, X, User, Trophy, Heart, Users, Settings, LogOut, Info, Plus
} from "lucide-react";

// API
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

// --- КОМПОНЕНТ ЗОН (Таблица для модалки) ---
const HRZonesTable = () => {
  const zones = [
    { id: 'I1', color: 'bg-[#b3ffcc]', range: '118 - 143' },
    { id: 'I2', color: 'bg-[#50fa7b]', range: '143 - 161' },
    { id: 'I3', color: 'bg-[#f1fa8c]', range: '161 - 171' },
    { id: 'I4', color: 'bg-[#ffb86c]', range: '171 - 181' },
    { id: 'I5', color: 'bg-[#ff79c6]', range: '181 - 200' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-gray-500 text-xs font-medium">Мои зоны частоты сердечных сокращений</label>
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid grid-cols-5 text-center text-[10px] font-bold">
          {zones.map(z => (
            <div key={z.id} className={`${z.color} py-1.5 border-r border-gray-300 last:border-0`}>{z.id}</div>
          ))}
        </div>
        <div className="grid grid-cols-5 text-center text-[11px]">
          {zones.map((z, i) => (
            <input
              key={i}
              type="text"
              defaultValue={z.range}
              className="w-full py-2 text-center outline-none border-r border-gray-300 last:border-0 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- МОДАЛЬНОЕ ОКНО (По образцу image_712982.png) ---
const EditAccountModal = ({ isOpen, onClose, profile }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[500px] max-h-[95vh] overflow-y-auto rounded-md shadow-2xl flex flex-col text-gray-700">

        <div className="bg-[#333] p-4 flex justify-between items-center">
          <h2 className="text-xl font-normal text-white">Изменить мою информацию</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-500 text-xs">Имя</label>
              <input type="text" defaultValue="Максим Игоревич" className="w-full border border-gray-400 rounded p-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-gray-500 text-xs">Фамилия</label>
              <input type="text" defaultValue="Балябин" className="w-full border border-gray-400 rounded p-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-500 text-xs">Дата рождения</label>
              <input type="text" value="1995-12-10" readOnly className="w-full border border-gray-300 bg-gray-50 rounded p-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
            <p className="text-[10px] text-gray-400 leading-tight flex items-center">
              Эта информация получена из регистра населения и не может быть изменена.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 text-xs">Секс</label>
            <select className="w-full border border-gray-400 rounded p-2 text-sm appearance-none bg-white">
              <option>Мужчина</option>
              <option>Женщина</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">Настройки обучения</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-gray-500 text-xs">Спорт</label>
                <select className="w-full border border-gray-400 rounded p-2 text-sm">
                  <option>беговые лыжи</option>
                  <option>легкая атлетика</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-gray-500 text-xs">Специальная ассоциация</label>
                <select className="w-full border border-gray-400 rounded p-2 text-sm">
                  <option>Норвежская лыжная...</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
               <input type="text" defaultValue="IL Aasguten ski" className="w-full border border-gray-400 rounded p-2 text-sm" />
               <input type="text" defaultValue="Østerår ungdomskole" className="w-full border border-gray-400 rounded p-2 text-sm" />
            </div>
          </div>

          <HRZonesTable />

          <div className="pt-4 border-t border-gray-100 space-y-3">
             <h3 className="text-xs font-bold uppercase text-gray-500">Настройки дневника</h3>
             <label className="flex items-start gap-3 text-[11px] text-gray-600">
                <input type="checkbox" className="mt-0.5" defaultChecked />
                <span>Уведомить тренера (можно изменить для каждой сессии/комментария)</span>
             </label>
             <label className="flex items-start gap-3 text-[11px] text-gray-600">
                <input type="checkbox" className="mt-0.5" defaultChecked />
                <span>Моё имя не должно быть доступно для поиска другими пользователями дневника тренировок.</span>
             </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-between">
          <button onClick={onClose} className="text-sm text-gray-600 flex items-center gap-1"><LogOut size={16}/> Отмена</button>
          <button className="bg-white border border-gray-300 px-6 py-1.5 rounded text-sm text-gray-500 hover:bg-gray-100 transition-all">✓ Сохранять</button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНАЯ СТРАНИЦА (По образцу chrome_u24KWXnFXm.png) ---
export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserProfile().then(setProfile).catch(() => navigate('/login'));
  }, [navigate]);

  const hrZones = [
    { label: 'I1', range: '118 - 143', color: 'bg-green-100 text-green-700' },
    { label: 'I2', range: '143 - 161', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'I3', range: '161 - 171', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'I4', range: '171 - 181', color: 'bg-orange-100 text-orange-700' },
    { label: 'I5', range: '181 - 200', color: 'bg-red-100 text-red-700' },
  ];

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans flex flex-col items-center">

      {/* Верхнее меню как на скрине */}
      <div className="flex mb-6 bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <button className="px-6 py-2 bg-[#333] text-white text-sm font-medium">Моя страница</button>
        <button className="px-6 py-2 text-gray-600 text-sm border-r border-gray-200">Мои спортсмены</button>
        <button className="px-6 py-2 text-gray-600 text-sm">Передовой</button>
      </div>

      <div className="w-full max-w-[800px] bg-white rounded-lg shadow-sm border border-gray-200 p-10 space-y-10">

        {/* Персональная информация */}
        <section className="relative">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <User size={18} />
            <h2 className="text-sm font-medium">Персональная информация</h2>
            <button onClick={() => setIsModalOpen(true)} className="absolute right-0 top-0 flex items-center gap-1.5 border border-gray-300 rounded px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-all">
              <Edit3 size={14} /> Изменить
            </button>
          </div>
          <div className="ml-7">
            <h3 className="text-lg font-bold text-gray-800">Максим Игоревич Балябин</h3>
            <p className="text-gray-500 text-xs mt-1">Дата рождения: 10.12.1995</p>
          </div>
        </section>

        {/* Спортивная информация */}
        <section>
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <Trophy size={18} />
            <h2 className="text-sm font-medium">Спортивная информация</h2>
          </div>
          <div className="ml-7 grid grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] text-gray-400 uppercase mb-1">Спорт</p>
              <p className="text-gray-700 text-sm">беговые лыжи</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase mb-1">Клуб</p>
              <p className="text-gray-700 text-sm">IL Aasguten ski</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase mb-1">Федерация</p>
              <p className="text-gray-700 text-sm">Норвежская лыжная ассоциация</p>
            </div>
          </div>
        </section>

        {/* Зоны интенсивности */}
        <section>
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <Heart size={18} />
            <h2 className="text-sm font-medium">Зоны интенсивности</h2>
          </div>
          <div className="ml-7 space-y-4">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
               <Heart size={14} /> <span>зоны частоты сердечных сокращений</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hrZones.map((z) => (
                <div key={z.label} className={`${z.color} px-3 py-1 rounded-full text-[11px] font-medium`}>
                  {z.label} : {z.range}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Аккордеоны как на скрине */}
        <div className="space-y-4 pt-4">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-gray-500">
              <h2 className="text-xs font-bold uppercase tracking-wider">Мои тренеры</h2>
              <ChevronDown size={18} />
            </div>
            <div className="py-6 space-y-4">
              <p className="text-sm text-gray-500 italic ml-2">У вас нет тренеров.</p>
              <button className="flex items-center gap-2 border border-gray-300 rounded px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Plus size={16} /> Предоставить доступ
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-gray-500">
              <h2 className="text-xs font-bold uppercase tracking-wider">Пользовательские параметры</h2>
              <ChevronDown size={18} />
            </div>
            <div className="py-6 space-y-4 ml-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px]">тест</span>
              <br />
              <button className="flex items-center gap-2 border border-gray-300 rounded px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Edit3 size={16} /> Изменять
              </button>
            </div>
          </div>
        </div>

        {/* Выход */}
        <div className="border-t border-gray-200 pt-8">
           <button className="flex items-center gap-2 border border-gray-400 rounded px-6 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              <LogOut size={16} /> Выйти
           </button>
        </div>

      </div>

      <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} />
    </div>
  );
}