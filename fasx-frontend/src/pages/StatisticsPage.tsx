import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {
  Home,
  BarChart3,
  ClipboardList,
  CalendarDays,
  Plus,
  LogOut,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

dayjs.extend(isBetween);
dayjs.locale("ru");

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // в минутах
  type: string;
  distance?: number | null;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- State ---
  const [name, setName] = useState("Пользователь");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().startOf("isoWeek").toDate(),
    endDate: dayjs().endOf("isoWeek").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // --- Данные для графиков и таблиц ---
  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10, 8, 12, 9, 11, 14, 13, 10, 8, 5, 3, 2] },
    { zone: "I2", color: "#22d3ee", months: [5, 6, 7, 3, 4, 5, 6, 3, 4, 2, 1, 1] },
    { zone: "I3", color: "#facc15", months: [2, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1] },
    { zone: "I4", color: "#fb923c", months: [1, 1, 2, 0, 1, 1, 0, 0, 1, 0, 0, 0] },
    { zone: "I5", color: "#ef4444", months: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0] },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: [4, 5, 3, 0, 0, 0, 0, 0, 1, 2, 3, 2] },
    { type: "Лыжи, классика", months: [3, 4, 2, 0, 0, 0, 0, 0, 0, 1, 2, 1] },
    { type: "Роллеры, классика", months: [0, 0, 0, 3, 5, 6, 7, 5, 4, 3, 2, 0] },
    { type: "Роллеры, скейтинг", months: [0, 0, 0, 2, 6, 7, 8, 6, 5, 3, 2, 0] },
    { type: "Велосипед", months: [0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0] },
  ];

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  // --- Фильтрация тренировок по диапазону ---
  const filteredWorkouts = workouts.filter(w => {
    const workoutDate = dayjs(w.date);
    const start = dayjs(dateRange.startDate).startOf("day");
    const end = dayjs(dateRange.endDate).endOf("day");
    return workoutDate.isBetween(start, end, null, "[]");
  });

  // --- TOTALSUM ---
  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalDistance = filteredWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const intensiveSessions = filteredWorkouts.filter(w => {
    const zones = [w.zone1Min||0, w.zone2Min||0, w.zone3Min||0, w.zone4Min||0, w.zone5Min||0];
    const maxZone = zones.indexOf(Math.max(...zones)) + 1;
    return [3,4,5].includes(maxZone);
  }).length;
  const formatTime = (minutes:number) => `${Math.floor(minutes/60)}:${(minutes%60).toString().padStart(2,"0")}`;

  // --- Кнопки периодов ---
  const setWeek = () => setDateRange({ startDate: dayjs().startOf("isoWeek").toDate(), endDate: dayjs().endOf("isoWeek").toDate() });
  const setMonth = () => setDateRange({ startDate: dayjs().startOf("month").toDate(), endDate: dayjs().endOf("month").toDate() });
  const setYear = () => setDateRange({ startDate: dayjs().startOf("year").toDate(), endDate: dayjs().endOf("year").toDate() });

  const applyDateRange = () => setShowDateRangePicker(false);

  // --- Верхнее меню ---
  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  // --- Моковые данные для графика ---
  const startMonth = dayjs(dateRange.startDate).month();
  const endMonth = dayjs(dateRange.endDate).month();
  const filteredEnduranceZones = enduranceZones.map(zone => ({
    ...zone,
    months: zone.months.slice(startMonth,endMonth+1),
    total: zone.months.slice(startMonth,endMonth+1).reduce((a,b)=>a+b,0)
  }));
  const filteredMonths = months.slice(startMonth,endMonth+1);
  const filteredMovementTypes = movementTypes.map(m => ({
    ...m,
    months: m.months.slice(startMonth,endMonth+1),
    total: m.months.slice(startMonth,endMonth+1).reduce((a,b)=>a+b,0)
  }));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={setWeek} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={setMonth} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={setYear} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={()=>setShowDateRangePicker(prev=>!prev)} className="px-3 py-1 rounded bg-[#1f1f22] hover:bg-[#2a2a2d] flex items-center gap-1">
              <Calendar className="w-4 h-4"/> Произвольный период <ChevronDown className="w-4 h-4"/>
            </button>
            {showDateRangePicker && (
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  ranges={[{ startDate: dateRange.startDate, endDate: dateRange.endDate, key:"selection"}]}
                  onChange={item => setDateRange({ startDate: item.selection.startDate, endDate: item.selection.endDate })}
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="horizontal"
                  rangeColors={["#3b82f6"]}
                  locale={ru}
                  weekStartsOn={1}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button onClick={()=>setShowDateRangePicker(false)} className="px-3 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700">Отмена</button>
                  <button onClick={applyDateRange} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            )}
          </div>
          <button onClick={()=>{localStorage.removeItem("token");navigate("/login")}} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"><LogOut className="w-4 h-4"/> Выйти</button>
        </div>
      </div>

      {/* TOTALSUM */}
      <div className="flex flex-wrap gap-6">
        <div className="bg-[#1a1a1d] p-4 rounded-xl w-40">
          <p className="text-gray-400">Тренировочные дни</p>
          <p className="text-xl">{filteredWorkouts.length}</p>
        </div>
        <div className="bg-[#1a1a1d] p-4 rounded-xl w-40">
          <p className="text-gray-400">Сессий</p>
          <p className="text-xl">{filteredWorkouts.length}</p>
        </div>
        <div className="bg-[#1a1a1d] p-4 rounded-xl w-40">
          <p className="text-gray-400">Время</p>
          <p className="text-xl">{formatTime(totalDuration)}</p>
        </div>
        <div className="bg-[#1a1a1d] p-4 rounded-xl w-40">
          <p className="text-gray-400">Интенсив</p>
          <p className="text-xl">{intensiveSessions}</p>
        </div>
      </div>

      {/* График и таблицы */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Зоны выносливости */}
        <div className="bg-[#1a1a1d] p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredMonths.map((month,i)=>{
                  const d:any={month};
                  filteredEnduranceZones.forEach(zone=>d[zone.zone]=zone.months[i]);
                  return d;
                })}
                barSize={35}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:"#888", fontSize:12 }}/>
                <Tooltip
                  content={({active,payload}:any)=>{
                    if(active && payload && payload.length){
                      return <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded-xl text-xs text-gray-300 shadow-md">
                        {payload.map((p:any)=><p key={p.dataKey} className="mt-1"><span className="inline-block w-3 h-3 mr-1 rounded-full" style={{backgroundColor:p.fill}}></span>{p.dataKey}: {formatTime(p.value)}</p>)}
                      </div>
                    }
                    return null;
                  }}
                />
                {filteredEnduranceZones.map(zone=><Bar key={zone.zone} dataKey={zone.zone} stackId="a" fill={zone.color} radius={[4,4,0,0]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Форма активности */}
        <div className="overflow-x-auto bg-[#1a1a1d] p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2 text-gray-100">Форма активности</h2>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1 border-b border-gray-600">Тип</th>
                {filteredMonths.map(m=><th key={m} className="px-2 py-1 border-b border-gray-600">{m}</th>)}
                <th className="px-2 py-1 border-b border-gray-600">Итого</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map(mt=>(
                <tr key={mt.type}>
                  <td className="px-2 py-1 border-b border-gray-700">{mt.type}</td>
                  {mt.months.map((val,i)=><td key={i} className="px-2 py-1 border-b border-gray-700">{val}</td>)}
                  <td className="px-2 py-1 border-b border-gray-700">{mt.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
