import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/daily-information — создать запись состояния
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // берём userId из токена

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: no userId in token" });
    }

    const { date, mainParam, physical, mental, sleepQuality, pulse, sleepDuration, comment } = req.body;

    const entry = await prisma.dailyInformation.create({
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

    res.json(entry);
  } catch (error) {
    console.error("Error saving daily information:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
