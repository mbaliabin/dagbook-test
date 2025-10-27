import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LogOut } from "lucide-react"; // импорт иконки

type ReportType = "Общее расстояние" | "Общее время" | "Сессии";

export default function StatsPage() {
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
  };

  const [reportType, setReportType] = useState<ReportType>("Общее расстояние");
  const [interval, setInterval] = useState("Год");
  const [name, setName] = useState("Максим");

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Данные и функции должны быть здесь, до return
  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек",
  ];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10, 8, 12, 9, 11, 14, 13, 10, 8, 5, 3, 2], total: 105 },
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

  // Если menuItems нет — просто закомментируй пока
  const menuItems = [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Верхняя плашка */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img src="/profile-avatar.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </button>
        </div>

        {/* Здесь можно вставлять диаграммы, таблицы и т.д. */}
      </div>
    </div>
  );
}
