import React from "react";
import { User, Trophy, Heart, Edit3 } from "lucide-react";

export const ProfileInfoCard = ({ profileData, hrZones, isEditing, onEditToggle }) => {
  return (
    <div className="bg-[#1a1a1d] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
      <div className="p-8 space-y-12">

        {/* Секция: Персональные данные */}
        <section>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3 text-gray-500">
              <User size={18} />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Персональная информация</h2>
            </div>
            <button
              onClick={onEditToggle}
              className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-1.5 rounded-lg text-xs transition-all text-blue-400"
            >
              <Edit3 size={14} /> {isEditing ? "Сохранить" : "Изменить"}
            </button>
          </div>
          <div className="ml-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {profileData?.name || "Загрузка..."}
            </h3>
            <p className="text-gray-500 text-sm mt-2">Дата рождения: 10.12.1995</p>
          </div>
        </section>

        {/* Секция: Спорт */}
        <section>
          <div className="flex items-center gap-3 text-gray-500 mb-8">
            <Trophy size={18} />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Спортивная информация</h2>
          </div>
          <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Спорт</p>
              <p className="text-white font-medium">{profileData?.sport || "беговые лыжи"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Клуб</p>
              <p className="text-white font-medium">{profileData?.club || "IL Aasguten ski"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Федерация</p>
              <p className="text-white font-medium leading-relaxed">{profileData?.federation || "Норвежская ассоциация"}</p>
            </div>
          </div>
        </section>

        {/* Секция: Пульс */}
        <section>
          <div className="flex items-center gap-3 text-gray-500 mb-8">
            <Heart size={18} />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Зоны интенсивности</h2>
          </div>
          <div className="ml-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              {hrZones.map((zone) => (
                <div key={zone.id} className={`${zone.color} ${zone.textColor} px-4 py-2 rounded-xl text-xs font-bold border border-white/5 shadow-inner`}>
                  {zone.id} : <span className="text-white ml-1">{zone.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};