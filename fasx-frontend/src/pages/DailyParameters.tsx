import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Timer,
  BarChart3,
  ClipboardList,
  CalendarDays,
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
  <div className="flex flex-wrap gap-3">
    {[...Array(10)].map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i + 1)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
          i < value ? "bg-blue-500 shadow-md scale-105" : "bg-gray-700"
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
    className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition ${
      activeId === id ? activeColor : "bg-gray-700"
    }`}
  >
    <Icon
      className="w-5 h-5"
      fill={activeId === id ? "#fff" : "none"}
      stroke="#fff"
      strokeWidth={2}
    />
    <span className="text-xs">{label}</span>
  </button>
);

export default function DailyParametersMobile() {
  const navigate = useNavigate();
  const location = useLocation();
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
        console.error(err);
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
    } catch (err: any) {
      console.error(err);
      alert(`Ошибка при сохранении ❌: ${err.message}`);
    }
  };

  const prevDay = () => setSelectedDate(selectedDate.subtract(1, "day"));
  const nextDay = () => setSelectedDate(selectedDate.add(1, "day"));

  const formattedDate = selectedDate
    .format("dddd, DD MMMM")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-3 pt-3 pb-24">
      {/* Аватар и имя */}
      <div className="flex flex-col mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/profile.jpg" alt="Avatar" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-base font-bold">{name || "Пользователь"}</h1>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => navigate("/profile/settings")}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" />
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
            </button>
          </div>
        </div>

        {/* Дата с стрелками */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <button
            onClick={prevDay}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 bg-gray-800 rounded text-sm">{formattedDate}</div>
          <button
            onClick={nextDay}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Основные параметры */}
      <div className="bg-[#1a1a1d] p-3 rounded-xl shadow-md mb-3">
        <h2 className="text-base font-semibold mb-2">Основные параметры</h2>
        <div className="grid grid-cols-3 gap-1">
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
            label="Смена часового пояса"
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
      <div className="bg-[#1a1a1d] p-3 rounded-xl shadow-md space-y-3">
        <div>
          <p className="mb-1">Физическая готовность</p>
          <TenButtons value={physical} onChange={setPhysical} Icon={User} />
        </div>
        <div>
          <p className="mb-1">Ментальная готовность</p>
          <TenButtons value={mental} onChange={setMental} Icon={Brain} />
        </div>
        <div>
          <p className="mb-1">Качество сна</p>
          <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
        </div>
        <div>
          <p className="mb-1">Пульс (уд/мин)</p>
          <input
            type="number"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            placeholder="например, 60"
            className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm"
          />
        </div>
        <div>
          <p className="mb-1">Продолжительность сна (ч:мин)</p>
          <input
            type="text"
            value={sleepDuration}
            onChange={(e) => setSleepDuration(e.target.value)}
            placeholder="например, 07:30"
            className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm"
          />
        </div>
        <div>
          <p className="mb-1">Комментарии</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите здесь..."
            className="w-full p-2 rounded-lg bg-[#0e0e10] border border-gray-700 text-white text-sm resize-none h-20"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}