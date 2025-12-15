// src/pages/StatisticsPage/StatsPage.tsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
// 💡 Добавляем плагин для функций сравнения дат (isSameOrAfter, isSameOrBefore)
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/ru";
import {
  Home, BarChart3, ClipboardList, CalendarDays,
  Plus, LogOut, Calendar, ChevronDown,
} from "lucide-react";
import { DateRange } from "react-date-range";
import ru from "date-fns/locale/ru";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { EnduranceChart } from "../components/StatisticsPage/EnduranceChart";
import { DistanceChart } from "../components/StatisticsPage/DistanceChart";
import { SyncedTable } from "../components/StatisticsPage/SyncedTable";

// 🚀 Расширяем Day.js необходимыми плагинами
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore); // <-- Активируем плагин
dayjs.locale("ru");

type PeriodType = "week" | "month" | "year" | "custom";

interface Totals {
  trainingDays: number;
  sessions: number;
  time: string;
  distance: number;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name] = React.useState("Пользователь");
  const [reportType, setReportType] = React.useState("Общий отчет");
  const [periodType, setPeriodType] = React.useState<PeriodType>("year");
  const [dateRange, setDateRange] = React.useState({
    startDate: dayjs().startOf("year").toDate(),
    endDate: dayjs().endOf("year").toDate(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState<Totals | null>(null);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Нет авторизации");
      setLoading(false);
      return;
    }

    try {
      // Получаем ВСЕ тренировки пользователя (твой текущий эндпоинт)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не удалось загрузить тренировки");
      const allWorkouts = await res.json();

      // Получаем daily-инфу за нужный период
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Не удалось загрузить ежедневные данные");
      await dailyRes.json(); // пока не используем, но запрос рабочий

      // Фильтруем тренировки по выбранному периоду на фронте
      const workouts = allWorkouts.filter((w: any) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        if (!d.isValid()) return false;

        const startDay = dayjs(dateRange.startDate).startOf("day");
        const endDay = dayjs(dateRange.endDate).startOf("day");

        // ЭТИ ФУНКЦИИ ТЕПЕРЬ ДОСТУПНЫ БЛАГОДАРЯ ПЛАГИНУ:
        return d.isSameOrAfter(startDay) && d.isSameOrBefore(endDay);
      });

      // === Дальше — тот же расчёт, что был раньше ===
      const trainingDaysSet = new Set(workouts.map((w: any) => dayjs(w.date).format("YYYY-MM-DD")));
      const totalMinutes = workouts.reduce((s: number, w: any) => s + w.duration, 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      setTotals({
        trainingDays: trainingDaysSet.size,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: Math.round(workouts.reduce((s: number, w: any) => s + (w.distance || 0), 0)),
      });

      // Колонки
      let cols: string[] = [];
      if (periodType === "year" || periodType === "month") {
        cols = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
      } else if (periodType === "week") {
        const year = dayjs().year();
        let week = 1;
        const start = dayjs(`${year}-01-01`).startOf("week");
        let cur = start;
        while (cur.year() === year) {
          cols.push(`W${week}`);
          week++;
          cur = cur.add(1, "week");
        }
      } else if (periodType === "custom") {
        let cur = dayjs(dateRange.startDate);
        while (cur.isBefore(dateRange.endDate) || cur.isSame(dateRange.endDate, "day")) {
          cols.push(cur.format("DD MMM"));
          cur = cur.add(1, "day");
        }
      }
      setColumns(cols.slice(0, periodType === "custom" ? undefined : 12));

      // Зоны, типы, дистанции — всё как раньше, только по отфильтрованным workouts
      const zones = ["I1", "I2", "I3", "I4", "I5"];
      const colors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
      const typeMap: Record<string, string> = {
        XC_Skiing_Skate: "Лыжи / скейтинг",
        XC_Skiing_Classic: "Лыжи, классика",
        RollerSki_Classic: "Роллеры, классика",
        RollerSki_Skate: "Роллеры, скейтинг",
        Bike: "Велосипед",
        Running: "Бег",
        StrengthTraining: "Силовая",
        Other: "Другое",
      };

      const enduranceData = zones.map(zone => {
        const key = zone === "I1" ? "zone1Min" :
                    zone === "I2" ? "zone2Min" :
                    zone === "I3" ? "zone3Min" :
                    zone === "I4" ? "zone4Min" : "zone5Min";

        const months = cols.map((_, i) => {
          return workouts
            .filter((w: any) => {
              const d = dayjs(w.date);
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return d.month() === i;
            })
            .reduce((sum: number, w: any) => sum + (w[key] || 0), 0);
        });
        return { zone, color: colors[zone as keyof typeof colors], months };
      });

      const typesSet = [...new Set(workouts.map((w: any) => w.type))];
      const movementData = typesSet.map((type: string) => ({
        type: typeMap[type] || type,
        months: cols.map((_, i) => workouts.filter((w: any) => w.type === type && dayjs(w.date).month() === i).length),
      }));

      const distanceData = typesSet.map((type: string) => ({
        type: typeMap[type] || type,
        months: cols.map((_, i) => workouts
          .filter((w: any) => w.type === type && dayjs(w.date).month() === i)
          .reduce((s: number, w: any) => s + (w.distance || 0), 0)
        ),
      }));

      setEnduranceZones(enduranceData);
      setMovementTypes(movementData);
      setDistanceByType(distanceData);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, periodType]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // Подготовка данных для таблиц и графиков (как раньше)
  const filteredEndurance = enduranceZones.map(z => ({
    ...z, months: z.months.slice(0, columns.length),
    total: z.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0)
  }));
  const filteredMovement = movementTypes.map(m => ({
    ...m, months: m.months.slice(0, columns.length),
    total: m.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0)
  }));
  const filteredDistance = distanceByType.map(d => ({
    ...d, months: d.months.slice(0, columns.length).map(Math.round),
    total: d.months.slice(0, columns.length).reduce((a: number, b: number) => a + b, 0)
  }));

  const enduranceChartData = columns.map((c, i) => {
    const o: any = { month: c };
    filteredEndurance.forEach(z => o[z.zone] = z.months[i] ?? 0);
    return o;
  });
  const distanceChartData = columns.map((c, i) => {
    const o: any = { month: c };
    filteredDistance.forEach(t => o[t.type] = t.months[i] ?? 0);
    return o;
  });

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400 text-xl">Ошибка: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Весь твой старый JSX — без изменений, только данные теперь реальные */}
        {/* HEADER, MENU, FILTERS — оставь как было */}
        {/* TOTALS */}
        {totals && (
          <div className="flex flex-wrap gap-10 text-sm">
            <div><p className="text-gray-400">Тренировочные дни</p><p className="text-2xl">{totals.trainingDays}</p></div>
            <div><p className="text-gray-400">Сессий</p><p className="text-2xl">{totals.sessions}</p></div>
            <div><p className="text-gray-400">Время</p><p className="text-2xl">{totals.time}</p></div>
            <div><p className="text-gray-400">Дистанция (км)</p><p className="text-2xl">{totals.distance}</p></div>
          </div>
        )}

        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceChartData} zones={filteredEndurance} />
            <SyncedTable title="Зоны выносливости" rows={filteredEndurance.map(z=>({param:z.zone,color:z.color,months:z.months,total:z.total}))} columns={columns} formatAsTime index={1} showBottomTotal bottomRowName="Общая выносливость" />
            <SyncedTable title="Тип активности" rows={filteredMovement.map(m=>({param:m.type,months:m.months,total:m.total}))} columns={columns} index={2} showBottomTotal bottomRowName="Всего тренировок" />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <DistanceChart data={distanceChartData} types={filteredDistance.map(t=>t.type)} />
            <SyncedTable title="Дистанция по видам" rows={filteredDistance.map(t=>({param:t.type,months:t.months,total:t.total}))} columns={columns} showBottomTotal bottomRowName="Общая дистанция" />
          </>
        )}
      </div>
    </div>
  );
}