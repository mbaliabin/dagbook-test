import React, { useRef, useMemo } from "react";
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
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState("year");
  const [dateRange, setDateRange] = React.useState({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const totals = { trainingDays: 83, sessions: 128, time: "178:51", distance: 1240 };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

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
    { type: "Бег", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Велосипед", months: [40, 35, 50, 30, 45, 30, 40] },
  ];

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  const formatTimeSafe = (val) => (typeof val === "number" ? formatTime(val) : val);

  const computeColumns = () => {
    if (periodType === "year") return months;
    if (periodType === "custom") {
      const start = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      const result = [];
      let current = start.startOf("day");
      while (current.isBefore(end) || current.isSame(end, "day")) {
        result.push(current.format("DD MMM"));
        current = current.add(1, "day");
      }
      return result;
    }
    return months;
  };

  const filteredMonths = computeColumns();

  const filteredEnduranceZones = useMemo(() => enduranceZones.map(z => ({ ...z, total: z.months.reduce((a,b)=>a+b,0) })), []);
  const filteredMovementTypes = useMemo(() => movementTypes.map(m => ({ ...m, total: m.months.reduce((a,b)=>a+b,0) })), []);
  const filteredDistanceTypes = useMemo(() => distanceByType.map(d => ({ ...d, total: d.distance.reduce((a,b)=>a+b,0) })), []);

  const scrollRefs = [useRef(null), useRef(null), useRef(null)];
  const handleScroll = (e, index) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => { if(i!==index && ref.current) ref.current.scrollLeft = scrollLeft; });
  };

  const TableSection = ({ table, index }) => {
    const leftColWidth = 200;
    const colWidth = 80;
    const totalColWidth = 80;

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={(e)=>handleScroll(e,index)}>
          <div style={{ minWidth: filteredMonths.length*colWidth+leftColWidth+totalColWidth }}>
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftColWidth }}>Тип / Вид</div>
              {filteredMonths.map((m,i)=><div key={i} className="p-3 text-center flex-none font-medium" style={{width:colWidth}}>{m}</div>)}
              <div className="p-3 text-center font-medium bg-[#1f1f1f] flex-none" style={{width:totalColWidth}}>Всего</div>
            </div>
            <div>
              {table.data.map((row,j)=>(
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{width:leftColWidth}}>{row.param||row.type}</div>
                  {filteredMonths.map((_,k)=>(
                    <div key={k} className="p-3 text-center flex-none" style={{width:colWidth}}>{row.months[k]===0?'':row.months[k]}</div>
                  ))}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{width:totalColWidth}}>{row.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = ()=>{ localStorage.removeItem('token'); navigate('/login'); };
  const applyDateRange = ()=>setShowDateRangePicker(false);

  const menuItems = [
    { label: "Главная", icon: Home, path: "/daily" },
    { label: "Тренировки", icon: BarChart3, path: "/profile" },
    { label: "Планирование", icon: ClipboardList, path: "/planning" },
    { label: "Статистика", icon: CalendarDays, path: "/statistics" },
  ];

  const distanceColors = {"Лыжи, к. ст.": "#4ade80","Лыжи, кл. ст.": "#22d3ee","Бег": "#ef4444","Велосипед":"#3b82f6"};

  const stackedDistanceData = filteredMonths.map((month,i)=>{
    const row = {month};
    filteredDistanceTypes.forEach(t=>row[t.type]=t.distance[i]||0);
    return row;
  });

  const activeDistanceTypes = filteredDistanceTypes.map(t=>t.type);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-white">{name}</h1>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"><Plus className="w-4 h-4 mr-1"/> Добавить тренировку</button>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"><LogOut className="w-4 h-4 mr-1"/> Выйти</button>
          </div>
        </div>

        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map(item=>{
            const Icon = item.icon;
            const isActive = location.pathname===item.path;
            return <button key={item.path} onClick={()=>navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive?"text-blue-500":"text-gray-400 hover:text-white"}`}><Icon className="w-6 h-6" /><span>{item.label}</span></button>;
          })}
        </div>

        {reportType==="Общая дистанция" && (
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам тренировок</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedDistanceData} barGap={0} barCategoryGap="0%">
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }}/>
                  <Tooltip content={({active,payload})=>{
                    if(active && payload) {
                      const filtered = payload.filter(p=>p.value>0);
                      if(filtered.length===0) return null;
                      return <div className="bg-[#1e1e1e] border border-[#333] px-3 py-2 rounded text-sm text-white">{filtered.map(p=><div key={p.dataKey}><span className="inline-block w-3 h-3 mr-1 rounded-full" style={{backgroundColor:p.fill}}></span>{p.dataKey}: {p.value} км</div>)}</div>;
                    }
                    return null;
                  }}/>
                  {activeDistanceTypes.map(type=><Bar key={type} dataKey={type} stackId="a" fill={distanceColors[type]||"#888"} minPointSize={0} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <TableSection table={{title: "Дистанция по видам тренировок", data: filteredDistanceTypes.map(d=>({...d, months:d.distance}))}} index={0} />
      </div>
    </div>
  );
}