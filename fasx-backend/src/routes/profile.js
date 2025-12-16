import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ИЗМЕНЕННЫЙ GET ---
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        profile: true // <-- ДОБАВЛЕНО: теперь подтягиваются спорт, клуб, зоны пульса
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- ПОЛНОСТЬЮ НОВЫЙ PUT (ОБНОВЛЕНИЕ) ---
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Достаем из тела запроса все наши новые поля
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    const result = await prisma.$transaction([
      // Обновляем базовое имя в User
      prisma.user.update({
        where: { id: userId },
        data: { name }
      }),
      // Создаем или обновляем расширенный профиль
      prisma.profile.upsert({
        where: { userId: userId },
        update: { bio, gender, sportType, club, association, hrZones },
        create: { userId, fullName: name || "", bio, gender, sportType, club, association, hrZones }
      })
    ]);

    res.json({ success: true, profile: result[1] });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;