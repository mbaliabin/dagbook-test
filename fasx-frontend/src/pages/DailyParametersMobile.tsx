import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  User,
  Brain,
  Moon,
  AlertTriangle,
  Thermometer,
  Send,
  Clock,
  Sun,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

export default function DailyParametersMobile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mainParam, setMainParam] = useState<string | null>(null);
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState("");
  const [sleepDuration, setSleepDuration] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
      } catch (err) {
        console.error(err);
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

  const prevDay = () => setSelectedDate(selectedDate.subtract(1, "day"));
  const nextDay = () => setSelectedDate(selectedDate.add(1, "day"));

  const renderTenButtons = (
    value: number,
    setValue: (val: number) => void,
    Icon: React.FC<React.SVGProps<SVGSVGElement>>
  ) => (
    <div className="flex justify-between flex-wrap gap-1">
      {[...Array(10)].map((_, i) => (
        <button
          key={i}
          onClick={() => setValue(i + 1)}
          className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition ${
            i < value ? "bg-blue-500 shadow-md scale-105" : "bg-gray-700"
          }`}
        >
          <Icon
            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
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
      className={`w-full flex items-center px-3 sm:px-4 py-3 sm:py-4 space-x-2 sm:space-x-3 rounded-xl transition ${
        mainParam === id ? activeColor : "bg-gray-700"
      }`}
    >
      <Icon
        className="w-5 h-5 sm:w-6 sm:h-6"
        fill={mainParam === id ? "#fff" : "none"}
        stroke="#fff"
        strokeWidth={2}
      />
      <span className="text-xs sm:text-sm md:text-base text-white">
        {label}
      </span>
    </button>
  );

  // фиксированная дата под именем
  const fixedDate = dayjs().format("D MMMM");
  const formattedFixedDate =
    fixedDate.charAt(0).toUpperCase() + fixedDate.slice(1);

  // дата со стрелками
  const formattedDate = selectedDate
    .format("dddd, DD MMMM")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 sm:px-4 py-4 sm:py-6">
      {/* Верхний блок: Лого, имя и кнопка перейти к тренировкам */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src="/profile.jpg"
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <h2 className="text-base font-semibold">{name || "Загрузка..."}</h2>
            <span className="text-xs text-gray-400">{formattedFixedDate}</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
        >
          Перейти к тренировкам
        </button>
      </div>

      {/* Быстрый доступ к предыдущим/следующим дням */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={prevDay} className="p-1 rounded bg-[#1f1f22]">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-300">{formattedDate}</span>
        <button onClick={nextDay} className="p-1 rounded bg-[#1f1f22]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Основные параметры */}
      <div className="bg-[#1a1a1d] p-3 sm:p-4 rounded-2xl shadow-md space-y-3 sm:space-y-4 mb-4">
        <h2 className="text-white text-sm sm:text-lg font-semibold">
          Основные параметры
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {renderSingleSelectButton("skadet", "Травма", AlertTriangle, "bg-red-600")}
          {renderSingleSelectButton("syk", "Болезнь", Thermometer, "bg-red-500")}
          {renderSingleSelectButton("paReise", "В пути", Send, "bg-blue-500")}
          {renderSingleSelectButton(
            "hoydedogn",
            "Смена часового пояса",
            Clock,
            "bg-purple-500"
          )}
          {renderSingleSelectButton("fridag", "Выходной", Sun, "bg-green-500")}
          {renderSingleSelectButton(
            "konkurranse",
            "Соревнование",
            Award,
            "bg-yellow-500"
          )}
        </div>
      </div>

      {/* Параметры дня */}
      <div className="bg-[#1a1a1d] p-3 sm:p-4 rounded-2xl shadow-md space-y-3 sm:space-y-4">
        <h2 className="text-white text-sm sm:text-lg font-semibold">
          Параметры дня
        </h2>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Физическая готовность</p>
          {renderTenButtons(physical, setPhysical, User)}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Ментальная готовность</p>
          {renderTenButtons(mental, setMental, Brain)}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Пульс (уд/мин)</p>
          <input
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            placeholder="например, 60"
            className="w-full p-2 sm:p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Качество сна</p>
          {renderTenButtons(sleepQuality, setSleepQuality, Moon)}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Продолжительность сна (ч:мин)</p>
          <input
            type="text"
            value={sleepDuration}
            onChange={(e) => setSleepDuration(e.target.value)}
            placeholder="например, 07:30"
            className="w-full p-2 sm:p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm">Комментарии</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите здесь..."
            className="w-full p-2 sm:p-3 h-24 sm:h-28 rounded-xl bg-[#0e0e10] border border-gray-700 text-white text-xs sm:text-sm"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-xl text-xs sm:text-sm"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
