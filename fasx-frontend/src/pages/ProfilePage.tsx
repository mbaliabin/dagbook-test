import React, { useEffect, useState, useCallback } from 'react';
import {
  Timer,
  MapPin,
  Zap,
  Target,
  Plus,
  LogOut,
  Calendar,
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import IntensityZones from '../components/IntensityZones';
import TrainingLoadChart from "../components/TrainingLoadChart";
import WeeklySessions from "../components/WeeklySessions";
import RecentWorkouts from "../components/RecentWorkouts";
import ActivityTable from "../components/ActivityTable";
import AddWorkoutModal from "../components/AddWorkoutModal";
import { getUserProfile } from "../api/getUserProfile";
import TopSessions from "../components/TopSessions";

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

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date } | null>({
    startDate: dayjs().startOf('isoWeek').toDate(),
    endDate: dayjs().endOf('isoWeek').toDate()
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка загрузки тренировок");
      const data: Workout[] = await res.json();
      setWorkouts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkouts(false);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setName(data.name || "Пользователь");
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleAddWorkout = (w: Workout) => setWorkouts(prev => [w, ...prev]);
  const handleDeleteWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = dayjs(w.date);
    if (dateRange) {
      const start = dayjs(dateRange.startDate).startOf('day');
      const end = dayjs(dateRange.endDate).endOf('day');
      return workoutDate.isBetween(start, end, null, '[]');
    }
    return workoutDate.isSame(selectedMonth, 'month');
  });

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const totalTimeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;

  const intensiveSessions = filteredWorkouts.filter(w => {
    const zones = [
      w.zone1Min || 0,
      w.zone2Min || 0,
      w.zone3Min || 0,
      w.zone4Min || 0,
      w.zone5Min || 0
    ];
    const maxZone = zones.indexOf(Math.max(...zones)) + 1;
    return [3, 4, 5].includes(maxZone);
  }).length;

  const menuItems = [
    { label: "Главная", icon: Home, path: "/" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white px-4 py-6 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-white">{loadingProfile ? 'Загрузка...' : name}</h1>
              <p className="text-sm text-white">
                {!dateRange
                  ? selectedMonth.format('MMMM YYYY')
                  : `${dayjs(dateRange.startDate).format('DD MMM YYYY')} — ${dayjs(dateRange.endDate).format('DD MMM YYYY')}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <LogOut className="w-4 h-4 mr-1" /> Выйти
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center"><Timer className="w-4 h-4 mr-1" /> Total Training</p>
            <h2 className="text-xl font-semibold">{totalTimeStr}</h2>
            <p className="text-xs text-gray-500">{filteredWorkouts.length} Sessions</p>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Distance</p>
            <h2 className="text-xl font-semibold">{totalDistance.toFixed(1)} km</h2>
            <p className="text-xs text-gray-500">{filteredWorkouts.filter(w => w.distance).length} Sessions</p>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center"><Zap className="w-4 h-4 mr-1" /> Intensive</p>
            <h2 className="text-xl font-semibold">{intensiveSessions}</h2>
          </div>
          <div className="bg-[#1a1a1d] p-4 rounded-xl">
            <p className="text-sm text-gray-400 flex items-center"><Target className="w-4 h-4 mr-1" /> Specific</p>
            <h2 className="text-xl font-semibold">1</h2>
          </div>
        </div>

        {/* Графики и таблицы */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TrainingLoadChart workouts={filteredWorkouts} />
            <IntensityZones workouts={filteredWorkouts} />
          </div>
          <div className="space-y-6">
            <TopSessions workouts={filteredWorkouts} />
            <ActivityTable workouts={filteredWorkouts} />
          </div>
        </div>

        {/* Список тренировок */}
        <div>
          {loadingWorkouts ? <p className="text-gray-400">Загрузка тренировок...</p> :
            <RecentWorkouts workouts={filteredWorkouts} onDeleteWorkout={handleDeleteWorkout} onUpdateWorkout={fetchWorkouts} />}
        </div>
      </div>

      {/* Нижнее меню */}
      <div className="bg-[#1a1a1d] py-2 mt-4 rounded-t-xl w-full max-w-7xl mx-auto flex justify-around">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center text-xs ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Модалка */}
      <AddWorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorkout={handleAddWorkout} />
    </div>
  );
}
