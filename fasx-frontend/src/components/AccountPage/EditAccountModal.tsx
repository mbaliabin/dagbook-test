import React from "react";
import { Dialog } from "@headlessui/react";
import { X, Search, RotateCcw, Check } from "lucide-react";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

export default function EditAccountModal({ isOpen, onClose, profile }: EditAccountModalProps) {
  const hrZones = [
    { id: 'I1', color: "bg-green-500", range: '118 - 143' },
    { id: 'I2', color: "bg-lime-400", range: '143 - 161' },
    { id: 'I3', color: "bg-yellow-400", range: '161 - 171' },
    { id: 'I4', color: "bg-orange-400", range: '171 - 181' },
    { id: 'I5', color: "bg-red-500", range: '181 - 200' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <Dialog.Panel className="relative bg-[#1a1a1d] max-h-[90vh] overflow-y-auto p-8 rounded-2xl w-[95%] max-w-2xl z-50 text-white shadow-2xl border border-gray-800">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-8 text-white tracking-tight">
          Изменить мою информацию
        </Dialog.Title>

        <form className="space-y-8">
          {/* Имя и Фамилия */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Имя</label>
              <input
                type="text"
                defaultValue={profile?.name?.split(' ')[0] || ""}
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Фамилия</label>
              <input
                type="text"
                defaultValue={profile?.name?.split(' ')[1] || ""}
                className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Биография */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Биография</label>
            <textarea
              rows={3}
              placeholder="Расскажите немного о себе..."
              className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Дата и Пол */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Дата рождения</label>
              <input
                type="text"
                value="10.12.1995"
                readOnly
                className="w-full p-3 rounded-xl bg-[#141416] border border-gray-800 text-gray-500 cursor-not-allowed italic"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Пол</label>
              <select className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-800 my-4" />

          {/* Спортивные данные */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Спортивные данные</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Вид спорта</label>
                <select className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 cursor-pointer">
                  <option>Лыжные гонки</option>
                  <option>Легкая атлетика</option>
                  <option>Велоспорт</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ассоциация</label>
                <select className="w-full p-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 cursor-pointer">
                  <option>ФЛГР</option>
                  <option>ВФЛА</option>
                  <option>ФВСР</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Название клуба</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Введите название вашего клуба"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#2a2a2d] border border-gray-700 text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Зоны ЧСС */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Зоны ЧСС</label>
              <div className="grid grid-cols-5 gap-1 rounded-xl overflow-hidden border border-gray-800">
                {hrZones.map(z => (
                  <div key={z.id} className="flex flex-col">
                    <div className={`${z.color} py-1 text-center text-[10px] font-black text-[#1a1a1d]`}>{z.id}</div>
                    <input
                      type="text"
                      defaultValue={z.range}
                      className="bg-[#2a2a2d] text-white text-center py-2 text-xs outline-none border-t border-gray-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Чекбокс уведомлений (добавлен обратно) */}
          <div className="pt-4 border-t border-gray-800">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer h-6 w-6 appearance-none rounded-lg border border-gray-700 bg-[#2a2a2d] checked:bg-blue-600 checked:border-blue-600 transition-all"
                />
                <Check className="absolute h-6 w-6 text-white scale-0 peer-checked:scale-75 transition-transform pointer-events-none" />
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                Уведомлять тренера о прошедших тренировках
              </span>
            </label>
          </div>

          {/* Кнопки */}
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