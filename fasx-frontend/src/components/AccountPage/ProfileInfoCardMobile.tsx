import React from "react";
import { User, Trophy, Heart, Edit3, Trash2, Pencil, ShieldCheck } from "lucide-react";

interface HrZone {
  id: string;
  range: string;
  color: string;
  textColor: string;
}

interface ProfileInfoCardProps {
  profileData: any;
  hrZones: HrZone[];
  onEditToggle: () => void;
  onUploadClick: () => void; // Добавили пропс для загрузки
  onDeletePhoto?: () => void; // Добавили пропс для удаления
}

export const ProfileInfoCardMobile = ({
  profileData,
  hrZones,
  onEditToggle,
  onUploadClick,
  onDeletePhoto
}: ProfileInfoCardProps) => {
  return (
    <div className="space-y-4">

      {/* 1. БЛОК С ФОТО (АВАТАР) */}
      <div className="flex flex-col items-center pt-2 pb-4">
        <div className="relative">
          {/* Контейнер фото */}
          <div className="w-32 h-32 rounded-[40px] overflow-hidden border-2 border-white/5 bg-[#131316] shadow-2xl">
            {profileData?.avatarUrl ? (
              <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-blue-500/20 bg-blue-500/5">
                {profileData?.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Кнопка Изменить (Карандашик) - СЛЕВА ВНИЗУ */}
          <button
            onClick={onUploadClick}
            className="absolute -bottom-1 -left-1 p-2 bg-[#2a2a2d] border border-white/10 rounded-xl text-gray-400 active:scale-90 transition-all shadow-lg"
          >
            <Pencil size={14} />
          </button>

          {/* Кнопка Удалить - СПРАВА ВНИЗУ */}
          {profileData?.avatarUrl && (
            <button
              onClick={onDeletePhoto}
              className="absolute -bottom-1 -right-1 p-2 bg-[#2a2a2d] border border-white/10 rounded-xl text-red-400/80 active:scale-90 transition-all shadow-lg"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. ПЕРСОНАЛЬНЫЕ ДАННЫЕ */}
      <div className="bg-[#131316] rounded-[28px] border border-white/[0.03] p-5 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <User size={14} className="text-blue-500" />
            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Профиль атлета</h2>
          </div>
          <button
            onClick={onEditToggle}
            className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] active:bg-white/[0.1] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-blue-400 transition-all"
          >
            <Edit3 size={12} /> Изменить
          </button>
        </div>

        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
          {profileData?.name || "Загрузка..."}
        </h3>
      </div>

      {/* 3. СПОРТИВНЫЙ СТАТУС */}
      <div className="bg-[#131316] rounded-[28px] border border-white/[0.03] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={14} className="text-blue-500" />
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Спортивные данные</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.03]">
            <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1">Вид спорта</p>
            <p className="text-white text-[11px] font-bold tracking-tight">{profileData?.profile?.sportType || "—"}</p>
          </div>
          <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.03]">
            <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1">Клуб</p>
            <p className="text-white text-[11px] font-bold truncate tracking-tight">{profileData?.profile?.club || "—"}</p>
          </div>
          <div className="col-span-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShieldCheck size={14} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest">Ассоциация / Федерация</p>
              <p className="text-white text-[12px] font-bold tracking-tight">{profileData?.profile?.association || "Личный зачет"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ЗОНЫ ЧСС */}
      <div className="bg-[#131316] rounded-[28px] border border-white/[0.03] p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-5">
          <Heart size={14} className="text-red-500" />
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Пульсовые зоны</h2>
        </div>

        <div className="flex justify-between gap-1.5">
          {hrZones.map((zone) => (
            <div
              key={zone.id}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full h-1 rounded-full opacity-60" style={{ backgroundColor: zone.color }} />
              <span className="text-[11px] font-black text-white tabular-nums">{zone.range}</span>
              <span className="text-[8px] font-black text-gray-600 uppercase">{zone.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};