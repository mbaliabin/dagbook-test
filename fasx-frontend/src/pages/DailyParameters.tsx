import { useState, useEffect } from "react";
import { Home, BarChart3, ClipboardList, CalendarDays } from "lucide-react";

export default function DailyParameters() {
  // Основные параметры
  const [skadet, setSkadet] = useState(false);
  const [syk, setSyk] = useState(false);
  const [paReise, setPaReise] = useState(false);
  const [hoydedogn, setHoydedogn] = useState(false);
  const [fridag, setFridag] = useState(false);
  const [konkurranse, setKonkurranse] = useState(false);

  // Готовность и сон
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  // Загрузка данных из localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyParameters");
    if (saved) {
      const data = JSON.parse(saved);
      setSkadet(data.skadet || false);
      setSyk(data.syk || false);
      setPaReise(data.paReise || false);
      setHoydedogn(data.hoydedogn || false);
      setFridag(data.fridag || false);
      setKonkurranse(data.konkurranse || false);
      setPhysical(data.physical || 0);
      setMental(data.mental || 0);
      setSleepQuality(data.sleepQuality || 0);
      setPulse(data.pulse || "");
      setSleepDuration(data.sleepDuration || "");
      setComment(data.comment || "");
    }
  }, []);

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
    localStorage.setItem("dailyParameters", JSON.stringify(data));
    alert("Данные сохранены ✅");
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Навигация */}
        <div className="flex justify-around items-center border-b border-[#1f1f22] pb-2 mb-4">
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

        {/* Основные параметры */}
        <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-blue-400">Основные параметры</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSkadet(!skadet)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                skadet ? "bg-red-600" : "bg-gray-700"
              }`}
            >
              ⚠️ <span>Травма</span>
            </button>
            <button
              onClick={() => setSyk(!syk)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                syk ? "bg-red-500" : "bg-gray-700"
              }`}
            >
              🤒 <span>Болезнь</span>
            </button>
            <button
              onClick={() => setPaReise(!paReise)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                paReise ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              ✈️ <span>В пути</span>
            </button>
            <button
              onClick={() => setHoydedogn(!hoydedogn)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                hoydedogn ? "bg-purple-500" : "bg-gray-700"
              }`}
            >
              🕒 <span>Смена часового пояса</span>
            </button>
            <button
              onClick={() => setFridag(!fridag)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                fridag ? "bg-green-500" : "bg-gray-700"
              }`}
            >
              🌴 <span>Выходной</span>
            </button>
            <button
              onClick={() => setKonkurranse(!konkurranse)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 ${
                konkurranse ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              🏆 <span>Соревнование</span>
            </button>
          </div>
        </div>

        {/* Параметры готовности и сна */}
        <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-blue-400">Параметры дня</h2>
          <p className="text-gray-400 capitalize">{today}</p>

          {/* Физическая готовность */}
          <div>
            <p className="mb-2">Физическая готовность</p>
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhysical(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    i < physical ? "bg-blue-500 scale-110" : "bg-gray-700"
                  }`}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    i < mental ? "bg-blue-500 scale-110" : "bg-gray-700"
                  }`}
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
              className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white"
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    i < sleepQuality ? "bg-blue-500 scale-110" : "bg-gray-700"
                  }`}
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
              className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white"
            />
          </div>

          {/* Комментарий */}
          <div>
            <p className="mb-2">Комментарии</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишите здесь..."
              className="w-full p-2 h-24 rounded-lg bg-[#0e0e10] border border-gray-700 text-white"
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


