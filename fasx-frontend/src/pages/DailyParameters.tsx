import { useState } from "react";
import { Home, BarChart3, ClipboardList, CalendarDays } from "lucide-react";

export default function DailyParameters() {
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");

  // Новые параметры
  const [skadet, setSkadet] = useState(false);
  const [syk, setSyk] = useState(false);
  const [paReise, setPaReise] = useState(false);
  const [hoydedogn, setHoydedogn] = useState(false);
  const [fridag, setFridag] = useState(false);
  const [konkurranse, setKonkurranse] = useState(false);

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const handleSave = () => {
    const data = {
      skadet,
      syk,
      paReise,
      hoydedogn,
      fridag,
      konkurranse,
      physical,
      mental,
      sleepQuality,
      pulse,
      sleepDuration,
      comment,
    };
    console.log("Сохранённые данные:", data);
    alert("Данные сохранены ✅");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Навигация */}
      <div className="flex justify-around items-center border-b border-gray-700 pb-2 mb-4">
        <div className="flex flex-col items-center text-blue-400">
          <Home size={22} />
          <span className="text-xs">Главная</span>
        </div>
        <div className="flex flex-col items-center">
          <BarChart3 size={22} />
          <span className="text-xs">Тренировка</span>
        </div>
        <div className="flex flex-col items-center">
          <ClipboardList size={22} />
          <span className="text-xs">Планирование</span>
        </div>
        <div className="flex flex-col items-center">
          <CalendarDays size={22} />
          <span className="text-xs">Статистика</span>
        </div>
      </div>

      {/* Карточка параметров */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg">
        <div className="p-4 space-y-6">
          <h2 className="text-xl font-semibold text-blue-400">
            Параметры дня
          </h2>
          <p className="text-gray-400 capitalize">{today}</p>

          {/* Новый блок с основными параметрами */}
          <div>
            <p className="mb-2 font-semibold">Основные параметры</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSkadet(!skadet)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  skadet ? "bg-red-600" : "bg-gray-700"
                }`}
              >
                <span>⚠️</span>
                <span>Травма</span>
              </button>
              <button
                onClick={() => setSyk(!syk)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  syk ? "bg-red-500" : "bg-gray-700"
                }`}
              >
                <span>🤒</span>
                <span>Болезнь</span>
              </button>
              <button
                onClick={() => setPaReise(!paReise)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  paReise ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                <span>✈️</span>
                <span>В пути</span>
              </button>
              <button
                onClick={() => setHoydedogn(!hoydedogn)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  hoydedogn ? "bg-purple-500" : "bg-gray-700"
                }`}
              >
                <span>🕒</span>
                <span>Смена часового пояса</span>
              </button>
              <button
                onClick={() => setFridag(!fridag)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  fridag ? "bg-green-500" : "bg-gray-700"
                }`}
              >
                <span>🌴</span>
                <span>Выходной</span>
              </button>
              <button
                onClick={() => setKonkurranse(!konkurranse)}
                className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                  konkurranse ? "bg-yellow-500" : "bg-gray-700"
                }`}
              >
                <span>🏆</span>
                <span>Соревнование</span>
              </button>
            </div>
          </div>

          {/* Физическая готовность */}
          <div>
            <p className="mb-2">Физическая готовность</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhysical(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < physical ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  💪
                </button>
              ))}
            </div>
          </div>

          {/* Ментальная готовность */}
          <div>
            <p className="mb-2">Ментальная готовность</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMental(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < mental ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  🧠
                </button>
              ))}
            </div>
          </div>

          {/* Пульс */}
          <div>
            <p className="mb-2">Пульс (уд/мин)</p>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              placeholder="например, 60"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Сон */}
          <div>
            <p className="mb-2">Качество сна</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSleepQuality(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition
                    ${i < sleepQuality ? "bg-blue-500 scale-110" : "bg-gray-700"}`}
                >
                  🌙
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2">Продолжительность сна (ч:мин)</p>
            <input
              type="text"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              placeholder="например, 07:30"
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Комментарий */}
          <div>
            <p className="mb-2">Комментарии</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишите здесь..."
              className="w-full p-2 h-24 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          {/* Кнопка сохранить */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}


