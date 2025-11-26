import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import weekOfYear from "dayjs/plugin/weekOfYear";
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

dayjs.extend(weekOfYear);
dayjs.locale("ru");

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] =
    React.useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = React.useState<{ startDate: Date; endDate: Date }>({
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
    { type: "Лыжероллеры, к. ст", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Лыжероллеры, кл. ст.", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Бег", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Силовая", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Велосипед", months: [40, 35, 50, 30, 45, 30, 40] },
    { type: "Другое", months: [40, 35, 50, 30, 45, 30, 40] },
  ];

  const distanceByType = [
    { type: "Лыжи, к. ст.", distance: [120, 90, 110, 80, 100, 130, 140] },
    { type: "Лыжи, кл. ст.", distance: [100, 75, 95, 60, 85, 110, 120] },
    { type: "Лыжероллеры, к. ст", distance: [60, 50, 75, 45, 70, 55, 65] },
    { type: "Лыжероллеры, кл. ст.", distance: [55, 45, 70, 40, 60, 50, 60] },
    { type: "Бег", distance: [80, 70, 90, 60, 75, 85, 95] },
    { type: "Велосипед", distance: [150, 130, 160, 120, 140, 170, 180] },
  ];

  const computeColumns = () => {
    if (periodType === "week") return Array.from({ length: dayjs().week() }, (_, i) => `${i+1} / ${dayjs().year()}`);
    if (periodType === "month") return months.slice(0, dayjs().month() + 1);
    if (periodType === "year") return months;
    if (periodType === "custom") {
      const start = dayjs(dateRange.startDate);
      const end = dayjs(dateRange.endDate);
      const result: string[] = [];
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

  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, index: number) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    scrollRefs.forEach((ref, i) => { if (i !== index && ref.current) ref.current.scrollLeft = scrollLeft; });
  };

  const TableSection: React.FC<{ table: any; index: number }> = ({ table, index }) => {
    const leftColWidth = table.title.includes("Дистанция") || table.title.includes("Тип активности") ? 260 : 200;
    const totalColWidth = 80;
    const colWidth = periodType === "week" ? 80 : periodType === "month" ? 100 : 80;
    const computedMinWidth = Math.max(1600, filteredMonths.length * colWidth + leftColWidth + totalColWidth);

    return (
      <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{table.title}</h2>
        <div ref={scrollRefs[index]} className="overflow-x-auto" onScroll={e => handleScroll(e, index)}>
          <div style={{ minWidth: computedMinWidth }} className="transition-all duration-300">
            <div className="flex bg-[#222] border-b border-[#2a2a2a] sticky top-0 z-10">
              <div className="p-3 font-medium sticky left-0 bg-[#222] z-20" style={{ width: leftColWidth }}>
                {table.title.includes("Дистанция") || table.title.includes("Тип активности") ? "Тип / Вид" : "Параметр"}
              </div>
              {filteredMonths.map((m, idx) => <div key={idx} className="p-3 text-center flex-none font-medium" style={{ width: colWidth }}>{m}</div>)}
              <div className="p-3 text-center font-medium bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>Всего</div>
            </div>
            <div>
              {table.data.map((row: any, j: number) => (
                <div key={j} className="flex border-t border-[#2a2a2a] hover:bg-[#252525]/60 transition">
                  <div className="p-3 sticky left-0 bg-[#1a1a1a] z-10 flex items-center gap-2" style={{ width: leftColWidth }}>
                    {row.color && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></span>}
                    <div className="truncate">{row.param || row.type}</div>
                  </div>
                  {filteredMonths.map((val: number, k: number) => <div key={k} className="p-3 text-center flex-none" style={{ width: colWidth }}>{val}</div>)}
                  <div className="p-3 text-center bg-[#1f1f1f] flex-none" style={{ width: totalColWidth }}>{row.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const applyDateRange = () => setShowDateRangePicker(false);

  // Chart.js data preparation
  const enduranceData = {
    labels: filteredMonths,
    datasets: enduranceZones.map(z => ({ label: z.zone, data: z.months.slice(0, filteredMonths.length), backgroundColor: z.color }))
  };
  const distanceColors: Record<string,string> = {
    "Лыжи, к. ст.": "#4ade80","Лыжи, кл. ст.": "#22d3ee","Лыжероллеры, к. ст": "#facc15",
    "Лыжероллеры, кл. ст.": "#fb923c","Бег": "#ef4444","Велосипед": "#3b82f6",
  };
  const distanceData = {
    labels: filteredMonths,
    datasets: distanceByType.map(d => ({ label: d.type, data: d.distance.slice(0, filteredMonths.length), backgroundColor: distanceColors[d.type] || "#888" }))
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER, MENU, TOTALS ... (как в предыдущем примере) */}

        {/* CHARTS */}
        {reportType === "Общий отчет" && <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg"><Bar data={enduranceData} options={{ responsive:true, plugins:{legend:{labels:{color:"#fff"}}, tooltip:{mode:"index", intersect:false}}, scales:{x:{ticks:{color:"#fff"}},y:{ticks:{color:"#fff"}}}, interaction:{mode:"nearest", axis:"x", intersect:false}, stacked:true }} height={300} /></div>}
        {reportType === "Общая дистанция" && <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg"><Bar data={distanceData} options={{ responsive:true, plugins:{legend:{labels:{color:"#fff"}}, tooltip:{mode:"index", intersect:false}}, scales:{x:{ticks:{color:"#fff"}},y:{ticks:{color:"#fff"}}}, interaction:{mode:"nearest", axis:"x", intersect:false}, stacked:true }} height={300} /></div>}

        {/* TABLES */}
        <TableSection table={{ title: "Параметры дня", data: [ { param: "Травма", months: [70,70,69,69,68,68,68], total: 483 }, { param: "Болезнь", months: [50,51,52,51,50,49,50], total: 353 }, { param: "В пути", months: [50,51,52,51,50,49,50], total: 353 }, { param: "Смена час. пояса", months: [50,51,52,51,50,49,50], total: 353 }, { param: "Выходной", months: [50,51,52,51,50,49,50], total: 353 }, { param: "Соревнование", months: [50,51,52,51,50,49,50], total: 353 } ] }} index={0} />
        <TableSection table={{ title: "Выносливость", data: enduranceZones.map(z=>({ param:z.zone, color:z.color, months:z.months, total:z.months.reduce((a,b)=>a+b,0) })) }} index={1} />
        <TableSection table={{ title: "Тип активности", data: movementTypes.map(m=>({ param:m.type, months:m.months, total:m.months.reduce((a,b)=>a+b,0) })) }} index={2} />
        <TableSection table={{ title: "Дистанция по видам тренировок", data: distanceByType.map(d=>({ param:d.type, color:distanceColors[d.type]||"#888", months:d.distance, total:d.distance.reduce((a,b)=>a+b,0) })) }} index={3} />

      </div>
    </div>
  );
}
