// src/services/statisticsService.ts
import dayjs from "dayjs";
import express from 'express'
import { prisma } from '../prisma'
import { authenticateToken } from '../middleware/authMiddleware'

interface StatsParams {
  startDate: Date;
  endDate: Date;
  period: "week" | "month" | "year" | "custom";
}

interface Workout {
  id: string;
  name: string;
  type: string;
  duration: number;
  distance?: number;
  date: string;
  zone1Min?: number;
  zone2Min?: number;
  zone3Min?: number;
  zone4Min?: number;
  zone5Min?: number;
}

interface DailyInfo {
  id: number;
  date: string;
  physical: number;
  mental: number;
  sleep_quality: number;
  sleep_duration?: string;
  pulse?: number;
  comment?: string;
}

export async function getStatistics(params: StatsParams) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Нет токена в localStorage");

  const startStr = dayjs(params.startDate).toISOString();
  const endStr = dayjs(params.endDate).toISOString();

  // Получаем тренировки
  const workoutsRes = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workouts?start=${startStr}&end=${endStr}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!workoutsRes.ok) throw new Error("Не удалось получить тренировки");
  const workouts: Workout[] = await workoutsRes.json();

  // Получаем ежедневную информацию
  const dailyRes = await fetch(
    `${import.meta.env.VITE_API_URL}/api/dailyInformation/user?start=${startStr}&end=${endStr}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!dailyRes.ok) throw new Error("Не удалось получить ежедневные данные");
  const dailyInfo: DailyInfo[] = await dailyRes.json();

  // Формируем колонки для выбранного периода
  let columns: string[] = [];
  if (params.period === "week") {
    const start = dayjs(params.startDate).startOf("week");
    const end = dayjs(params.endDate).endOf("week");
    let current = start;
    while (current.isBefore(end) || current.isSame(end, "day")) {
      columns.push(`W${current.week()}`);
      current = current.add(1, "week");
    }
  } else if (params.period === "month" || params.period === "year") {
    columns = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format("MMM"));
  } else if (params.period === "custom") {
    let current = dayjs(params.startDate);
    while (current.isBefore(dayjs(params.endDate)) || current.isSame(dayjs(params.endDate), "day")) {
      columns.push(current.format("DD MMM"));
      current = current.add(1, "day");
    }
  }

  // Подсчёт totals
  const totals = {
    trainingDays: new Set(workouts.map(w => dayjs(w.date).format("YYYY-MM-DD"))).size,
    sessions: workouts.length,
    time: (() => {
      const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}:${m.toString().padStart(2, "0")}`;
    })(),
    distance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
  };

  // Подсчёт зон выносливости
  const enduranceZones = ["I1","I2","I3","I4","I5"].map(zone => {
    const months = columns.map((_, i) => {
      return workouts
        .filter(w => {
          const date = dayjs(w.date);
          if (params.period === "month" || params.period === "year") return date.month() === i;
          if (params.period === "week") return date.week() === i+1;
          if (params.period === "custom") return date.format("DD MMM") === columns[i];
          return false;
        })
        .reduce((sum, w) => {
          const zoneMin = zone === "I1" ? w.zone1Min :
                          zone === "I2" ? w.zone2Min :
                          zone === "I3" ? w.zone3Min :
                          zone === "I4" ? w.zone4Min : w.zone5Min || 0;
          return sum + (zoneMin || 0);
        }, 0);
    });
    const colors: Record<string,string> = { I1:"#4ade80", I2:"#22d3ee", I3:"#facc15", I4:"#fb923c", I5:"#ef4444" };
    return { zone, color: colors[zone], months };
  });

  // Подсчёт типов активности
  const typesSet = Array.from(new Set(workouts.map(w => w.type)));
  const movementTypes = typesSet.map(type => {
    const months = columns.map((_, i) => {
      return workouts
        .filter(w => w.type === type)
        .filter(w => {
          const date = dayjs(w.date);
          if (params.period === "month" || params.period === "year") return date.month() === i;
          if (params.period === "week") return date.week() === i+1;
          if (params.period === "custom") return date.format("DD MMM") === columns[i];
          return false;
        })
        .length;
    });
    return { type, months };
  });

  // Подсчёт дистанции по типам
  const distanceByType = typesSet.map(type => {
    const months = columns.map((_, i) => {
      return workouts
        .filter(w => w.type === type)
        .filter(w => {
          const date = dayjs(w.date);
          if (params.period === "month" || params.period === "year") return date.month() === i;
          if (params.period === "week") return date.week() === i+1;
          if (params.period === "custom") return date.format("DD MMM") === columns[i];
          return false;
        })
        .reduce((sum, w) => sum + (w.distance || 0), 0);
    });
    return { type, months };
  });

  return { totals, enduranceZones, movementTypes, distanceByType, columns, dailyInfo };
}
