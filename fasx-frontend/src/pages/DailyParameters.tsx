import { useState, useEffect } from "react";
import { Home, BarChart3, ClipboardList, CalendarDays } from "lucide-react";

export default function DailyParameters() {
  // Основные параметры с 10-балльной шкалой
  const [skadet, setSkadet] = useState(0);
  const [syk, setSyk] = useState(0);
  const [paReise, setPaReise] = useState(0);
  const [hoydedogn, setHoydedogn] = useState(0);
  const [fridag, setFridag] = useState(0);
  const [konkurranse, setKonkurranse] = useState(0);

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
      setSkadet(data.skadet || 0);
      setSyk(data.syk || 0);
      setPaReise(data.paReise || 0);
      setHoydedogn(data.hoydedogn || 0);
      setFridag(data.fridag || 0);
      setKonkurranse(data.konkurranse || 0);
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

  const renderTenButtons = (value: number, setValue: (val: number) => void, icon: string) => {
    return (
      <div className="flex space-x-2">
        {[...Array(10)].map((_, i) => (
          <button
            key={i}
            onClick={() => setValue(i + 1)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition ${
              i < value ? "bg-blue-500 scale-110" : "bg-gray-700"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    );
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
          <h2 className="text-xl font-semibold text-white">Основные параметры</h2>

          <div>
            <p className="mb-2">Травма</p>
            {renderTenButtons(skadet, setSkadet, "⚠️")}
          </div>

          <div>
            <p className="mb-2">Болезнь</p>
            {renderTenButtons(syk, setSyk, "🤒")}
          </div>

          <div>
            <p className="mb-2">В пути</p>
            {renderTenButtons(paReise, setPaReise, "✈️")}
          </div>

          <div>
            <p className="mb-2">Смена часового пояса</p>
            {renderTenButtons(hoydedogn, setHoydedogn, "🕒")}
          </div>

          <div>
            <p className="mb-2">Выходной</p>
            {renderTenButtons(fridag, setFridag, "🌴")}
          </div>

          <div>
            <p className="mb-2">Соревнование</p>
            {renderTenButtons(konkurranse, setKonkurranse, "🏆")}
          </div>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-white">Параметры дня</h2>
          <p className="text-gray-400 capitalize">{today}</p>

          {/* Физическая готовность */}
          <div>
            <p className="mb-2">Физическая готовность</p>
            {renderTenButtons(physical, setPhysical, "💪")}
          </div>

          {/* Ментальная готовность */}
          <div>
            <p className="mb-2">Ментальная готовность</p>
            {renderTenButtons(mental, setMental, "🧠")}
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
            {renderTenButtons(sleepQuality, setSleepQuality, "🌙")}
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



