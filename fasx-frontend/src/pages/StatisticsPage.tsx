// StatsPage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ru from "date-fns/locale/ru";
import { Home, BarChart3, ClipboardList, CalendarDays, Plus, LogOut, Calendar, ChevronDown } from "lucide-react";

import { StatsHeader } from "./components/StatisticsPage/StatsHeader";
import { PeriodSelector } from "./components/StatisticsPage/PeriodSelector";
import { StatsCards from "./components/StatisticsPage/StatsCards";
import { StackedBarChart } from "./components/StatisticsPage/StackedBarChart";
import { SyncedTable } from "./components/StatisticsPage/SyncedTable";
import { useStatsData } from "./components/StatisticsPage/useStatsData";

const COLORS = {
  I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444",
  "Лыжи / скейтинг": "#4ade80",
  "Лыжи, классика": "#22d3ee",
  "Роллеры, классика": "#facc15",
  "Роллеры, скейтинг": "#fb923c",
  "Велосипед": "#3b82f6",
};

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reportType, setReportType] = useState<"Общий отчет" | "Общая дистанция">("Общий отчет");
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("year");
  const [dateRange, setDateRange] = useState({ startDate: new Date(2025, 0, 1), endDate: new Date(2025, 11, 31) });
  const [showPicker, setShowPicker] = useState(false);

  const { columns, enduranceZones, movementTypes, distanceTypes, dailyParams } = useStatsData(periodType, dateRange);

  const chartData = columns.map((name, i) => {
    const obj: any = { name };
    if (reportType === "Общий отчет") {
      enduranceZones.forEach(z => obj[z.zone] = z.values[i] ?? 0);
    } else {
      distanceTypes.forEach(t => obj[t.type] = t.values[i] ?? 0);
    }
    return obj;
  });

  const menuItems = [ /* те же */ ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        <StatsHeader name="Пользователь" onLogout={() => { localStorage.removeItem("token"); navigate("/login"); }} />

        {/* меню навигации и фильтры — можно вынести в отдельные компоненты */}

        <PeriodSelector
          periodType={periodType}
          setPeriodType={setPeriodType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
        />

        <StatsCards
          trainingDays={83}
          sessions={128}
          time="178:51"
          distance={1240}
        />

        {/* График */}
        <div className="bg-[#1a1a1d] p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6">
            {reportType === "Общий отчет" ? "Зоны выносливости" : "Дистанция по видам"}
          </h2>
          <StackedBarChart
            data={chartData}
            keys={reportType === "Общий отчет" ? enduranceZones.map(z=>z.zone) : distanceTypes.map(t=>t.type)}
            colors={COLORS}
            formatHours={reportType === "Общий отчет"}
          />
        </div>

        {/* Таблицы */}
        {reportType === "Общий отчет" ? (
          <>
            <SyncedTable title="Параметры дня" rows={dailyParams} unit="count" index={0} />
            <SyncedTable title="Зоны выносливости" rows={enduranceZones.map(z=>({...z, param: z.zone, total: formatMinutes(z.total)}))} unit="hours" index={1} />
            <SyncedTable title="Тип активности" rows={movementTypes.map(m=>({param: m.type, total: formatMinutes(m.total), values: m.values}))} unit="hours" index={2} />
          </>
        ) : (
          <SyncedTable
            title="Дистанция по видам тренировок"
            rows={distanceTypes.map(t=>({param: t.type, color: COLORS[t.type as keyof typeof COLORS], total: t.total, values: t.values}))}
            unit="km"
            index={0}
          />
        )}
      </div>
    </div>
  );
}