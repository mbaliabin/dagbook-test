// --- МОДАЛЬНОЕ ОКНО (С биографией и уведомлениями) ---

const EditAccountModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1d] w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 shadow-2xl flex flex-col">

        {/* Хедер */}
        <div className="bg-[#2a2a2d] p-5 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Редактирование профиля</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Тело формы */}
        <div className="p-6 space-y-6">

          {/* Основные данные */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Имя</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[0]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Фамилия</label>
              <input type="text" defaultValue={profile?.name?.split(' ')[1]} className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          {/* Поле: Биография */}
          <div className="space-y-1.5">
            <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Биография / О себе</label>
            <textarea
              placeholder="Расскажите о своем спортивном опыте..."
              rows="3"
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-600 outline-none transition-all resize-none"
            />
          </div>

          {/* Спорт */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Спортивные данные</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Вид спорта</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>Лыжные гонки</option>
                    <option>Легкая атлетика</option>
                    <option>Велоспорт</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Ассоциация</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>Норвежская ассоциация</option>
                    <option>ФЛГР (Россия)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Клуб</label>
                <div className="relative">
                  <select className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none appearance-none cursor-pointer">
                    <option>IL Aasguten ski</option>
                    <option>Другой</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 text-gray-600" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-1">Своё название клуба</label>
                <input type="text" placeholder="Введите название..." className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-600" />
              </div>
            </div>
          </div>

          {/* Настройки уведомлений и приватности */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Настройки связи</h3>

             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 checked:border-blue-600 transition-all" defaultChecked />
                  <Plus size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">Уведомлять тренера о прошедших тренировках</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 bg-[#0f0f0f] checked:bg-blue-600 checked:border-blue-600 transition-all" />
                  <Plus size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">Скрыть профиль из общего поиска</span>
             </label>
          </div>
        </div>

        {/* Футер */}
        <div className="p-5 bg-[#141417] border-t border-gray-800 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold transition-colors">
             Отмена
          </button>
          <button className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all active:scale-95">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};