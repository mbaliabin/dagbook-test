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
  <div className="flex flex-wrap gap-5">
    {[...Array(10)].map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i + 1)}
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
    className={`px-4 py-3 rounded-xl flex items-center space-x-2 transition ${
      activeId === id ? activeColor : "bg-gray-700"
    }`}
  >
    <Icon
      className="w-6 h-6"
      fill={activeId === id ? "#fff" : "none"}
      stroke="#fff"
      strokeWidth={2}
    />
    <span>{label}</span>
  </button>
);

export default function DailyParameters() {
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          // Сброс полей при отсутствии данных
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
    } catch (err: any) {
      console.error("Ошибка сохранения:", err);
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
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Верхний блок с меню, аватаром и кнопками */}
        <div className="space-y-4">
          {/* Верхнее меню */}
          <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl">
            {[
              { label: "Главная", icon: Timer, path: "/daily" },
              { label: "Тренировки", icon: BarChart3, path: "/profile" },
              { label: "Планирование", icon: ClipboardList, path: "/planning" },
              { label: "Статистика", icon: CalendarDays, path: "/statistics" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.path === "/daily" && location.pathname === "/daily") ||
                (item.path === "/profile" && location.pathname === "/profile") ||
                (item.path !== "/daily" && item.path !== "/profile" && location.pathname === item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center text-sm transition-colors ${
                    isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Аватар, имя, выбор даты и кнопки */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src="/profile.jpg"
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{name || "Пользователь"}</h1>
                <p className="text-sm text-gray-400">{dayjs().format("D MMMM")}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Выбор даты */}
              <div className="flex items-center gap-1">
                <button
                  onClick={prevDay}
                  className="flex items-center justify-center text-sm text-gray-300 bg-[#1f1f22] px-2 py-1 rounded hover:bg-[#2a2a2d] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-3 py-1 rounded bg-[#1f1f22] text-white text-sm flex items-center justify-center cursor-pointer select-none">
                  {formattedDate}
                </div>

                <button
                  onClick={nextDay}
                  className="flex items-center justify-center text-sm text-gray-300 bg-[#1f1f22] px-2 py-1 rounded hover:bg-[#2a2a2d] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Кнопки Настройка профиля и Выйти */}
              <button
                onClick={() => navigate("/profile/settings")}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" /> Настройка профиля
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" /> Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Основные параметры */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-white">Основные параметры</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-white">Параметры дня</h2>

          <div className="space-y-6">
            <div>
              <p className="mb-2">Физическая готовность</p>
              <TenButtons value={physical} onChange={setPhysical} Icon={User} />
            </div>
            <div>
              <p className="mb-2">Ментальная готовность</p>
              <TenButtons value={mental} onChange={setMental} Icon={Brain} />
            </div>
            <div>
              <p className="mb-2">Пульс (уд/мин)</p>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="например, 60"
                className="w-full p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white"
              />
            </div>
            <div>
              <p className="mb-2">Качество сна</p>
              <TenButtons value={sleepQuality} onChange={setSleepQuality} Icon={Moon} />
            </div>
            <div>
              <p className="mb-2">Продолжительность сна (ч:мин)</p>
              <input
                type="text"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                placeholder="например, 07:30"
                className="w-full p-3 rounded-xl bg-[#0e0e10] border border-gray-700 text-white"
              />
            </div>
            <div>
              <p className="mb-2">Комментарии</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напишите здесь..."
                className="w-full p-3 h-24 rounded-xl bg-[#0e0e10] border border-gray-700 text-white resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
