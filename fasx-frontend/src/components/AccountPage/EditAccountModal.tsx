import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Search, RotateCcw, Check } from "lucide-react";

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
      alert("Сессия истекла. Пожалуйста, войдите снова.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const updateData = {
      name: fullName,
      bio,
      gender,
      sportType,
      club,
      association,
      hrZones
    };

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://46.173.18.36:4000";

      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token // Формат 1 в 1 как в AddWorkoutModal
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        console.log("Профиль успешно обновлен");
        await onUpdate(); // Ждем завершения обновления данных в AccountPage
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Ошибка сервера:", errorData);
        alert(`Ошибка: ${errorData.error || "Не удалось сохранить изменения"}`);
      }
    } catch (error) {
      console.error("Сетевой сбой при обновлении профиля:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  const zoneColors: Record<string, string> = {
    I1: "bg-green-500",
    I2: "bg-lime-400",
    I3: "bg-yellow-400",
    I4: "bg-orange-400",
    I5: "bg-red-500",
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-8 rounded-2xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800">
        <button onClick={onClose} type="button" className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-8 text-white tracking-tight">
          Изменить мою информацию
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Имя</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Биография</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите немного о себе..."
              className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Пол</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="Мужчина">Мужчина</option>
                <option value="Женщина">Женщина</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Дата рождения</label>
              <input
                type="text"
                value="10.12.1995"
                readOnly
                className="w-full p-3 rounded-xl bg-[#141416] border border-gray-800 text-gray-500 cursor-not-allowed italic"
              />
            </div>
          </div>

          <div className="h-px bg-gray-800 my-4" />

          <div className="space-y-6">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Спортивные данные</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Вид спорта</label>
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Лыжные гонки">Лыжные гонки</option>
                  <option value="Легкая атлетика">Легкая атлетика</option>
                  <option value="Велоспорт">Велоспорт</option>
                  <option value="Плавание">Плавание</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ассоциация</label>
                <select
                  value={association}
                  onChange={(e) => setAssociation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ФЛГР">ФЛГР</option>
                  <option value="ВФЛА">ВФЛА</option>
                  <option value="ФВСР">ФВСР</option>
                  <option value="Нет">Нет</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Название клуба</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  placeholder="Например: Top Team"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Зоны ЧСС (уд/мин)</label>
              <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                {Object.keys(hrZones).map((zoneKey) => (
                  <div key={zoneKey} className="flex flex-col">
                    <div className={`${zoneColors[zoneKey as keyof typeof zoneColors]} py-1 text-center text-[10px] font-black text-[#1a1a1d]`}>
                      {zoneKey}
                    </div>
                    <input
                      type="text"
                      value={(hrZones as any)[zoneKey]}
                      onChange={(e) => setHrZones({...hrZones, [zoneKey]: e.target.value})}
                      placeholder="---"
                      className="bg-[#2a2a2d] text-white text-center py-2 text-xs outline-none border-t border-gray-800 focus:bg-[#323235] transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2a2a2d] text-gray-300 rounded-xl hover:bg-[#323235] transition-colors text-sm font-semibold"
            >
              <RotateCcw size={16} /> Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 text-sm font-bold"
            >
              <Check size={18} /> Сохранить
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
}