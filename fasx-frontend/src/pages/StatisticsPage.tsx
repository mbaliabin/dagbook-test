import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
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

dayjs.extend(weekOfYear);
dayjs.locale("ru");

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs("2025-01-01").toDate(),
    endDate: dayjs("2025-12-31").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const totals = {
    trainingDays: 83,
    sessions: 128,
    time: "178:51",
    distance: 1240,
  };

  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  const enduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2] },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1] },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1] },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0] },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0] },
  ];

  const movementTypes = [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2] },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1] },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0] },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0] },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0] },
  ];

  const distanceByType = [
    { type: "Лыжи / скейтинг", distance: [40,35,50,30,45,30,40,0,0,0,0,0] },
    { type: "Лыжи, классика", distance: [60,50,55,40,50,45,50,0,0,0,0,0] },
    { type: "Роллеры, классика", distance: [30,25,35,20,30,25,30,0,0,0,0,0] },
    { type: "Роллеры, скейтинг", distance: [25,20,30,15,25,20,25,0,0,0,0,0] },
    { type: "Велосипед", distance: [100,80,120,70,90,80,100,0,0,0,0,0] },
  ];

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2,"0")}`;
  };

  const computeWeekColumns = () => {
    const start = dayjs().startOf("year");
    const end = dayjs().endOf("year");
    const weeks: string[] = [];
    let current = start.startOf("week");
    while (current.isBefore(end)) {
      weeks.push(`W${current.week()}`);
      current = current.add(1,"week");
    }
    return weeks;
  };

  const computeMonthColumns = () => months;

  const computeCustomColumns = () => {
    const start = dayjs(dateRange.startDate);
    const end = dayjs(dateRange.endDate);
    const result: string[] = [];
    let current = start.startOf("day");
    while (current.isBefore(end) || current.isSame(end, "day")) {
      result.push(current.format("DD MMM"));
      current = current.add(1, "day");
    }
    return result;
  };

  const computeColumns = () => {
    if (periodType === "week") return computeWeekColumns();
    if (periodType === "month") return computeMonthColumns();
    if (periodType === "year") return computeMonthColumns();
    if (periodType === "custom") return computeCustomColumns();
    return months;
  };

  const filteredMonths = computeColumns();

  const filteredEnduranceZones = enduranceZones.map((z) => {
    const slice = z.months.slice(0, filteredMonths.length);
    return { ...z, months: slice, total: slice.reduce((a,b)=>a+b,0) };
  });

  const filteredMovementTypes = movementTypes.map((m) => {
    const slice = m.months.slice(0, filteredMonths.length);
    return { ...m, months: slice, total: slice.reduce((a,b)=>a+b,0) };
  });

  const filteredDistanceTypes = distanceByType.map((d) => {
    const slice = d.distance.slice(0, filteredMonths.length);
    return { type: d.type, months: slice, total: slice.reduce((a,b)=>a+b,0) };
  });

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref,i)=>{ if(i!==index && ref.current) ref.current.scrollLeft = scrollLeft; });
  };

  const TableSection: React.FC<{ table:any; index:number }> = ({ table,index }) => {
    const colWidth = 80;
    const leftWidth = 200;
    const totalWidth = 80;
    const minWidth = Math.max(1000, filteredMonths.length*colWidth + leftWidth + totalWidth);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={e=>handleScroll(e,index)}>
          <div style={{minWidth}} className="transition-all">
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{width:leftWidth}}>
                {table.title==="Выносливость"?"Зона":table.title==="Тип активности"?"Тип активности":"Вид"}
              </div>
              {filteredMonths.map((m,idx)=><div key={idx} className="p-3 text-center flex-none font-medium" style={{width:colWidth}}>{m}</div>)}
              <div className="p-3 text-center font-medium bg-[#1f1f1f] flex-none" style={{width:totalWidth}}>Всего</div>
            </div>
            <div>
              {table.data.map((row:any,j:number)=>(
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{width:leftWidth}}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{backgroundColor: row.color}}/>}
                    <div className="truncate">{row.param || row.type}</div>
                  </div>
                  {row.months.map((val:number,k:number)=><div key={k} className="p-3 text-center flex-none" style={{width:colWidth}}>
                    {table.title==="Выносливость"?formatTime(val):table.title==="Тип активности"?formatTime(val):val}
                  </div>)}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{width:totalWidth}}>
                    {row.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { label:"Главная", icon:Home, path:"/daily" },
    { label:"Тренировки", icon:BarChart3, path:"/profile" },
    { label:"Планирование", icon:ClipboardList, path:"/planning" },
    { label:"Статистика", icon:CalendarDays, path:"/statistics" },
  ];

  const distanceColors: Record<string,string> = {
    "Лыжи / скейтинг":"#4ade80",
    "Лыжи, классика":"#22d3ee",
    "Роллеры, классика":"#facc15",
    "Роллеры, скейтинг":"#fb923c",
    "Велосипед":"#3b82f6",
  };

  const activeDistanceTypes = filteredDistanceTypes.filter(t=>t.months.some(v=>v>0)).map(t=>t.type);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
          <div className="flex items-center space-x-4">
            <img src="/profile.jpg" alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
            <h1 className="text-2xl font-bold text-white">{name}</h1>
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

        {/* MENU */}
        <div className="flex justify-around bg-[#1a1a1d] border-b border-gray-700 py-2 px-4 rounded-xl mb-6">
          {menuItems.map((item)=>{ const Icon=item.icon; const isActive=location.pathname===item.path;
            return <button key={item.path} onClick={()=>navigate(item.path)} className={`flex flex-col items-center text-sm transition-colors ${isActive?"text-blue-500":"text-gray-400 hover:text-white"}`}>
              <Icon className="w-6 h-6"/>
              <span>{item.label}</span>
            </button>;
          })}
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={reportType} onChange={e=>setReportType(e.target.value)} className="bg-[#1f1f22] text-white px-3 py-1 rounded">
            <option>Общий отчет</option>
            <option>Общая дистанция</option>
          </select>
          <button onClick={()=>setPeriodType("week")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Неделя</button>
          <button onClick={()=>setPeriodType("month")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Месяц</button>
          <button onClick={()=>setPeriodType("year")} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d]">Год</button>
          <div className="relative">
            <button onClick={()=>setShowDateRangePicker(prev=>!prev)} className="px-3 py-1 rounded bg-[#1f1f22] text-gray-200 hover:bg-[#2a2a2d] flex items-center">
              <Calendar className="w-4 h-4 mr-1"/> Произвольный период
              <ChevronDown className="w-4 h-4 ml-1"/>
            </button>
            {showDateRangePicker &&
              <div className="absolute z-50 mt-2 bg-[#1a1a1d] rounded shadow-lg p-2">
                <DateRange
                  ranges={[{startDate: dateRange.startDate, endDate: dateRange.endDate, key:"selection"}]}
                  onChange={item=>setDateRange({startDate:item.selection.startDate,endDate:item.selection.endDate})}
                  months={1} direction="horizontal" locale={ru} weekStartsOn={1} moveRangeOnFirstSelection={false} rangeColors={["#3b82f6"]}
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button onClick={()=>setShowDateRangePicker(false)} className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 text-gray-300">Отмена</button>
                  <button onClick={()=>setShowDateRangePicker(false)} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">Применить</button>
                </div>
              </div>
            }
          </div>
        </div>

        {/* TOTALS */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">Статистика</h1>
          <div className="flex flex-wrap gap-10 text-sm mt-3">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-xl text-gray-100">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-xl text-gray-100">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-xl text-gray-100">{totals.time}</p></div>
            <div><p className="text-gray-400">Общее расстояние (км)</p><p className="text-xl text-gray-100">{totals.distance}</p></div>
          </div>
        </div>

        {/* REPORTS */}
        {reportType==="Общий отчет" && <>
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredMonths.map((month,i)=>{
                    const data:any={month};
                    filteredEnduranceZones.forEach(z=>data[z.zone]=z.months[i]);
                    return data;
                  })}
                  barGap={0} barCategoryGap="0%"
                >
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#888", fontSize:12}}/>
                  <Tooltip/>
                  {filteredEnduranceZones.map(z=><Bar key={z.zone} dataKey={z.zone} stackId="a" fill={z.color} radius={[4,4,0,0]}/>)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <TableSection table={{title:"Выносливость", data: filteredEnduranceZones.map(z=>({param:z.zone,color:z.color,months:z.months,total:formatTime(z.total)}))}} index={0}/>
          <TableSection table={{title:"Тип активности", data: filteredMovementTypes.map(m=>({param:m.type,months:m.months,total:formatTime(m.total)}))}} index={1}/>
        </>}

        {reportType==="Общая дистанция" && <>
          <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Общая дистанция по видам тренировок</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredMonths.map((month,i)=>{
                    const data:any={month};
                    filteredDistanceTypes.forEach(t=>data[t.type]=t.months[i]);
                    return data;
                  })}
                  barGap={0} barCategoryGap="0%"
                >
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#888", fontSize:12}}/>
                  <Tooltip/>
                  {activeDistanceTypes.map(type=><Bar key={type} dataKey={type} stackId="a" fill={distanceColors[type]} radius={[4,4,0,0]}/>)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <TableSection table={{title:"Дистанция по видам тренировок", data:filteredDistanceTypes,totalKey:"distance"}} index={0}/>
        </>}

      </div>
    </div>
  );
}
