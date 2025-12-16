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
      <div className="relative group">
        <img src="/profile.jpg" alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-800 transition-transform group-hover:scale-105"/>
        <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full border-2 border-[#0f0f0f]">
          <Trophy size={12} className="text-white" />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{name || "Спортсмен"}</h1>
        <p className="text-sm text-gray-400 font-medium">{dayjs().format("D MMMM YYYY [г]")}</p>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center transition-all shadow-lg shadow-blue-900/20 active:scale-95">
        <Plus className="w-4 h-4 mr-2 stroke-[3px]"/> Добавить тренировку
      </button>
      <button onClick={onLogout} className="bg-[#1a1a1d] border border-gray-700 hover:bg-red-900/20 hover:text-red-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center transition-all active:scale-95">
        <LogOut className="w-4 h-4 mr-2"/> Выйти
      </button>
    </div>
  </div>
);

const NavigationMenu = ({ menuItems, navigate, currentPath }) => (
  <div className="flex justify-around bg-[#1a1a1d] border border-gray-800 py-3 px-6 rounded-2xl mb-8 shadow-xl">
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentPath.includes(item.path) || (item.path === "/profile" && currentPath === "/account");
      return (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center text-xs transition-all py-2 px-6 rounded-xl
            ${isActive ? "text-blue-500 font-bold bg-blue-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          <Icon className={`w-7 h-7 mb-1.5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`}/>
          <span className="uppercase tracking-widest">{item.label}</span>
        </button>
      );
    })}
  </div>
);

// --- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ (EditAccountModal) ---

const EditAccountModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1a1a1d] w-full max-w-[700px] max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-800 shadow-[0_0_60px_rgba(0,0,0,0.7)] flex flex-col animate-in zoom-in-95 duration-300">

        {/* Хедер */}
        <div className="bg-[#2a2a2d] p-7 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-black text-white tracking-tight">Изменить информацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X size={32} />
          </button>
        </div>

        {/* Форма */}
        <div className="p-10 space-y-10">

          {/* Личные данные */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl px-5 py-4 text-white text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="space-y-2.5">
              <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl px-5 py-4 text-white text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Дата рождения</label>
              <input type="text" value="10.12.1995" readOnly className="w-full bg-[#0f0f0f]/50 border-2 border-gray-800 rounded-2xl px-5 py-4 text-gray-500 text-xl cursor-not-allowed" />
            </div>
            <div className="space-y-2.5">
              <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Пол</label>
              <div className="relative">
                <select className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl px-5 py-4 text-white text-xl focus:border-blue-600 outline-none appearance-none cursor-pointer">
                  <option>Мужчина</option>
                  <option>Женщина</option>
                </select>
                <ChevronDown className="absolute right-5 top-5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Секция спорта */}
          <div className="pt-8 border-t border-gray-800">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-8">Настройки обучения</h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2.5">
                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Вид спорта</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl px-5 py-4 text-white text-lg focus:border-blue-600 outline-none appearance-none cursor-pointer">
                    <option>Лыжные гонки</option>
                    <option>Легкая атлетика</option>
                    <option>Велоспорт</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Ассоциация</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl px-5 py-4 text-white text-lg focus:border-blue-600 outline-none appearance-none cursor-pointer">
                    <option>Норвежская ассоциация</option>
                    <option>ФЛГР (Россия)</option>
                    <option>ВФЛА</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Название клуба / Команды</label>
              <div className="relative">
                <Search className="absolute left-5 top-5 text-gray-500" size={24} />
                <input type="text" placeholder="Поиск клуба..." defaultValue="IL Aasguten ski" className="w-full bg-[#0f0f0f] border-2 border-gray-800 rounded-2xl pl-14 pr-5 py-4 text-white text-lg outline-none focus:border-blue-600 transition-all" />
              </div>
            </div>
          </div>

          {/* Зоны ЧСС */}
          <div className="space-y-4">
            <label className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Зоны интенсивности ЧСС</label>
            <div className="border-2 border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-5 text-xs font-black text-center">
                <div className="bg-green-500/20 text-green-400 py-4 border-r border-gray-800">I1</div>
                <div className="bg-cyan-500/20 text-cyan-400 py-4 border-r border-gray-800">I2</div>
                <div className="bg-yellow-500/20 text-yellow-400 py-4 border-r border-gray-800">I3</div>
                <div className="bg-orange-500/20 text-orange-400 py-4 border-r border-gray-800">I4</div>
                <div className="bg-red-500/20 text-red-400 py-4">I5</div>
              </div>
              <div className="grid grid-cols-5 bg-[#0a0a0c] text-center border-t border-gray-800">
                <input className="bg-transparent py-5 border-r border-gray-800 text-center outline-none text-white text-lg font-bold" defaultValue="118 - 143" />
                <input className="bg-transparent py-5 border-r border-gray-800 text-center outline-none text-white text-lg font-bold" defaultValue="143 - 161" />
                <input className="bg-transparent py-5 border-r border-gray-800 text-center outline-none text-white text-lg font-bold" defaultValue="161 - 171" />
                <input className="bg-transparent py-5 border-r border-gray-800 text-center outline-none text-white text-lg font-bold" defaultValue="171 - 181" />
                <input className="bg-transparent py-5 text-center outline-none text-white text-lg font-bold" defaultValue="181 - 200" />
              </div>
            </div>
          </div>

          {/* Настройки приватности */}
          <div className="space-y-4 pt-4">
             <label className="flex items-center gap-5 cursor-pointer group bg-white/[0.03] p-5 rounded-2xl border-2 border-transparent hover:border-gray-700 transition-all">
                <input type="checkbox" className="w-6 h-6 accent-blue-600 rounded-lg" defaultChecked />
                <span className="text-gray-300 group-hover:text-white text-base font-medium">Уведомлять тренера об изменениях</span>
             </label>
             <label className="flex items-center gap-5 cursor-pointer group bg-white/[0.03] p-5 rounded-2xl border-2 border-transparent hover:border-gray-700 transition-all">
                <input type="checkbox" className="w-6 h-6 accent-blue-600 rounded-lg" defaultChecked />
                <span className="text-gray-300 group-hover:text-white text-base font-medium">Скрыть профиль из общего поиска</span>
             </label>
          </div>
        </div>

        {/* Футер */}
        <div className="p-8 bg-[#141417] border-t border-gray-800 flex justify-between items-center sticky bottom-0">
          <button onClick={onClose} className="px-8 py-4 text-gray-400 hover:text-white font-black transition-colors text-lg uppercase tracking-widest">
             Отмена
          </button>
          <button className="px-14 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95">
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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-xs font-black uppercase tracking-[0.3em] animate-pulse">Загрузка данных...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-8 w-full font-sans relative selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto space-y-8 px-4">

        <AccountHeader name={profile?.name} onLogout={handleLogout} />

        <NavigationMenu
          menuItems={menuItems}
          navigate={navigate}
          currentPath={location.pathname}
        />

        <div className="max-w-[1000px] mx-auto space-y-8">
          <div className="bg-[#1a1a1d] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="p-12 space-y-16">

              {/* Персоналка */}
              <section>
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4 text-blue-500">
                    <User size={22} className="stroke-[2.5px]" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em]">Персональная информация</h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-white/5 border border-gray-700 hover:bg-white/10 px-6 py-2.5 rounded-2xl text-sm font-black text-blue-400 transition-all active:scale-95 shadow-lg"
                  >
                    <Edit3 size={18} /> ИЗМЕНИТЬ
                  </button>
                </div>
                <div className="ml-10">
                  <h3 className="text-4xl font-black text-white tracking-tight mb-3">{profile?.name}</h3>
                  <div className="flex items-center gap-3 text-gray-500">
                    <CalendarDays size={16} />
                    <p className="text-lg font-medium">10 декабря 1995 г.</p>
                  </div>
                </div>
              </section>

              {/* Спорт информация */}
              <section>
                <div className="flex items-center gap-4 text-blue-500 mb-10">
                  <Trophy size={22} className="stroke-[2.5px]" />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Спортивная информация</h2>
                </div>
                <div className="ml-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-1">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Вид спорта</p>
                    <p className="text-white text-xl font-bold">Лыжные гонки</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Клуб</p>
                    <p className="text-white text-xl font-bold">IL Aasguten ski</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Федерация</p>
                    <p className="text-white text-xl font-bold leading-tight">Норвежская ассоциация</p>
                  </div>
                </div>
              </section>

              {/* Пульсовые зоны */}
              <section>
                <div className="flex items-center gap-4 text-blue-500 mb-10">
                  <Heart size={22} className="stroke-[2.5px]" />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em]">Зоны интенсивности</h2>
                </div>
                <div className="ml-10">
                  <div className="flex flex-wrap gap-4">
                    {hrZones.map((zone) => (
                      <div key={zone.id} className={`${zone.color} ${zone.textColor} px-8 py-4 rounded-3xl text-base font-black border border-white/5 shadow-xl transition-transform hover:scale-105 cursor-default`}>
                        {zone.id} : <span className="text-white ml-2">{zone.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Аккордеон тренеров */}
            <div className="border-t border-gray-800 bg-[#1e1e21]/40">
              <button
                onClick={() => setOpenTrainers(!openTrainers)}
                className="w-full flex justify-between items-center p-10 hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-5">
                  <Users size={24} className="text-gray-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Мои тренеры</h2>
                </div>
                <ChevronDown className={`text-gray-600 transition-transform duration-500 ${openTrainers ? 'rotate-180' : ''}`} size={28} />
              </button>
              {openTrainers && (
                <div className="px-20 pb-12 animate-in slide-in-from-top-2 duration-300">
                  <div className="p-8 rounded-3xl border border-dashed border-gray-800 flex flex-col items-center">
                    <p className="text-gray-500 text-lg italic font-light">Список тренеров пока пуст</p>
                  </div>
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