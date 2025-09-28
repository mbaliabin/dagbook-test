import { useState, useEffect } from "react";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  User, Brain, Moon, AlertTriangle, Thermometer, Send, Clock, Sun, Award
} from "lucide-react";

export default function DailyParametersMobile() {
  const [mainParam, setMainParam] = useState<string | null>(null);
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

  useEffect(() => {
    const saved = localStorage.getItem("dailyParameters");
    if (saved) {
      const data = JSON.parse(saved);
      setMainParam(data.mainParam || null);
      setPhysical(data.physical || 0);
      setMental(data.mental || 0);
      setSleepQuality(data.sleepQuality || 0);
      setPulse(data.pulse || "");
      setSleepDuration(data.sleepDuration || "");
      setComment(data.comment || "");
    }
  }, []);

  const handleSave = () => {
    const data = { mainParam, physical, mental, sleepQuality, pulse, sleepDuration, comment };
    localStorage.setItem("dailyParameters", JSON.stringify(data));
    alert("Данные сохранены ✅");
  };

  const renderTenButtons = (value: number, setValue: (val: number) => void, Icon: React.FC<React.SVGProps<SVGSVGElement>>) => (
    <div className="flex flex-wrap justify-center gap-2">
      {[...Array(10)].map((_, i) => (
        <button
          key={i}
          onClick={() => setValue(i + 1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${i < value ? "bg-blue-500 shadow-md scale-105" : "bg-gray-700"}`}
        >
          <Icon className="w-5 h-5" fill={i < value ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
        </button>
      ))}
    </div>
  );

  const renderSingleSelectButton = (
    id: string,
    label: string,
    Icon: React.FC<React.SVGProps<SVGSVGElement>>,
    activeColor: string
  ) => (
    <button
      onClick={() => setMainParam(id)}
      className={`w-full flex items-center px-3 py-2 space-x-2 rounded-xl transition ${mainParam === id ? activeColor : "bg-gray-700"}`}
    >
      <Icon className="w-5 h-5" fill={mainParam === id ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
      <span className="text-white text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 py-4 flex flex-col gap-3">
      {/* Временный маркер версии */}
      <p className="text-green-500 text-center font-semibold">MOBILE VERSION</p>

      {/* Навигация */}
      <div className="flex justify-around items-center border-b border-[#1f1f22] pb-2">
        <div className="flex flex-col items-center text-blue-400">
          <Home size={20} />
          <span className="text-xs">Главная</span>
        </div>
        <div className="flex flex-col items-center">
          <BarChart3 size={20} />
          <span className="text-xs">Тренировка</span>
        </div>
        <div className="flex flex-col items-center">
          <ClipboardList size={20} />
          <span className="text-xs">Планирование</span>
        </div>
        <div className="flex flex-col items-center">
          <CalendarDays size={20} />
          <span className="text-xs">Статистика</span>
        </div>
      </div>

      {/* Основные параметры */}
      <div className="bg-[#1a1a1d] p-3 rounded-2xl shadow-md flex flex-col gap-2">
        <h2 className="text-white text-base font-semibold">Основные параметры</h2>
        {renderSingleSelectButton("skadet", "Травма", AlertTriangle, "bg-red-600")}
        {renderSingleSelectButton("syk", "Болезнь", Thermometer, "bg-red-500")}
        {renderSingleSelectButton("paReise", "В пути", Send, "bg-blue-500")}
        {renderSingleSelectButton("hoydedogn", "Смена часового пояса", Clock, "bg-purple-500")}
        {renderSingleSelectButton("fridag", "Выходной", Sun, "bg-green-500")}
        {renderSingleSelectButton("konkurranse", "Соревнование", Award, "bg-yellow-500")}
      </div>

      {/* Параметры дня */}
      <div className="bg-[#1a1a1d] p-3 rounded-2xl shadow-md flex flex-col gap-3">
        <h2 className="text-white text-base font-semibold">Параметры дня</h2>
        <p className="text-gray-400 text-sm capitalize">{today}</p>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Физическая готовность</p>
          {renderTenButtons(physical, setPhysical, User)}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Ментальная готовность</p>
          {renderTenButtons(mental, setMental, Brain)}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Пульс (уд/мин)</p>
          <input
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            placeholder="например, 60"
            className="w-full p-2 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Качество сна</p>
          {renderTenButtons(sleepQuality, setSleepQuality, Moon)}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Продолжительность сна (ч:мин)</p>
          <input
            type="text"
            value={sleepDuration}
            onChange={(e) => setSleepDuration(e.target.value)}
            placeholder="например, 07:30"
            className="w-full p-2 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm">Комментарии</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите здесь..."
            className="w-full p-2 h-24 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

