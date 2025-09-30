import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/daily-information — создать или обновить запись состояния
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: no userId in token" });
    }

    const {
      date,
      mainParam,
      physical = 0,
      mental = 0,
      sleepQuality = 0,
      pulse,
      sleepDuration,
      comment,
    } = req.body;

    if (!date) return res.status(400).json({ error: "Missing date" });

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    console.log("Saving daily info for user:", userId, "date:", dateObj);
    console.log("Request body:", req.body);

    // Проверяем, есть ли уже запись на эту дату
    let entry = await prisma.dailyInformation.findFirst({
      where: { userId, date: dateObj },
    });

    const dataToSave = {
      main_param: mainParam || null,
      physical,
      mental,
      sleep_quality: sleepQuality,
      pulse: pulse ? Number(pulse) : null,
      sleep_duration: sleepDuration || null,
      comment: comment || null,
    };

    if (entry) {
      // Обновляем существующую запись
      entry = await prisma.dailyInformation.update({
        where: { id: entry.id },
        data: dataToSave,
      });
    } else {
      // Создаём новую запись
      entry = await prisma.dailyInformation.create({
        data: {
          userId,
          date: dateObj,
          ...dataToSave,
        },
      });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error saving daily information:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/daily-information?date=YYYY-MM-DD — получить запись состояния по дате
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const dateStr = req.query.date;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!dateStr) return res.status(400).json({ error: "Missing date" });

    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const entry = await prisma.dailyInformation.findFirst({
      where: { userId, date: dateObj },
    });

    if (!entry) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(entry);
  } catch (err) {
    console.error("Error fetching daily information:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
