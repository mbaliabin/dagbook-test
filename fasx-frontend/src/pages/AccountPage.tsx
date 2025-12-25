import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from 'react-easy-crop';
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, User, Trophy, Heart, Edit3, Users, Activity, Loader2, X, Check,
  Trash2
} from "lucide-react";

import EditAccountModal from "../components/AccountPage/EditAccountModal";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Состояния для кроппера
  const [imageForCrop, setImageForCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Ошибка загрузки профиля:", err);
      if (err instanceof Error && (err.message.includes("401") || err.message.includes("авторизации"))) {
        localStorage.removeItem("token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить фото профиля?")) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/profile/delete-avatar`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Не удалось удалить фото");

      const data = await response.json();
      setProfile(data.user);
    } catch (err: any) {
      console.error("Ошибка удаления:", err);
      alert(err.message || "Ошибка при удалении фото.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("Файл слишком большой. Лимит 10МБ.");
        return;
      }
      setOriginalFile(file);
      const imageDataUrl = URL.createObjectURL(file);
      setImageForCrop(imageDataUrl);
    }
  };

  const onCropComplete = useCallback((_area: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUploadCroppedImage = async () => {
    if (!originalFile || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", originalFile);
      formData.append("cropX", Math.round(croppedAreaPixels.x).toString());
      formData.append("cropY", Math.round(croppedAreaPixels.y).toString());
      formData.append("cropWidth", Math.round(croppedAreaPixels.width).toString());
      formData.append("cropHeight", Math.round(croppedAreaPixels.height).toString());

      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/user/upload-avatar`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Ошибка сервера при загрузке");

      const data = await response.json();
      setProfile(data.user);
      setImageForCrop(null);
      setOriginalFile(null);
    } catch (err: any) {
      console.error("Ошибка загрузки аватара:", err);
      alert(err.message || "Не удалось обновить фото.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hrZonesData = [
    { label: 'I1', range: profile?.profile?.hrZones?.I1 || '---', color: '#4ade80' },
    { label: 'I2', range: profile?.profile?.hrZones?.I2 || '---', color: '#22d3ee' },
    { label: 'I3', range: profile?.profile?.hrZones?.I3 || '---', color: '#facc15' },
    { label: 'I4', range: profile?.profile?.hrZones?.I4 || '---', color: '#fb923c' },
    { label: 'I5', range: profile?.profile?.hrZones?.I5 || '---', color: '#ef4444' },
  ];

  const menuItems = [
      { label: "Главная", icon: Home, path: "/daily" },
      { label: "Тренировки", icon: BarChart3, path: "/profile" },
      { label: "Календарь", icon: CalendarDays, path: "/calendar" },
      { label: "Планирование", icon: ClipboardList, path: "/planning" },
      { label: "Статистика", icon: Activity, path: "/statistics" },
    ];

  if (loading && !profile) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div className="flex items-center space-x-5">

            {/* ЧИСТОЕ КРУГЛОЕ ЛОГО БЕЗ РАМОК */}
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#1a1a1e] flex items-center justify-center">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <span className="text-base font-bold text-gray-500 uppercase tracking-wider">
                  {profile?.name?.charAt(0) || "U"}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                {profile?.name || "Пользователь"}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Activity size={12} className="text-blue-500/50" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Athlete ID</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all shadow-lg active:scale-95">
              <Plus className="w-4 h-4 mr-2 stroke-[3px]"/> Добавить
            </button>
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="bg-[#131316] border border-white/[0.05] hover:border-red-500/50 hover:text-red-400 text-gray-400 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center transition-all">
              <LogOut className="w-4 h-4 mr-2"/> Выйти
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-around bg-[#131316] border border-white/[0.03] py-2 px-4 rounded-xl shadow-2xl mb-8">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Теперь подсвечиваем только если путь совпадает на 100%
                    // Таким образом, когда вы в /account, ни одна из кнопок снизу не будет синей
                    const isActive = location.pathname === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-1 transition-all py-1 w-24 ${isActive ? "text-blue-500" : "text-gray-600 hover:text-gray-300"}`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`}/>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em]`}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

        <div className="bg-[#131316] border border-white/[0.03] rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/[0.03]">

          {/* 1. ПРОФИЛЬ + ФОТО */}
          <section className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <User size={16} className="text-blue-500" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Профиль спортсмена</h2>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 text-[9px] text-white transition-all rounded-lg font-black uppercase tracking-[0.15em]">
                <Edit3 size={14} /> Изменить
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
              <div className="relative group w-40 h-40 md:w-52 md:h-52">
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

                <div
                  onClick={() => (profile?.avatarUrl || profile?.originalAvatarUrl) && setIsPreviewOpen(true)}
                  className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 cursor-pointer ${uploading ? 'opacity-50' : 'hover:border-white/30'}`}
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className={`w-full h-full object-cover scale-105 transition-transform duration-700 ${!uploading && 'group-hover:scale-110'}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-[#131316] to-blue-900/30 flex items-center justify-center">
                      <span className="text-5xl font-black text-blue-500/40 select-none uppercase">
                        {profile?.name?.charAt(0) || "U"}
                      </span>
                      <div className="absolute inset-0 bg-blue-500/5 radial-gradient" />
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>

                <div
                  onClick={(e) => { e.stopPropagation(); !uploading && fileInputRef.current?.click(); }}
                  className="absolute -bottom-1 -left-1 bg-[#2a2a2e] hover:bg-[#3a3a3e] p-2 rounded-lg border border-white/10 shadow-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10 active:scale-90"
                >
                  <Edit3 size={14} className="text-gray-300 stroke-[2.5px]" />
                </div>

                {profile?.avatarUrl && (
                  <div
                    onClick={(e) => { e.stopPropagation(); !uploading && handleDeleteAvatar(); }}
                    className="absolute -bottom-1 -right-1 bg-[#1a1a1e] hover:bg-red-500/20 p-2 rounded-lg border border-white/10 shadow-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10 active:scale-90 text-red-500"
                  >
                    <Trash2 size={14} className="stroke-[2.5px]" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-8 text-center md:text-left">
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{profile?.name || "Спортсмен"}</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                    {profile?.profile?.gender || "Пол не указан"}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">Биография</p>
                  <p className="text-gray-300 text-sm leading-relaxed italic max-w-2xl bg-white/[0.01] p-6 rounded-2xl border border-white/[0.03]">
                    {profile?.profile?.bio || "Биография еще не заполнена."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. СПОРТИВНЫЙ СТАТУС */}
          <section className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <Trophy size={16} className="text-blue-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Спортивный статус</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Вид спорта', val: profile?.profile?.sportType, icon: Activity },
                { label: 'Название клуба', val: profile?.profile?.club, icon: Users },
                { label: 'Ассоциация', val: profile?.profile?.association, icon: Trophy },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">{item.label}</p>
                  <p className="text-white text-sm font-bold tracking-wide">{item.val || "—"}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. ЗОНЫ ЧСС */}
          <section className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <Heart size={16} className="text-blue-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Зоны интенсивности (ЧСС)</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {hrZonesData.map((z) => (
                <div key={z.label} className="flex items-center bg-black/40 border border-white/5 rounded-xl overflow-hidden shadow-xl">
                  <span style={{ backgroundColor: z.color }} className="w-10 h-10 flex items-center justify-center text-[11px] font-black text-black">{z.label}</span>
                  <div className="px-5 py-2 flex flex-col"><span className="text-xs text-white font-black">{z.range}</span><span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">уд/мин</span></div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. ТРЕНЕРЫ */}
          <section className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <Users size={16} className="text-blue-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Тренерский штаб</h2>
            </div>
            <div className="bg-white/[0.01] border-2 border-dashed border-white/5 p-12 rounded-3xl text-center">
              <p className="text-xs text-gray-500 italic mb-8">У вас пока нет привязанных тренеров.</p>
              <button className="inline-flex items-center gap-3 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 px-8 py-3 rounded-2xl text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] transition-all active:scale-95">
                <Plus size={16} /> Добавить тренера
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* МОДАЛКИ (КРОППЕР, ПРЕДПРОСМОТР, РЕДАКТИРОВАНИЕ) */}
      {imageForCrop && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg aspect-square bg-[#131316] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Cropper image={imageForCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="mt-8 flex gap-4 w-full max-w-lg">
            <button onClick={() => { setImageForCrop(null); setOriginalFile(null); }} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Отмена</button>
            <button onClick={handleUploadCroppedImage} disabled={uploading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />} Сохранить
            </button>
          </div>
        </div>
      )}

      {isPreviewOpen && (profile?.originalAvatarUrl || profile?.avatarUrl) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setIsPreviewOpen(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-3 rounded-full z-50"><X size={28} /></button>
          <div className="absolute inset-0 overflow-hidden opacity-30 select-none pointer-events-none">
            <img src={profile.originalAvatarUrl || profile.avatarUrl} className="w-full h-full object-cover blur-3xl scale-110" alt="" />
          </div>
          <div className="relative z-10 max-w-5xl w-full flex flex-col justify-center items-center h-full gap-4">
            <img src={profile.originalAvatarUrl || profile.avatarUrl} className="max-w-full max-h-[85vh] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] object-contain animate-in zoom-in-95 duration-300 border border-white/10" alt="Full Size" onClick={(e) => e.stopPropagation()} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30"></p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <EditAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} profile={profile} onUpdate={fetchProfile} />
      )}
    </div>
  );
}