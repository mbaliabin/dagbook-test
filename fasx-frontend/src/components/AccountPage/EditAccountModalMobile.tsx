import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Search, RotateCcw, Check, User, Trophy, Activity, AlignLeft } from "lucide-react";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
  onUpdate: () => void;
}

export default function EditAccountModalMobile({ isOpen, onClose, profile, onUpdate }: EditAccountModalProps) {
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
      if (profile.profile?.hrZones) setHrZones(profile.profile.hrZones);
    }
  }, [profile, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const updateData = { name: fullName, bio, gender, sportType, club, association, hrZones };

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://46.173.18.36:4000";
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
        await onUpdate();
        onClose();
      }
    } catch (error) { console.error(error); }
  };

  const zoneColors: Record<string, string> = {
    I1: "bg-green-500", I2: "bg-lime-400", I3: "bg-yellow-400", I4: "bg-orange-400", I5: "bg-red-500",
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[200]">
        <Transition.Child
          as={Fragment}
          enter="duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150"
        >
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end sm:items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="duration-300 ease-out"
            enterFrom="translate-y-full sm:scale-95"
            enterTo="translate-y-0 sm:scale-100"
            leave="duration-200"
          >
            <Dialog.Panel className="relative bg-[#0d0d0f] w-full sm:max-w-xl h-[90vh] sm:h-auto rounded-t-[24px] sm:rounded-2xl border-t border-white/10 flex flex-col text-white overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
                <Dialog.Title className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Профиль
                </Dialog.Title>
                <button onClick={onClose} className="p-1 text-gray-500 active:scale-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-hide pb-28">

                {/* Name Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Имя</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-lg bg-[#16161a] border border-white/5 text-[13px] outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Фамилия</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#16161a] border border-white/5 text-[13px] outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Биография</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#16161a] border border-white/5 text-[12px] outline-none resize-none focus:border-blue-500/50"
                    placeholder="Пару слов о себе..."
                  />
                </div>

                {/* Sports Section */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em]">Спортивная информация</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Вид</label>
                      <select
                        value={sportType}
                        onChange={(e) => setSportType(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-[#1a1a1e] border border-white/5 text-[12px] font-bold outline-none appearance-none"
                      >
                        <option value="Лыжные гонки">Лыжные гонки</option>
                        <option value="Легкая атлетика">Легкая атлетика</option>
                        <option value="Велоспорт">Велоспорт</option>
                        <option value="Плавание">Плавание</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Ассоциация</label>
                      <select
                        value={association}
                        onChange={(e) => setAssociation(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-[#1a1a1e] border border-white/5 text-[12px] font-bold outline-none appearance-none"
                      >
                        <option value="ФЛГР">ФЛГР</option>
                        <option value="ВФЛА">ВФЛА</option>
                        <option value="ФВСР">ФВСР</option>
                        <option value="Нет">Нет</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Клуб</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                      <input
                        type="text"
                        value={club}
                        onChange={(e) => setClub(e.target.value)}
                        placeholder="Название клуба"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1a1a1e] border border-white/5 text-[12px] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* HR Zones */}
                <div className="space-y-3">
                  <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-0.5">Пульс (зоны)</label>
                  <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-white/5">
                    {Object.keys(hrZones).map((zoneKey) => (
                      <div key={zoneKey} className="flex flex-col bg-[#16161a]">
                        <div className={`${zoneColors[zoneKey]} py-1 text-center text-[8px] font-black text-black`}>
                          {zoneKey}
                        </div>
                        <input
                          type="text"
                          value={(hrZones as any)[zoneKey]}
                          onChange={(e) => setHrZones({...hrZones, [zoneKey]: e.target.value})}
                          placeholder="---"
                          className="w-full bg-transparent text-white text-center py-2 text-[11px] font-bold outline-none border-t border-white/5 focus:bg-white/5 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              {/* Footer Button */}
              <div className="p-4 bg-[#0d0d0f]/80 backdrop-blur-md border-t border-white/5 shrink-0">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg shadow-blue-900/20"
                >
                  <Check size={16} strokeWidth={3} /> Сохранить изменения
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>

        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
      </Dialog>
    </Transition>
  );
}