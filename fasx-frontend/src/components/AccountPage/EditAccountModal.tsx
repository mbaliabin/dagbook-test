import React from "react";
import { X, Search } from "lucide-react";

export const EditProfileModal = ({ isOpen, onClose, initialData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1d] w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="bg-[#2a2a2d] p-4 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Изменить мою информацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 text-sm">

          {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 ml-1">Имя</label>
              <input type="text" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" defaultValue="Maksim Igorevich" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 ml-1">Фамилия</label>
              <input type="text" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none" defaultValue="Balyabin" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 ml-1">Дата рождения</label>
              <input type="text" className="w-full bg-[#0f0f0f]/50 border border-gray-800 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" value="1995-12-10" readOnly />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 ml-1">Секс</label>
              <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none appearance-none">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-800" />

          {/* НАСТРОЙКИ ОБУЧЕНИЯ */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Настройки обучения</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs">Спорт</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white outline-none">
                  <option>беговые лыжи</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-400 text-xs">Специальная ассоциация</label>
                <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2 text-white outline-none">
                  <option>Норвежская лыжная...</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input type="text" placeholder="IL Aasguten ski" className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white outline-none" />
            </div>
          </div>

          {/* ТАБЛИЦА ЗОН ЧСС */}
          <div className="space-y-3">
            <label className="text-gray-400 text-xs">Мои зоны частоты сердечных сокращений</label>
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 text-center text-[10px] font-bold">
                <div className="bg-green-500/20 text-green-400 py-1 border-r border-gray-800">I1</div>
                <div className="bg-cyan-500/20 text-cyan-400 py-1 border-r border-gray-800">I2</div>
                <div className="bg-yellow-500/20 text-yellow-400 py-1 border-r border-gray-800">I3</div>
                <div className="bg-orange-500/20 text-orange-400 py-1 border-r border-gray-800">I4</div>
                <div className="bg-red-500/20 text-red-400 py-1">I5</div>
              </div>
              <div className="grid grid-cols-5 text-center bg-[#0f0f0f]">
                <input className="bg-transparent py-2 border-r border-gray-800 text-center outline-none text-xs" defaultValue="118 - 143" />
                <input className="bg-transparent py-2 border-r border-gray-800 text-center outline-none text-xs" defaultValue="143 - 161" />
                <input className="bg-transparent py-2 border-r border-gray-800 text-center outline-none text-xs" defaultValue="161 - 171" />
                <input className="bg-transparent py-2 border-r border-gray-800 text-center outline-none text-xs" defaultValue="171 - 181" />
                <input className="bg-transparent py-2 text-center outline-none text-xs" defaultValue="181 - 200" />
              </div>
            </div>
          </div>

          {/* ЧЕКБОКСЫ */}
          <div className="space-y-3 pt-2">
             <label className="flex items-start gap-3 group cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 transition-all" />
                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">Уведомить тренера (можно изменить для каждой сессии)</span>
             </label>
             <label className="flex items-start gap-3 group cursor-pointer">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 transition-all" />
                <span className="text-gray-400 group-hover:text-gray-200 transition-colors">Моё имя не должно быть доступно для поиска другими пользователями</span>
             </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-[#141417] border-t border-gray-800 flex justify-between gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">Отмена</button>
          <button className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};