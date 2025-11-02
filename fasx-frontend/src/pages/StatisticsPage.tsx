import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  Timer,
  BarChart3,
  ClipboardList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";

import { TenButtons, SingleSelectButton } from "../components/DailyParametersComponents"; // Если вынесем эти кнопки
import { getUserProfile } from "../api/getUserProfile";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = React.useState("");

  React.useEffect(() => {
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

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек",
  ];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2], total: 105 },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1], total: 47 },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1], total: 12 },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0], total: 7 },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0], total: 3 },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2], total: 20 },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1], total: 13 },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0], total: 35 },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0], total: 39 },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0], total: 16 },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Верхний блок с аватаром и кнопками */}
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
            <button
              onClick={() => navigate("/profile/settings")}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" /> Настройка профиля
            </button>
            <button
              onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Верхнее меню */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl">
          {[
            { label: "Главная", icon: Timer, path: "/daily" },
            { label: "Тренировки", icon: BarChart3, path: "/profile" },
            { label: "Планирование", icon: ClipboardList, path: "/planning" },
            { label: "Статистика", icon: CalendarDays, path: "/statistics" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
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

        {/* TOTALSUM */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">
            TOTALSUM
          </h1>

          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div>
              <p className="text-gray-400">Тренировочные дни</p>
              <p className="text-xl text-gray-100">{totals.trainingDays}</p>
            </div>
            <div>
              <p className="text-gray-400">Сессий</p>
              <p className="text-xl text-gray-100">{totals.sessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Время</p>
              <p className="text-xl text-gray-100">{totals.time}</p>
            </div>
          </div>
        </div>

        {/* Таблицы и диаграммы */}
        <div className="bg-[#1a1a1a] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months.map((month, i) => {
                  const data: any = { month };
                  enduranceZones.forEach((zone) => (data[zone.zone] = zone.months[i]));
                  return data;
                })}
                barSize={35}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
                          {payload.map((p: any) => (
                            <p key={p.dataKey} className="mt-1">
                              <span
                                className="inline-block w-3 h-3 mr-1 rounded-full"
                                style={{ backgroundColor: p.fill }}
                              ></span>
                              {p.dataKey}: {formatTime(p.value)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {enduranceZones.map((zone) => (
                  <Bar key={zone.zone} dataKey={zone.zone} stackId="a" fill={zone.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Таблицы по зонам и типам */}
        {/* ... здесь можно вставить твою верстку таблиц, как была ранее ... */}

      </div>
    </div>
  );
}
