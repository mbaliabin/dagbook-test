import { useMemo, useMemo } from "react";
import dayjs from "dayjs";
import { format, eachDayOfInterval } from "date-fns";
import { ru } from "date-fns/locale";

export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

export const useStatsData = (
  periodType: "week" | "month" | "year" | "custom",
  dateRange: { startDate: Date; endDate: Date }
) => {
  const rawEnduranceZones = [
    { zone: "I1", color: "#4ade80", months: [10,8,12,9,11,14,13,10,8,5,3,2] },
    { zone: "I2", color: "#22d3ee", months: [5,6,7,3,4,5,6,3,4,2,1,1] },
    { zone: "I3", color: "#facc15", months: [2,1,1,1,2,1,1,1,0,1,0,1] },
    { zone: "I4", color: "#fb923c", months: [1,1,2,0,1,1,0,0,1,0,0,0] },
    { zone: "I5", color: "#ef4444", months: [0,0,1,0,0,0,0,0,1,0,1,0] },
  ];

  const rawMovementTypes = [
    { type: "Лыжи / скейтинг", months: [4,5,3,0,0,0,0,0,1,2,3,2] },
    { type: "Лыжи, классика", months: [3,4,2,0,0,0,0,0,0,1,2,1] },
    { type: "Роллеры, классика", months: [0,0,0,3,5,6,7,5,4,3,2,0] },
    { type: "Роллеры, скейтинг", months: [0,0,0,2,6,7,8,6,5,3,2,0] },
    { type: "Велосипед", months: [0,0,0,1,2,3,4,3,2,1,0,0] },
  ];

  const rawDistanceByType = [
    { type: "Лыжи / скейтинг", distance: [40,35,50,0,0,0,0,0,0,0,0,0] },
    { type: "Лыжи, классика", distance: [60,50,55,0,0,0,0,0,0,0,0,0] },
    { type: "Роллеры, классика", distance: [30,25,35,0,0,0,0,0,0,0,0,0] },
    { type: "Роллеры, скейтинг", distance: [25,20,30,0,0,0,0,0,0,0,0,0] },
    { type: "Велосипед", distance: [100,80,120,0,0,0,0,0,0,0,0,0] },
  ];

  const { columns, sliceLength } = useMemo(() => {
    if (periodType === "week") {
      const weeks = [];
      let cur = dayjs().startOf("year").startOf("week");
      const end = dayjs().endOf("year");
      while (cur.isBefore(end)) {
        weeks.push(`W${cur.week()}`);
        cur = cur.add(1, "week");
      }
      return { columns: weeks, sliceLength: weeks.length };
    }

    if (periodType === "month" || periodType === "year") {
      const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
      return { columns: months, sliceLength: 12 };
    }

    // custom
    const days = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    });
    return {
      columns: days.map(d => format(d, "dd MMM", { locale: ru })),
      sliceLength: days.length,
    };
  }, [periodType, dateRange]);

  const slice = <T extends { months?: number[]; distance?: number[] }>(arr: T[]) =>
    arr.map(item => {
      const key = "months" in item ? "months" : "distance";
      const values = (item[key] || []).slice(0, sliceLength);
      const total = values.reduce((a, b) => a + b, 0);
      return { ...item, values, total };
    });

  return {
    columns,
    enduranceZones: slice(rawEnduranceZones),
    movementTypes: slice(rawMovementTypes),
    distanceTypes: slice(rawDistanceByType),
    dailyParams: [
      { param: "Травма", values: [1,0,0,0,0,0,0,0,0,0,0,0].slice(0, sliceLength), total: 1 },
      { param: "Болезнь", values: [0,1,0,0,0,0,0,0,0,0,0,0].slice(0, sliceLength), total: 1 },
      // ... остальные
    ],
  };
};