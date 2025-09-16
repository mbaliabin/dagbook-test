import React, { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import Calendar from "../components/Calendar";
import { getUserProfile } from "../api/getUserProfile";

export default function CalendarPage() {
  const [name, setName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  const selectedMonth = dayjs(); // всегда текущий месяц

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
      } catch (err) {
        console.error("Ошибка профиля:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-[#0e0e10] text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/profile.jpg"
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">
                {loadingProfile ? "Загрузка..." : name}
              </h1>
              <p className="text-gray-400">{selectedMonth.format("MMMM YYYY")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-1 rounded text-sm flex items-center bg-gray-700 hover:bg-gray-600 text-white"
            >
              Назад в профиль
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded text-sm flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Календарь */}
        <Calendar />
      </div>
    </div>
  );
}

