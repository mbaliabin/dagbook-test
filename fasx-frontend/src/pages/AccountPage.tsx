import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  User, Trophy, Heart, Users, Settings,
  LogOut, Plus, Edit3, ChevronUp
} from "lucide-react";

// ИМПОРТ ТВОЕГО API
import { getUserProfile } from "../api/getUserProfile";

export default function AccountPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Загрузка...");
  const [loading, setLoading] = useState(true);

  // Состояния для раскрывающихся списков (аккордеонов)
  const [openTrainers, setOpenTrainers] = useState(true);
  const [openParams, setOpenParams] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
      } catch (err) {
        console.error("Ошибка профиля:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const hrZones = [
    { id: "I1", range: "118 - 143", color: "bg-green-500/20", textColor: "text-green-400" },
    { id: "I2", range: "143 - 161", color: "bg-emerald-500/20", textColor: "text-emerald-400" },
    { id: "I3", range: "161 - 171", color: "bg-yellow-500/20", textColor: "text-yellow-400" },
    { id: "I4", range: "171 - 181", color: "bg-orange-500/20", textColor: "text-orange-400" },
    { id: "I5", range: "181 - 200", color: "bg-red-500/20", textColor: "text-red-400" },
  ];

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 font-sans">
      <div className="max-w-[900px] mx-auto space-y-4">

        {/* КАРТОЧКА: ОСНОВНОЙ БЛОК */}
        <div className="bg-[#1a1a1d] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">

          <div className="p-8 space-y-10">
            {/* 1. ПЕРСОНАЛЬНАЯ ИНФОРМАЦИЯ */}
            <section>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <User size={20} />
                  <h2 className="text-sm font-medium uppercase tracking-wider">Персональная информация</h2>
                </div>
                <button className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-sm transition-all text-white">
                  <Edit3 size={16} /> Изменить
                </button>
              </div>
              <div className="ml-8">
                <h1 className="text-xl font-bold text-white tracking-tight">{name}</h1>
                <p className="text-gray-500 text-sm mt-1">Дата рождения: 10.12.1995</p>
              </div>
            </section>

            {/* 2. СПОРТИВНАЯ ИНФОРМАЦИЯ */}
            <section>
              <div className="flex items-center gap-3 text-gray-400 mb-6">
                <Trophy size={20} />
                <h2 className="text-sm font-medium uppercase tracking-wider">Спортивная информация</h2>
              </div>
              <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Спорт</p>
                  <p className="text-white font-medium">беговые лыжи</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Клуб</p>
                  <p className="text-white font-medium">IL Aasguten ski</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Федерация</p>
                  <p className="text-white font-medium">Норвежская лыжная ассоциация</p>
                </div>
              </div>
            </section>

            {/* 3. ЗОНЫ ИНТЕНСИВНОСТИ */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-gray-400">
                <Heart size={20} />
                <h2 className="text-sm font-medium uppercase tracking-wider">Зоны интенсивности</h2>
              </div>
              <div className="ml-8 space-y-4">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                   <Heart size={14} className="text-red-500" />
                   <span>зоны частоты сердечных сокращений</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {hrZones.map((zone) => (
                    <div key={zone.id} className={`${zone.color} ${zone.textColor} px-3 py-1.5 rounded-full text-xs font-bold border border-white/5`}>
                      {zone.id} : {zone.range}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* 4. МОИ ТРЕНЕРЫ (Аккордеон) */}
          <div className="border-t border-gray-800">
            <button
              onClick={() => setOpenTrainers(!openTrainers)}
              className="w-full flex justify-between items-center p-6 hover:bg-white/[0.02] transition-colors"
            >
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Мои тренеры</h2>
              <ChevronUp className={`text-gray-500 transition-transform ${!openTrainers ? 'rotate-180' : ''}`} />
            </button>
            {openTrainers && (
              <div className="px-8 pb-8 space-y-4">
                <p className="text-gray-500 text-sm">У вас нет тренеров.</p>
                <button className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm text-white transition-all">
                  <Plus size={18} /> Предоставить доступ
                </button>
              </div>
            )}
          </div>

          {/* 5. ПОЛЬЗОВАТЕЛЬСКИЕ ПАРАМЕТРЫ (Аккордеон) */}
          <div className="border-t border-gray-800">
            <button
              onClick={() => setOpenParams(!openParams)}
              className="w-full flex justify-between items-center p-6 hover:bg-white/[0.02] transition-colors"
            >
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Пользовательские параметры</h2>
              <ChevronUp className={`text-gray-500 transition-transform ${!openParams ? 'rotate-180' : ''}`} />
            </button>
            {openParams && (
              <div className="px-8 pb-8 space-y-6">
                <div className="inline-block bg-gray-800/50 text-gray-300 px-4 py-1 rounded-full text-xs border border-gray-700">
                  тест
                </div>
                <div>
                  <button className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-sm text-white transition-all">
                    <Edit3 size={16} /> Изменить
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* КНОПКА ВЫХОДА */}
        <div className="pt-4">
          <button className="flex items-center gap-2 border border-gray-700 hover:bg-red-900/20 hover:text-red-500 px-4 py-2 rounded-lg text-sm transition-all text-white">
            <LogOut size={18} /> Выйти
          </button>
        </div>

      </div>
    </div>
  );
}