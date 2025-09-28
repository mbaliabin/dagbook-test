{/* Верхний блок */}
<div className="flex items-center justify-between mb-2"> {/* изменено mb-4 → mb-2 */}
  <div className="flex items-center gap-4">
    <img
      src="/profile.jpg"
      alt="Avatar"
      className="w-16 h-16 rounded-full object-cover"
    />
    <div>
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="text-sm text-gray-400">{formattedFixedDate}</p>
    </div>
  </div>

  <div className="flex gap-2 items-center">
    <button
      onClick={() => navigate("/profile")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded whitespace-nowrap"
    >
      Перейти к тренировкам
    </button>

    <button
      onClick={() => navigate("/profile/settings")}
      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded flex items-center justify-center"
      title="Настройка профиля"
    >
      <Settings className="w-5 h-5" />
    </button>
  </div>
</div>
