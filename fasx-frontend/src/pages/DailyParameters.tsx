import { useState, useEffect } from "react";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  User, Brain, Moon, AlertTriangle, Thermometer, Send, Clock, Sun, Award, Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DailyParameters() {
  const navigate = useNavigate();

  // Основные параметры (только один можно выбрать)
  const [mainParam, setMainParam] = useState<string | null>(null);

  // Параметры дня
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("Пользователь");

  const today = new Date().toLocaleDateString("ru-RU", {
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
    const data = {
      mainParam,
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

  const renderTenButtons = (value: number, setValue: (val: number) => void, Icon: React.FC<React.SVGProps<SVGSVGElement>>) => (
    <div className="flex flex-wrap gap-3">
      {[...Array(10)].map((_, i) => (
        <button
          key={i}
          onClick={() => setValue(i + 1)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            i < value ? "bg-blue-500 shadow-lg scale-110" : "bg-gray-700"
          }`}
        >
          <Icon
            className="w-6 h-6"
            fill={i < value ? "#fff" : "none"}
            stroke="#fff"
            strokeWidth={2}
          />
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
      className={`px-4 py-3 rounded-xl flex items-center space-x-2 transition ${
        mainParam === id ? activeColor : "bg-gray-700"
      }`}
    >
      <Icon className="w-6 h-6" fill={mainParam === id ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Верхний блок: Лого, имя и кнопки */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-sm text-gray-400">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
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

        {/* Основные параметры */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-white">Основные параметры</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {renderSingleSelectButton("skadet", "Травма", AlertTriangle, "bg-red-600")}
            {renderSingleSelectButton("syk", "Болезнь", Thermometer, "bg-red-500")}
            {renderSingleSelectButton("paReise", "В пути", Send, "bg-blue-500")}
            {renderSingleSelectButton("hoydedogn", "Смена часового пояса", Clock, "bg-purple-500")}
            {renderSingleSelectButton("fridag", "Выходной", Sun, "bg-green-500")}
            {renderSingleSelectButton("konkurranse", "Соревнование", Award, "bg-yellow-500")}
          </div>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-white">Параметры дня</h2>

          <div className="space-y-2">
            <p>Физическая готовность</p>
            {renderTenButtons(physical, setPhysical, User)}
          </div>

          <div className="space-y-2">
            <p>Ментальная готовность</p>
            {renderTenButtons(mental, setMental, Brain)}
          </div>

          <div className="space-y-2">
            <p>Пульс (уд/мин)</p>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              placeholder="например, 60"
              className="w-full p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <p>Качество сна</p>
            {renderTenButtons(sleepQuality, setSleepQuality, Moon)}
          </div>

          <div className="space-y-2">
            <p>Продолжительность сна (ч:мин)</p>
            <input
              type="text"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              placeholder="например, 07:30"
              className="w-full p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <p>Комментарии</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишите здесь..."
              className="w-full p-3 h-28 rounded-xl bg-[#0e0e10] border border-gray-700 text-white"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
          >
            Сохранить
          </button>
        </div>

      </div>
    </div>
  );
}
