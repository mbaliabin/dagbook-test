// src/routes/dailyRange.js
import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/daily-information/range?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/range", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end date" });
    }

    const startDate = new Date(start as string);        // ← было: new Date(start as string
    const endDate = new Date(end as string);            // ← было: new Date(end as string
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.dailyInformation.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;