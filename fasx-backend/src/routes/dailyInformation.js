import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Вспомогательная функция для поиска диапазона дня
function getDayRange(dateStr) {
  const startOfDay = new Date(dateStr);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(dateStr);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

// POST /api/daily-information — создать или обновить запись состояния
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: no userId in token" });
    }

    const { date, mainParam, physical, mental, sleepQuality, pulse, sleepDuration, comment } = req.body;

    if (!date) return res.status(400).json({ error: "Missing date" });

    const { startOfDay, endOfDay } = getDayRange(date);

    // Проверяем, есть ли уже запись на эту дату
    let entry = await prisma.dailyInformation.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (entry) {
      // Обновляем существующую запись
      entry = await prisma.dailyInformation.update({
        where: { id: entry.id },
        data: {
          main_param: mainParam,
          physical,
          mental,
          sleep_quality: sleepQuality,
          pulse: pulse ? Number(pulse) : null,
          sleep_duration: sleepDuration,
          comment,
        },
      });
    } else {
      // Создаём новую запись
      entry = await prisma.dailyInformation.create({
        data: {
          userId,
          date: new Date(date),
          main_param: mainParam,
          physical,
          mental,
          sleep_quality: sleepQuality,
          pulse: pulse ? Number(pulse) : null,
          sleep_duration: sleepDuration,
          comment,
        },
      });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error saving daily information:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/daily-information?date=YYYY-MM-DD — получить запись состояния по дате
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const dateStr = req.query.date;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!dateStr) return res.status(400).json({ error: "Missing date" });

    const { startOfDay, endOfDay } = getDayRange(dateStr);

    const entry = await prisma.dailyInformation.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!entry) return res.status(404).json({ error: "Not found" });

    res.json(entry);
  } catch (err) {
    console.error("Error fetching daily information:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
