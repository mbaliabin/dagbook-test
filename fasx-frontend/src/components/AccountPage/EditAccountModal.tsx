import React from 'react';
import { X, Search, RotateCcw, Check } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  const hrZones = [
    { id: 'I1', color: '#bbf7d0', range: '118 - 143' },
    { id: 'I2', color: '#86efac', range: '143 - 161' },
    { id: 'I3', color: '#fef08a', range: '161 - 171' },
    { id: 'I4', color: '#fed7aa', range: '171 - 181' },
    { id: 'I5', color: '#fca5a5', range: '181 - 200' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[550px] max-h-[95vh] overflow-y-auto rounded shadow-2xl flex flex-col text-[#555555]">

        {/* Шапка модалки */}
        <div className="bg-[#333333] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-medium">Изменить мою информацию</h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Имя / Фамилия */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Имя</label>
              <input type="text" defaultValue="Maksim Igorevich" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Фамилия</label>
              <input type="text" defaultValue="Balyabin" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Рождение / Секс */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Дата рождения</label>
              <input type="text" value="1995-12-10" readOnly className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
              <p className="text-[10px] leading-tight text-gray-400 mt-1">Эта информация получена из регистра населения и не может быть изменена.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Секс</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white">
                <option>Мужчина</option>
                <option>Женщина</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Настройки обучения */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Настройки обучения</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Спорт</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                  <option>беговые лыжи</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Специальная ассоциация</label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                  <option>Норвежская лыжная ассоциация</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" defaultValue="IL Aasguten ski" className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" defaultValue="Østerår ungdomskole" className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm" />
              </div>
            </div>

            {/* Таблица пульсовых зон */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Мои зоны частоты сердечных сокращений</label>
              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="grid grid-cols-5 text-center text-[11px] font-bold">
                  {hrZones.map(z => (
                    <div key={z.id} style={{ backgroundColor: z.color }} className="py-1.5 border-r border-gray-300 last:border-0">{z.id}</div>
                  ))}
                </div>
                <div className="grid grid-cols-5 text-center">
                  {hrZones.map((z, i) => (
                    <input key={i} type="text" defaultValue={z.range} className="w-full py-2 text-center text-xs border-r border-gray-300 last:border-0 outline-none" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Настройки дневника */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Настройки дневника</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-gray-700" />
                <span className="text-xs">Уведомить тренера (можно изменить для каждой сессии/комментария)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-gray-700" />
                <span className="text-xs">Моё имя не должно быть доступно для поиска другими пользователями.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Футер модалки */}
        <div className="bg-gray-50 p-4 flex justify-between border-t border-gray-200">
          <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
            <RotateCcw size={16} /> Отмена
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-300 px-6 py-1.5 rounded text-sm font-medium hover:bg-gray-100">
            <Check size={18} className="text-green-600" /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;