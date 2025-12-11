// src/pages/StatisticsPage/StatsPage.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
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

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.locale("ru");

type PeriodType = "week" | "month" | "year" | "custom";

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
  const [totals, setTotals] = React.useState<any>(null);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [enduranceZones, setEnduranceZones] = React.useState<any[]>([]);
  const [movementTypes, setMovementTypes] = React.useState<any[]>([]);
  const [distanceByType, setDistanceByType] = React.useState<any[]>([]);
  const [dailyInfo, setDailyInfo] = React.useState<Record<string, any>>({}); // ← НОВАЯ ПЕРЕМЕННАЯ

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
      // 1. Все тренировки
      const workoutsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/workouts/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!workoutsRes.ok) throw new Error("Не удалось загрузить тренировки");
      const allWorkouts = await workoutsRes.json();

      // 2. Daily Information за период
      const startStr = dayjs(dateRange.startDate).format("YYYY-MM-DD");
      const endStr = dayjs(dateRange.endDate).format("YYYY-MM-DD");

      const dailyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/daily-information/range?start=${startStr}&end=${endStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!dailyRes.ok) throw new Error("Не удалось загрузить ежедневные данные");
      const dailyRaw = await dailyRes.json();

      const dailyMap: Record<string, any> = {};
      dailyRaw.forEach((entry: any) => {
        if (entry.date) {
          const key = dayjs(entry.date).format("YYYY-MM-DD");
          dailyMap[key] = {
            physical: entry.physical ?? null,
            mental: entry.mental ?? null,
            sleep_quality: entry.sleep_quality ?? null,
            pulse: entry.pulse ?? null,
            sleep_duration: entry.sleep_duration ?? null,
          };
        }
      });
      setDailyInfo(dailyMap);

      // Фильтрация тренировок по периоду
      const startDay = dayjs(dateRange.startDate).startOf("day");
      const endDay = dayjs(dateRange.endDate).endOf("day");

      const workouts = allWorkouts.filter((w: any) => {
        if (!w?.date) return false;
        const d = dayjs(w.date);
        return d.isValid() && d.isBetween(startDay, endDay, null, "[]");
      });

      // Totals
      const trainingDays = new Set(workouts.map((w: any) => dayjs(w.date).format("YYYY-MM-DD"))).size;
      const totalMinutes = workouts.reduce((s: number, w: any) => s + (w.duration || 0), 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      setTotals({
        trainingDays,
        sessions: workouts.length,
        time: `${h}:${m.toString().padStart(2, "0")}`,
        distance: Math.round(workouts.reduce((s: number, w: any) => s + (w.distance || 0), 0)),
      });

      // Колонки
      let cols: string[] = [];
      if (periodType === "year" || periodType === "month") {
        cols = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
      } else if (periodType === "week") {
        const year = dayjs().year();
        let week = 1;
        let cur = dayjs(`${year}-01-01`).startOf("week");
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

      // Зоны выносливости
      const zones = ["I1", "I2", "I3", "I4", "I5"];
      const colors = { I1: "#4ade80", I2: "#22d3ee", I3: "#facc15", I4: "#fb923c", I5: "#ef4444" };
      const zoneKey = { I1: "zone1Min", I2: "zone2Min", I3: "zone3Min", I4: "zone4Min", I5: "zone5Min" };

      const enduranceData = zones.map(z => ({
        zone: z,
        color: colors[z as keyof typeof colors],
        months: cols.map((_, i) => {
          return workouts
            .filter((w: any) => {
              const d = dayjs(w.date);
              if (!d.isValid()) return false;
              if (periodType === "custom") return d.format("DD MMM") === cols[i];
              return d.month() === i;
            })
            .reduce((sum: number, w: any) => sum + (w[zoneKey[z as keyof typeof zoneKey]] || 0), 0);
        }),
      }));

      // Типы активности
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

      const typesSet = [...new Set(workouts.map((w: any) => w.type))];
      const movementData = typesSet.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts.filter((w: any) => {
          const d = dayjs(w.date);
          if (!d.isValid()) return false;
          if (periodType === "custom") return d.format("DD MMM") === cols[i];
          return w.type === t && d.month() === i;
        }).length),
      }));

      const distanceData = typesSet.map(t => ({
        type: typeMap[t] || t,
        months: cols.map((_, i) => workouts
          .filter((w: any) => {
            const d = dayjs(w.date);
            if (!d.isValid()) return false;
            if (periodType === "custom") return d.format("DD MMM") === cols[i];
            return w.type === t && d.month() === i;
          })
          .reduce((s: number, w: any) => s + (w.distance || 0), 0)
        ),
      }));

      setEnduranceZones(enduranceData.map(z => ({ ...z, total: z.months.reduce((a: number, b: number) => a + b, 0) })));
      setMovementTypes(movementData.map(m => ({ ...m, total: m.months.reduce((a: number, b: number) => a + b, 0) })));
      setDistanceByType(distanceData.map(d => ({ ...d, total: d.months.reduce((a: number, b: number) => a + b, 0) })));

    } catch (err: any) {
      setError(err.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [dateRange, periodType]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const getDailyValue = (param: "physical" | "mental" | "sleep_quality" | "pulse", index: number) => {
    if (periodType === "custom") {
      const date = dayjs(dateRange.startDate).add(index, "day").format("YYYY-MM-DD");
      return dailyInfo[date]?.[param] ?? "-";
    }
    // Для месяца/года — среднее
    const monthDates = Object.keys(dailyInfo).filter(d => dayjs(d).month() === index);
    if (monthDates.length === 0) return "-";
    const sum = monthDates.reduce((s, d) => s + (dailyInfo[d][param] || 0), 0);
    return Math.round(sum / monthDates.length);
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white text-2xl">Загрузка...</div>;
  if (error) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-400 text-xl">Ошибка: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 p-6 w-full">
      <div className="max-w-[1600px] mx-auto space-y-6 px-4">
        {/* HEADER + MENU + FILTERS — оставил как у тебя */}
        {/* ... твой старый код ... */}

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

        {reportType === "Общий отчет" && (
          <>
            <EnduranceChart data={enduranceZones.map(z => z.months).flat()} zones={enduranceZones} />

            {/* ← ЭТО ТВОЯ СТАРАЯ ТАБЛИЦА, НО С РЕАЛЬНЫМИ ДАННЫМИ! */}
            <SyncedTable
              title="Параметры дня"
              rows={[
                { param: "Физика", months: columns.map((_, i) => getDailyValue("physical", i)), total: "-" },
                { param: "Психика", months: columns.map((_, i) => getDailyValue("mental", i)), total: "-" },
                { param: "Качество сна", months: columns.map((_, i) => getDailyValue("sleep_quality", i)), total: "-" },
                { param: "Пульс утром", months: columns.map((_, i) => getDailyValue("pulse", i)), total: "-" },
              ]}
              columns={columns}
              index={0}
              showBottomTotal={false}
            />

            <SyncedTable
              title="Зоны выносливости"
              rows={enduranceZones.map(z => ({ param: z.zone, color: z.color, months: z.months, total: z.total }))}
              columns={columns}
              formatAsTime
              index={1}
              showBottomTotal
              bottomRowName="Общая выносливость"
            />

            <SyncedTable
              title="Тип активности"
              rows={movementTypes.map(m => ({ param: m.type, months: m.months, total: m.total }))}
              columns={columns}
              index={2}
              showBottomTotal
              bottomRowName="Общее по видам активности"
            />
          </>
        )}

        {reportType === "Общая дистанция" && (
          <>
            <DistanceChart data={distanceByType.map(d => d.months).flat()} types={distanceByType.map(d => d.type)} />
            <SyncedTable
              title="Дистанция по видам тренировок"
              rows={distanceByType.map(t => ({ param: t.type, months: t.months, total: t.total }))}
              columns={columns}
              showBottomTotal
              bottomRowName="Общая дистанция"
            />
          </>
        )}
      </div>
    </div>
  );
}