import React, { useState, useEffect } from "react";
import { User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api/getUserProfile";

export default function DailyParametersMobile() {
  const [name, setName] = useState("Пользователь");
  const [mainParam, setMainParam] = useState<string | null>(null);
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");

  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
      }
    };
    fetchProfile();

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
    <div className="flex justify-between flex-wrap gap-1">
      {[...Array(10)].map((_, i) => (
        <button
          key={i}
          onClick={() => setValue(i + 1)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition ${i < value ? "bg-blue-500 shadow-md scale-105" : "bg-gray-700"}`}
        >
          <Icon className="w-3 h-3" fill={i < value ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
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
      className={`w-full flex items-center px-3 py-3 space-x-2 rounded-xl transition ${mainParam === id ? activeColor : "bg-gray-700"}`}
    >
      <Icon className="w-5 h-5" fill={mainParam === id ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
      <span className="text-white text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 py-4 flex flex-col gap-4">

      {/* Шапка с логотипом, именем и кнопкой "К тренировкам" */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src="/profile.jpg" alt="Avatar" className="w-12 h-12 rounded-full" />
          <h2 className="text-lg font-semibold">{name}</h2>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          К тренировкам
        </button>
      </div>

      {/* Основные параметры */}
      <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md space-y-3">
        <h2 className="text-white text-base font-semibold">Основные параметры</h2>
        {renderSingleSelectButton("skadet", "Травма", User, "bg-red-600")}
        {renderSingleSelectButton("syk", "Болезнь", User, "bg-red-500")}
        {renderSingleSelectButton("paReise", "В пути", User, "bg-blue-500")}
      </div>

      {/* Параметры дня */}
      <div className="bg-[#1a1a1d] p-4 rounded-2xl shadow-md space-y-3">
        <h2 className="text-white text-base font-semibold">Параметры дня</h2>
        <p className="text-gray-400 text-xs capitalize">{today}</p>

        <div className="space-y-2">
          <p className="text-xs">Физическая готовность</p>
          {renderTenButtons(physical, setPhysical, User)}
        </div>

        <div className="space-y-2">
          <p className="text-xs">Ментальная готовность</p>
          {renderTenButtons(mental, setMental, User)}
        </div>

        <div className="space-y-2">
          <p className="text-xs">Качество сна</p>
          {renderTenButtons(sleepQuality, setSleepQuality, User)}
        </div>

        <div className="space-y-2">
          <p className="text-xs">Пульс (уд/мин)</p>
          <input
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            placeholder="например, 60"
            className="w-full p-2 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs">Продолжительность сна (ч:мин)</p>
          <input
            type="text"
            value={sleepDuration}
            onChange={(e) => setSleepDuration(e.target.value)}
            placeholder="например, 07:30"
            className="w-full p-2 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs">Комментарии</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите здесь..."
            className="w-full p-2 h-24 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs"
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
