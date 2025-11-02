import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  LogOut,
  Plus,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProfilePage() {
  const [period, setPeriod] = useState("week");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: "",
    end: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const name = "Иван Петров";

  const data = [
    { name: "Пн", I1: 10, I2: 15, I3: 30, I4: 10, I5: 5 },
    { name: "Вт", I1: 20, I2: 10, I3: 25, I4: 15, I5: 10 },
    { name: "Ср", I1: 15, I2: 25, I3: 20, I4: 10, I5: 5 },
    { name: "Чт", I1: 25, I2: 20, I3: 15, I4: 10, I5: 10 },
    { name: "Пт", I1: 10, I2: 20, I3: 30, I4: 20, I5: 10 },
    { name: "Сб", I1: 15, I2: 10, I3: 25, I4: 15, I5: 10 },
    { name: "Вс", I1: 20, I2: 15, I3: 10, I4: 5, I5: 5 },
  ];

  const enduranceTable = [
    {
      zone: "I1",
      jan: 120,
      feb: 90,
      mar: 150,
      apr: 110,
      may: 140,
      jun: 130,
      jul: 100,
      aug: 150,
      sep: 90,
      oct: 120,
      nov: 140,
      dec: 160,
      total: 1500,
    },
    {
      zone: "I2",
      jan: 80,
      feb: 60,
      mar: 100,
      apr: 70,
      may: 90,
      jun: 110,
      jul: 100,
      aug: 120,
      sep: 100,
      oct: 90,
      nov: 110,
      dec: 130,
      total: 1160,
    },
  ];

  const activityTable = [
    {
      type: "Бег",
      jan: 320,
      feb: 280,
      mar: 360,
      apr: 300,
      may: 340,
      jun: 370,
      jul: 400,
      aug: 390,
      sep: 330,
      oct: 310,
      nov: 300,
      dec: 350,
      total: 4150,
    },
    {
      type: "Лыжи",
      jan: 200,
      feb: 180,
      mar: 220,
      apr: 100,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 50,
      oct: 120,
      nov: 160,
      dec: 210,
      total: 1240,
    },
  ];

  const handleLogout = () => {
    console.log("Выход из системы");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Переключатель периода */}
        <div className="flex justify-center space-x-2">
          {["year", "month", "week"].map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
              onClick={() => setPeriod(p)}
            >
              {p === "year"
                ? "Год"
                : p === "month"
                ? "Месяц"
                : p === "week"
                ? "Неделя"
                : ""}
            </button>
          ))}

          <button
            className={`px-3 py-1 rounded ${
              period === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
            onClick={() => {
              setPeriod("custom");
              setIsCalendarOpen(true);
            }}
          >
            Произвольный период
          </button>
        </div>

        {/* Календарь выбора произвольного периода */}
        {isCalendarOpen && (
          <div className="bg-[#1a1a1a] p-4 rounded-xl mt-4 space-y-3">
            <h3 className="text-lg font-semibold text-white">
              Выберите произвольный период
            </h3>
            <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
              <div>
                <label className="text-sm text-gray-400">Начало</label>
                <input
                  type="date"
                  className="bg-gray-800 text-gray-200 px-2 py-1 rounded w-full"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Конец</label>
                <input
                  type="date"
                  className="bg-gray-800 text-gray-200 px-2 py-1 rounded w-full"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                onClick={() => setIsCalendarOpen(false)}
              >
                Применить
              </button>
            </div>
          </div>
        )}

        {/* Диаграмма зон интенсивности */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Зоны интенсивности
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "none",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [`${value} мин`, name]}
              />
              <Legend />
              <Bar dataKey="I1" stackId="a" fill="#2e8b57" />
              <Bar dataKey="I2" stackId="a" fill="#3cb371" />
              <Bar dataKey="I3" stackId="a" fill="#ffd700" />
              <Bar dataKey="I4" stackId="a" fill="#ff8c00" />
              <Bar dataKey="I5" stackId="a" fill="#ff4500" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица выносливости */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Таблица выносливости
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-2 px-2">Зона</th>
                  {[
                    "Янв",
                    "Фев",
                    "Мар",
                    "Апр",
                    "Май",
                    "Июн",
                    "Июл",
                    "Авг",
                    "Сен",
                    "Окт",
                    "Ноя",
                    "Дек",
                    "Всего",
                  ].map((m) => (
                    <th key={m} className="text-right py-2 px-2">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enduranceTable.map((row) => (
                  <tr
                    key={row.zone}
                    className="border-b border-gray-800 hover:bg-[#222]"
                  >
                    <td className="py-2 px-2">{row.zone}</td>
                    {Object.values(row)
                      .slice(1)
                      .map((v, i) => (
                        <td key={i} className="text-right py-2 px-2">
                          {v}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Таблица форм активности */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow mb-10">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Формы активности
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-2 px-2">Тип активности</th>
                  {[
                    "Янв",
                    "Фев",
                    "Мар",
                    "Апр",
                    "Май",
                    "Июн",
                    "Июл",
                    "Авг",
                    "Сен",
                    "Окт",
                    "Ноя",
                    "Дек",
                    "Всего",
                  ].map((m) => (
                    <th key={m} className="text-right py-2 px-2">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityTable.map((row) => (
                  <tr
                    key={row.type}
                    className="border-b border-gray-800 hover:bg-[#222]"
                  >
                    <td className="py-2 px-2">{row.type}</td>
                    {Object.values(row)
                      .slice(1)
                      .map((v, i) => (
                        <td key={i} className="text-right py-2 px-2">
                          {v}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
