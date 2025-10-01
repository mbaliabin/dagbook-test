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
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getUserProfile } from "../api/getUserProfile";

dayjs.locale("ru");

const TenButtons = ({ value, onChange, Icon }) => (
  <div className="flex flex-wrap gap-2 justify-center">
    {[...Array(10)].map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i + 1)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
          i < value ? "bg-blue-500 shadow-md scale-105" : "bg-gray-700"
        }`}
      >
        <Icon
          className="w-5 h-5"
          fill={i < value ? "#fff" : "none"}
          stroke="#fff"
          strokeWidth={2}
        />
      </button>
    ))}
  </div>
);

const SingleSelectButton = ({
  id,
  label,
  Icon,
  activeId,
  onClick,
  activeColor,
}) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 transition text-sm ${
      activeId === id ? activeColor : "bg-gray-700"
    }`}
  >
    <Icon
      className="w-5 h-5"
      fill={activeId === id ? "#fff" : "none"}
      stroke="#fff"
      strokeWidth={2}
    />
    <span>{label}</span>
  </button>
);

export default function DailyParameters() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mainParam, setMainParam] = useState(null);
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
        console.error("Ошибка загрузки профиля:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDailyInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const dateStr = selectedDate.format("YYYY-MM-DD");

        const response = await fetch(
          `${API_URL}/api/daily-information?date=${dateStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          setMainParam(null);
          setPhysical(0);
          setMental(0);
          setSleepQuality(0);
          setPulse("");
          setSleepDuration("");
          setComment("");
          return;
        }

        const data = await response.json();
        setMainParam(data.main_param || null);
        setPhysical(Number(data.physical) || 0);
        setMental(Number(data.mental) || 0);
        setSleepQuality(Number(data.sleep_quality) || 0);
        setPulse(data.pulse != null ? String(data.pulse) : "");
        setSleepDuration(data.sleep_duration || "");
        setComment(data.comment || "");
      } catch (err) {
        console.error("Ошибка загрузки данных дня:", err);
      }
    };
    fetchDailyInfo();
  }, [selectedDate, API_URL]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const body = {
        date: selectedDate.format("YYYY-MM-DD"),
        mainParam,
        physical,
        mental,
        sleepQuality,
        pulse: pulse ? Number(pulse) : null,
        sleepDuration: sleepDuration || null,
        comment: comment || null,
      };

      const response = await fetch(`${API_URL}/api/daily-information`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Ошибка при сохранении");
      }

      alert("Данные успешно сохранены ✅");
    } catch (err) {
      alert(`Ошибка ❌: ${err.message}`);
    }
  };

  const prevDay = () => setSelectedDate(selectedDate.subtract(1, "day"));
  const nextDay = () => setSelectedDate(selectedDate.add(1, "day"));

  const formattedFixedDate = dayjs().format("D MMMM").replace(/^./, (c) =>
    c.toUpperCase()
  );
  const formattedDate = selectedDate
    .format("dddd, DD MMMM")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 py-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Шапка */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/profile.jpg"
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold">{name}</h1>
          <p className="text-xs text-gray-400">{formattedFixedDate}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => navigate("/profile")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs"
            >
              Тренировки
            </button>
            <button
              onClick={() => navigate("/profile/settings")}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Дата */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prevDay} className="p-2 rounded bg-[#1f1f22]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">{formattedDate}</span>
          <button onClick={nextDay} className="p-2 rounded bg-[#1f1f22]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Основные параметры */}
        <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-3">
          <h2 className="text-lg font-semibold">Основные параметры</h2>
          <div className="grid grid-cols-2 gap-2">
            <SingleSelectButton
              id="skadet"
              label="Травма"
              Icon={AlertTriangle}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-red-600"
            />
            <SingleSelectButton
              id="syk"
              label="Болезнь"
              Icon={Thermometer}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-red-500"
            />
            <SingleSelectButton
              id="paReise"
              label="В пути"
              Icon={Send}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-blue-500"
            />
            <SingleSelectButton
              id="hoydedogn"
              label="Смена пояса"
              Icon={Clock}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-purple-500"
            />
            <SingleSelectButton
              id="fridag"
              label="Выходной"
              Icon={Sun}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-green-500"
            />
            <SingleSelectButton
              id="konkurranse"
              label="Соревнование"
              Icon={Award}
              activeId={mainParam}
              onClick={setMainParam}
              activeColor="bg-yellow-500"
            />
          </div>
        </div>

        {/* Параметры дня */}
        <div className="bg-[#1a1a1d] p-4 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Параметры дня</h2>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm">Физическая готовность</p>
              <TenButtons value={physical} onChange={setPhysical} Icon={User} />
            </div>
            <div>
              <p className="mb-1 text-sm">Ментальная готовность</p>
              <TenButtons value={mental} onChange={setMental} Icon={Brain} />
            </div>
            <div>
              <p className="mb-1 text-sm">Пульс (уд/мин)</p>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm"
              />
            </div>
            <div>
              <p className="mb-1 text-sm">Качество сна</p>
              <TenButtons
                value={sleepQuality}
                onChange={setSleepQuality}
                Icon={Moon}
              />
            </div>
            <div>
              <p className="mb-1 text-sm">Продолжительность сна</p>
              <input
                type="text"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm"
              />
            </div>
            <div>
              <p className="mb-1 text-sm">Комментарии</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 h-20 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Кнопка сохранения (фиксируем снизу) */}
        <div className="sticky bottom-3">
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
