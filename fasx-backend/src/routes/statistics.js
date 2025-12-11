const express = require("express");
const { prisma } = require("../prisma");
const { authenticateToken } = require("../middleware/authMiddleware");

const dayjs = require("dayjs");
const isoWeek = require("dayjs/plugin/isoWeek");
dayjs.extend(isoWeek);

const router = express.Router();

router.get("/api/statistics", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const daily = await prisma.dailyInformation.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    // ---- Группировка по неделям ----
    const weeks = {};

    workouts.forEach((w) => {
      const week = dayjs(w.date).isoWeek();

      if (!weeks[week]) {
        weeks[week] = {
          week,
          totalDuration: 0,
          totalDistance: 0,
          sessions: 0,
          zones: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
        };
      }

      weeks[week].totalDuration += w.duration;
      weeks[week].totalDistance += w.distance || 0;
      weeks[week].sessions += 1;

      weeks[week].zones.z1 += w.zone1Min;
      weeks[week].zones.z2 += w.zone2Min;
      weeks[week].zones.z3 += w.zone3Min;
      weeks[week].zones.z4 += w.zone4Min;
      weeks[week].zones.z5 += w.zone5Min;
    });

    // ---- Группировка по месяцам ----
    const months = {};

    workouts.forEach((w) => {
      const key = dayjs(w.date).format("YYYY-MM");

      if (!months[key]) {
        months[key] = {
          month: key,
          totalDuration: 0,
          totalDistance: 0,
          sessions: 0,
        };
      }

      months[key].totalDuration += w.duration;
      months[key].totalDistance += w.distance || 0;
      months[key].sessions += 1;
    });

    res.json({
      workouts,
      daily,
      weeks: Object.values(weeks),
      months: Object.values(months),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Ошибка сервера статистики" });
  }
});

module.exports = router;
