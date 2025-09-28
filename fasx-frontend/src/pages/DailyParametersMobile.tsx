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
  const [today] = useState(dayjs()); // фиксированная текущая дата
  const [selectedDate, setSelectedDate] = useState(dayjs()); // изменяемая дата

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

  const formatDate = (date: dayjs.Dayjs) =>
    date
      .format("dddd, DD MMMM")
      .split(" ")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1) // первая буква заглавная
      )
      .join(" ");

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 sm:px-4 py-4 sm:py-6">
      {/* Верхний блок */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src="/profile.jpg"
            alt="Avatar"
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <h2 className="text-base font-semibold truncate">
              {name || "Загрузка..."}
            </h2>
            {/* Всегда текущая дата */}
            <span className="text-xs text-gray-400 truncate">
              {formatDate(today)}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="ml-3 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Перейти к тренировкам
        </button>
      </div>

      {/* Дата с навигацией (изменяемая) */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        <button
          onClick={prevDay}
          className="p-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
        <button
          onClick={nextDay}
          className="p-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ...остальной код (основные и дневные параметры остаются без изменений)... */}
    </div>
  );
}
