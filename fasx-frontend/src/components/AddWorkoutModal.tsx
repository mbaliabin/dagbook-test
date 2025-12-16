import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Search, RotateCcw, Check, User, FileText, Activity, MapPin, Award } from "lucide-react";
import toast from "react-hot-toast";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
  onUpdate: () => void;
}

export default function EditAccountModal({ isOpen, onClose, profile, onUpdate }: EditAccountModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("Мужчина");
  const [sportType, setSportType] = useState("Лыжные гонки");
  const [association, setAssociation] = useState("ФЛГР");
  const [club, setClub] = useState("");
  const [hrZones, setHrZones] = useState({
    I1: "", I2: "", I3: "", I4: "", I5: ""
  });

  useEffect(() => {
    if (profile && isOpen) {
      const names = profile.name?.split(" ") || ["", ""];
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");
      setBio(profile.profile?.bio || "");
      setGender(profile.profile?.gender || "Мужчина");
      setSportType(profile.profile?.sportType || "Лыжные гонки");
      setAssociation(profile.profile?.association || "ФЛГР");
      setClub(profile.profile?.club || "");

      if (profile.profile?.hrZones) {
        setHrZones(profile.profile.hrZones);
      }
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Сессия истекла");
      return;
    }

    const loadingToast = toast.loading("Обновление профиля...");
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const updateData = {
      name: fullName, bio, gender, sportType, club, association, hrZones
    };

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success("Изменения сохранены! ✨", { id: loadingToast });
        await onUpdate();
        onClose();
      } else {
        toast.error("Не удалось сохранить", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Ошибка соединения", { id: loadingToast });
    }
  };

  const zoneColors: Record<string, string> = {
    I1: "bg-green-500", I2: "bg-lime-400", I3: "bg-yellow-400", I4: "bg-orange-400", I5: "bg-red-500",
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto rounded-3xl w-full max-w-2xl z-50 text-gray-200 shadow-2xl border border-gray-800 scrollbar-hide">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          <Dialog.Title className="text-2xl font-bold text-white mb-8 tracking-tight">
            Настройки профиля
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Основная инфо */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Личные данные</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12}/> Имя
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12}/> Фамилия
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={12}/> Биография
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Коротко о себе..."
                  className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-white resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Пол</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none text-white appearance-none cursor-pointer"
                  >
                    <option value="Мужчина">Мужчина</option>
                    <option value="Женщина">Женщина</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Дата рождения</label>
                  <input
                    type="text" value="10.12.1995" readOnly
                    className="w-full bg-[#0f0f0f] border border-gray-800/50 p-3 rounded-xl text-gray-600 italic cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-800/50" />

            {/* Спортивные данные */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Спортивный паспорт</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12}/> Дисциплина
                  </label>
                  <select
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none text-white appearance-none cursor-pointer"
                  >
                    <option value="Лыжные гонки">Лыжные гонки</option>
                    <option value="Легкая атлетика">Легкая атлетика</option>
                    <option value="Велоспорт">Велоспорт</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Award size={12}/> Ассоциация
                  </label>
                  <select
                    value={association}
                    onChange={(e) => setAssociation(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none text-white appearance-none cursor-pointer"
                  >
                    <option value="ФЛГР">ФЛГР</option>
                    <option value="ВФЛА">ВФЛА</option>
                    <option value="Нет">Нет</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12}/> Клуб / Команда
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    placeholder="Название клуба..."
                    className="w-full bg-[#0f0f0f] border border-gray-800 pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none text-white transition-all"
                  />
                </div>
              </div>

              {/* Зоны ЧСС */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Зоны пульса (границы)</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(hrZones).map((zone) => (
                    <div key={zone} className="group">
                      <div className={`h-1 mb-2 rounded-full ${zoneColors[zone]} opacity-60 group-hover:opacity-100 transition-opacity`} />
                      <input
                        type="text"
                        value={(hrZones as any)[zone]}
                        onChange={(e) => setHrZones({...hrZones, [zone]: e.target.value})}
                        placeholder={zone}
                        className="w-full bg-[#0f0f0f] border border-gray-800 py-3 rounded-xl text-white text-center text-xs focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-transparent border border-gray-800 text-gray-500 font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Отмена
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Check size={20} /> Сохранить профиль
              </button>
            </div>
          </form>
        </div>
      </Dialog.Panel>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1em; }
      `}</style>
    </Dialog>
  );
}