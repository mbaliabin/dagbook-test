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

const TenButtons = ({
  value,
  onChange,
  Icon,
}: {
  value: number;
  onChange: (val: number) => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}) => (
  <div className="flex flex-wrap gap-2">
    {[...Array(10)].map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i + 1)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
          i < value ? "bg-blue-500 shadow scale-105" : "bg-gray-700"
        }`}
      >
        <Icon
          className="w-4 h-4"
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
}: {
  id: string;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  activeId: string | null;
  onClick: (id: string) => void;
  activeColor: string;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-xs transition ${
      activeId === id ? activeColor : "bg-gray-700"
    }`}
  >
    <Icon
      className="w-4 h-4"
      fill={activeId === id ? "#fff" : "none"}
      stroke="#fff"
      strokeWidth={2}
    />
    <span>{label}</span>
  </button>
);

export default function DailyParametersMobile() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [mainParam, setMainParam] = useState<string | null>(null);
  const [physical, setPhysical] = useState(0);
  const [mental, setMental] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [pulse, setPulse] = useState<string>("");
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // --- Загрузка профиля пользователя ---
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

  // --- Загрузка данных выбранного дня ---
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
          // Если данных нет, сбросить поля на значения по умолчанию
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
        // На случай ошибки также сбросить поля
        setMainParam(null);
        setPhysical(0);
        setMental(0);
        setSleepQuality(0);
        setPulse("");
        setSleepDuration("");
        setComment("");
      }
    };
    fetchDailyInfo();
  }, [selectedDate, API_URL]);

  // --- Сохранение ---
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const body = {
        date: selectedDate.format("YYYY-MM-DD"),
        main_param: mainParam,
        physical,
        mental,
        sleep_quality: sleepQuality,
        pulse: pulse ? Number(pulse) : null,
        sleep_duration: sleepDuration || null,
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

      if (!response.ok) throw new Error("Ошибка при сохранении");

      alert("Данные сохранены ✅");
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const prevDay = () => setSelectedDate(selectedDate.subtract(1, "day"));
  const nextDay = () => setSelectedDate(selectedDate.add(1, "day"));

  const formattedFixedDate = dayjs().format("D MMMM").replace(/^./, (c) =>
    c.toUpperCase()
  );
  const formattedDate = selectedDate
    .format("DD MMMM YYYY")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/profile.jpg" alt="Avatar" className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="text-base font-semibold">{name}</h2>
            <p className="text-xs text-gray-400">{formattedFixedDate}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 px-3 py-1 rounded text-xs"
          >
            Тренировки
          </button>
          <button
            onClick={() => navigate("/profile/settings")}
            className="bg-gray-700 p-2 rounded"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Дата */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <button onClick={prevDay} className="p-1 rounded bg-[#1f1f22]">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-gray-300">{formattedDate}</span>
        <button onClick={nextDay} className="p-1 rounded bg-[#1f1f22]">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Основные параметры */}
      <div className="bg-[#1a1a1d] p-3 rounded-xl space-y-3">
        <h2 className="text-sm font-semibold">Основные параметры</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <SingleSelectButton id="injury" label="Травма" Icon={AlertTriangle} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-600" />
          <SingleSelectButton id="illness" label="Болезнь" Icon={Thermometer} activeId={mainParam} onClick={setMainParam} activeColor="bg-red-500" />
          <SingleSelectButton id="trip" label="В пути" Icon={Send} activeId={mainParam} onClick={setMainParam} activeColor="bg-blue-500" />
          <SingleSelectButton id="timezone" label="Смена час. пояса" Icon={Clock} activeId={mainParam} onClick={setMainParam} activeColor="bg-purple-500" />
          <SingleSelectButton id="rest" label="Выходной" Icon={Sun} activeId={mainParam} onClick={setMainParam} activeColor="bg-green-500" />
          <SingleSelectButton id="competition" label="Соревнование" Icon={Award} activeId={mainParam} onClick={setMainParam} activeColor="bg-yellow-500" />
        </div>
      </div>

      {/* Параметры дня */}
      <div className="bg-[#1a1a1d] p-3 rounded-xl space-y-3">
        <h2 className="text-sm font-semibold">Параметры дня</h2>
        <div className="space-y-3 text-xs">
          <div>
            <p className="mb-1">Физическая готовность</p>
            <TenButtons value={physical} onChange={setPhysical} Icon={User} />
          </div>
          <div>
            <p className="mb-1">Ментальная готовность</p>
            <TenButtons value={mental} onChange={setMental} Icon={Brain} />
          </div>
          <div>
            <p className="mb-1">Пульс (уд/мин)</p>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              placeholder="60"
              className="w-full p-2 rounded bg-[#0e0e10] border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <p className="mb-1">Качество сна</p>
            <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
          </div>
          <div>
            <p className="mb-1">Сон (ч:мин)</p>
            <input
              type="text"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              placeholder="07:30"
              className="w-full p-2 rounded bg-[#0e0e10] border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <p className="mb-1">Комментарий</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Напишите здесь..."
              className="w-full p-2 h-20 rounded bg-[#0e0e10] border border-gray-700 text-white text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 py-2 rounded text-sm"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
