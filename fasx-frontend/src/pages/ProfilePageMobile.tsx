import React, { useEffect, useState, useCallback } from "react";
import {
  Timer,
  MapPin,
  Zap,
  Plus,
  LogOut,
  Calendar,
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";

import TrainingLoadChartMobile from "../components/TrainingLoadChartMobile";
import IntensityZonesMobile from "../components/IntensityZonesMobile";
import RecentWorkoutsMobile from "../components/RecentWorkoutsMobile";
import AddWorkoutModalMobile from "../components/AddWorkoutModalMobile";
import CalendarModalMobile from "../components/CalendarModalMobile";
import { getUserProfile } from "../api/getUserProfile";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  type: string;
  distance?: number | null;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

export default function ProfilePageMobile() {
  const [name, setName] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>({
    startDate: dayjs().startOf("isoWeek").toDate(),
    endDate: dayjs().endOf("isoWeek").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки тренировок");
      const data: Workout[] = await res.json();
      setWorkouts(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

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
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleAddWorkout = (w: Workout) => setWorkouts(prev => [w, ...prev]);
  const handleDeleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = dayjs(w.date);
    if (dateRange) {
      const start = dayjs(dateRange.startDate).startOf("day");
      const end = dayjs(dateRange.endDate).endOf("day");
      return workoutDate.isBetween(start, end, null, "[]");
    }
    return workoutDate.isSame(selectedMonth, "month");
  });

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const totalTimeStr = `${hours}:${minutes.toString().padStart(2, "0")}`;

  const intensiveSessions = filteredWorkouts.filter(w => {
    const zones = [
      w.zone1Min || 0,
      w.zone2Min || 0,
      w.zone3Min || 0,
      w.zone4Min || 0,
      w.zone5Min || 0,
    ];
    const maxZone = zones.indexOf(Math.max(...zones)) + 1;
    return [3, 4, 5].includes(maxZone);
  }).length;

  const onPrevMonth = () => {
    setSelectedMonth(prev => prev.subtract(1, "month"));
    setDateRange(null);
  };
  const onNextMonth = () => {
    setSelectedMonth(prev => prev.add(1, "month"));
    setDateRange(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-4 flex flex-col gap-4 pb-20">
      {/* pb-20 чтобы контент не перекрывался нижней навигацией */}

      {/* Header профиля */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/profile.jpg" alt="Avatar" className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="text-base font-semibold">{name || "Загрузка..."}</h2>
            <p className="text-xs text-gray-400">
              {!dateRange
                ? selectedMonth.format("MMMM YYYY")
                : `${dayjs(dateRange.startDate).format("DD MMM")} — ${dayjs(dateRange.endDate).format("DD MMM")}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-3 py-1 rounded flex items-center text-sm">
            <Plus className="w-4 h-4 mr-1" /> Добавить
          </button>
          <button onClick={handleLogout} className="bg-blue-600 px-3 py-1 rounded flex items-center text-sm">
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </button>
        </div>
      </div>

      {/* Выбор периода */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onPrevMonth} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-300">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          className="px-3 py-1 rounded bg-[#1f1f22] text-gray-300 cursor-pointer text-xs"
          onClick={() => setDateRange(null)}
        >
          {selectedMonth.format("MMMM YYYY")}
        </div>
        <button onClick={onNextMonth} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-300">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            setDateRange({
              startDate: dayjs().startOf("isoWeek").toDate(),
              endDate: dayjs().endOf("isoWeek").toDate(),
            })
          }
          className="px-3 py-1 rounded bg-[#1f1f22] text-gray-300 text-xs"
        >
          Текущая неделя
        </button>
      </div>

      {/* Модалка кастомного календаря */}
      <CalendarModalMobile
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        onSelectRange={(range) => {
          setDateRange(range);
          setShowDateRangePicker(false);
        }}
        initialRange={dateRange || undefined}
      />

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1a1d] p-3 rounded-xl flex flex-col items-center">
          <Timer className="w-6 h-6 text-gray-400" />
          <span className="text-sm mt-1">{totalTimeStr}</span>
          <span className="text-xs text-gray-500">Время</span>
        </div>
        <div className="bg-[#1a1a1d] p-3 rounded-xl flex flex-col items-center">
          <MapPin className="w-6 h-6 text-gray-400" />
          <span className="text-sm mt-1">{totalDistance.toFixed(1)} км</span>
          <span className="text-xs text-gray-500">Дистанция</span>
        </div>
        <div className="bg-[#1a1a1d] p-3 rounded-xl flex flex-col items-center">
          <Zap className="w-6 h-6 text-gray-400" />
          <span className="text-sm mt-1">{intensiveSessions}</span>
          <span className="text-xs text-gray-500">Интенсивные</span>
        </div>
      </div>

      {/* График нагрузки и зоны интенсивности */}
      <TrainingLoadChartMobile workouts={filteredWorkouts} />
      <IntensityZonesMobile workouts={filteredWorkouts} />

      {/* Последние тренировки */}
      <RecentWorkoutsMobile
        workouts={filteredWorkouts}
        onDeleteWorkout={handleDeleteWorkout}
        onUpdateWorkout={fetchWorkouts}
      />

      {/* Модалка добавления тренировки */}
      <AddWorkoutModalMobile
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWorkout={handleAddWorkout}
      />

      {/* Нижняя панель навигации */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1d] flex justify-around py-2 border-t border-gray-700">
        <div className="flex flex-col items-center text-blue-400">
          <Home size={20} />
          <span className="text-[10px]">Главная</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <BarChart3 size={20} />
          <span className="text-[10px]">Тренировка</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <ClipboardList size={20} />
          <span className="text-[10px]">Планирование</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <CalendarDays size={20} />
          <span className="text-[10px]">Статистика</span>
        </div>
      </div>
    </div>
  );
}
