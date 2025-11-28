import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
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
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "react-date-range";
import { ru } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [startPeriod, setStartPeriod] = React.useState(
    dayjs().startOf("month").toDate()
  );
  const [endPeriod, setEndPeriod] = React.useState(dayjs().endOf("month").toDate());
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  // Totals
  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
    distance: 1240,
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  // Данные таблиц
  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [80, 70, 90, 50, 75, 65, 70] },
    { zone: "I2", color: "#22d3ee", months: [40, 50, 45, 35, 50, 40, 45] },
    { zone: "I3", color: "#facc15", months: [15, 10, 20, 5, 15, 10, 10] },
    { zone: "I4", color: "#fb923c", months: [5, 10, 5, 0, 5, 5, 5] },
    { zone: "I5", color: "#ef4444", months: [0, 0, 5, 0, 0, 0, 0] },
  ];

  const movementTypes = [
    { type: "Лыжи, к. ст.", months: [70, 50, 60, 45, 65, 75, 80] },
    { type: "Лыжи, кл. ст.", months: [60, 40, 50, 35, 55, 60, 65] },
    { type: "Лыжероллеры, к. ст", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Лыжероллеры, кл. ст.", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Бег", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Силовая", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Велосипед", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Другое", months: [40, 35, 50, 30, 45, 30, 40] },
  ];

  // Данные для диаграммы дистанций
  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  const distanceColors: Record<string,string> = {
    "Лыжи, к. ст.": "#4ade80",
    "Лыжи, кл. ст.": "#22d3ee",
    "Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c",
    "Бег": "#ef4444",
    "Велосипед": "#3b82f6",
  };

  const startMonth = dayjs(startPeriod).month();
  const endMonth = dayjs(endPeriod).month();
  const filteredMonths = months.slice(startMonth, endMonth + 1);

  const filteredEnduranceZones = enduranceZones.map(z => ({
    ...z,
    months: z.months.slice(0, filteredMonths.length),
    total: z.months.slice(0, filteredMonths.length).reduce((a,b)=>a+b,0)
  }));

  const filteredMovementTypes = movementTypes.map(m => ({
    ...m,
    months: m.months.slice(0, filteredMonths.length),
    total: m.months.slice(0, filteredMonths.length).reduce((a,b)=>a+b,0)
  }));

  const filteredDistanceTypes = distanceByType.map(d => ({
    ...d,
    months: d.distance.slice(0, filteredMonths.length),
    total: d.distance.slice(0, filteredMonths.length).reduce((a,b)=>a+b,0)
  }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const setWeek = () => {
    setStartPeriod(dayjs().startOf('isoWeek').toDate());
    setEndPeriod(dayjs().endOf('isoWeek').toDate());
  };
  const setMonth = () => {
    setStartPeriod(dayjs().startOf('month').toDate());
    setEndPeriod(dayjs().endOf('month').toDate());
  };
  const setYear = () => {
    setStartPeriod(dayjs().startOf('year').toDate());
    setEndPeriod(dayjs().endOf('year').toDate());
  };

  const formatTime = (val:number) => {
    const h = Math.floor(val/60);
    const m = val%60;
    return `${h}:${m.toString().padStart(2,'0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-white">{name}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <Plus className="w-4 h-4 mr-1"/> Добавить тренировку
            </button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center">
              <LogOut className="w-4 h-4 mr-1"/> Выйти
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname===item.path;
            return (
              <button key={item.path} onClick={()=>navigate(item.path)}
                className={`flex flex-col items-center text-sm transition-colors ${isActive?"text-blue-500":"text-gray-400 hover:text-white"}`}>
                <Icon className="w-6 h-6"/>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Period buttons */}
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <select value={reportType} onChange={e=>setReportType(e.target.value)} className="bg-[#1f1f22] text-gray-200 px-3 py-1 rounded text-sm">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>
          <button onClick={setWeek} className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={setMonth} className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={setYear} className="text-sm px-3 py-1 rounded border border-gray-600 bg-[#1f1f22] text-gray-300 hover:bg-[#2a2a2d]">Год</button>
        </div>

        {/* Totals */}
        <div className="flex flex-wrap gap-10 text-sm mb-6">
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
          <div>
            <p className="text-gray-400">Общее расстояние (км)</p>
            <p className="text-xl text-gray-100">{totals.distance}</p>
          </div>
        </div>

        {/* Endurance chart */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredMonths.map((month,i)=>{
                const obj:any = { month };
                filteredEnduranceZones.forEach(z => obj[z.zone] = z.months[i]);
                return obj;
              })}>
                <XAxis dataKey="month" tick={{ fill: "#888", fontSize:12 }}/>
                <Tooltip content={({payload}:any)=>{
                  if(payload && payload.length){
                    return <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-xs text-gray-300">
                      {payload.map((p:any)=><div key={p.dataKey}><span className="inline-block w-3 h-3 mr-1 rounded-full" style={{backgroundColor:p.fill}}></span>{p.dataKey}: {formatTime(p.value)}</div>)}
                    </div>
                  }
                  return null;
                }}/>
                {filteredEnduranceZones.map(z=><Bar key={z.zone} dataKey={z.zone} stackId="a" fill={z.color} radius={[4,4,0,0]}/>)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Endurance table */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Выносливость</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Зона</th>
                {filteredMonths.map(m=><th key={m} className="p-3 font-medium text-center">{m}</th>)}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnduranceZones.map(z=>(
                <tr key={z.zone} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 flex items-center gap-2 sticky left-0 bg-[#1a1a1a]">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor:z.color}}></div>{z.zone}
                  </td>
                  {z.months.map((val,i)=><td key={i} className="p-3 text-center">{val>0?formatTime(val):"-"}</td>)}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(z.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Movement table */}
        <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">Форма активности</h2>
          <table className="w-full min-w-[900px] text-sm border-collapse">
            <thead>
              <tr className="bg-[#222] text-gray-400 text-left">
                <th className="p-3 font-medium sticky left-0 bg-[#222]">Тип активности</th>
                {filteredMonths.map(m=><th key={m} className="p-3 font-medium text-center">{m}</th>)}
                <th className="p-3 font-medium text-center bg-[#1f1f1f]">Всего</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovementTypes.map(m=>(
                <tr key={m.type} className="border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <td className="p-3 sticky left-0 bg-[#1a1a1a]">{m.type}</td>
                  {m.months.map((val,i)=><td key={i} className="p-3 text-center">{val>0?formatTime(val):"-"}</td>)}
                  <td className="p-3 text-center font-medium bg-[#1f1f1f]">{formatTime(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Distance chart */}
        {reportType==="Общая дистанция" && (
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам тренировок</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonths.map((month,i)=>{
                  const obj:any={month};
                  filteredDistanceTypes.forEach(d=>obj[d.type]=d.months[i]);
                  return obj;
                })}>
                  <XAxis dataKey="month" tick={{fill:"#888", fontSize:12}}/>
                  <Tooltip content={({payload}:any)=>{
                    if(payload && payload.length){
                      return <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-xs text-gray-300">
                        {payload.map((p:any)=><div key={p.dataKey}><span className="inline-block w-3 h-3 mr-1 rounded-full" style={{backgroundColor:p.fill}}></span>{p.dataKey}: {p.value} км</div>)}
                      </div>
                    }
                    return null;
                  }}/>
                  {filteredDistanceTypes.map(d=><Bar key={d.type} dataKey={d.type} stackId="b" fill={distanceColors[d.type]} radius={[4,4,0,0]}/>)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
