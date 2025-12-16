import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import cors from 'cors';

const router = express.Router();

// 1. Настройка локального CORS
const localCors = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});

// 2. Сначала разрешаем OPTIONS для всех путей в этом роутере БЕЗ проверки токена
// Это ответит браузеру 200 OK на предварительный запрос, и он отправит основной PUT
router.options('*', localCors, (req, res) => {
  res.sendStatus(200);
});

// 3. Применяем CORS для остальных методов
router.use(localCors);

// --- GET: ПОЛУЧЕНИЕ ПРОФИЛЯ ---
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
        profile: true
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("GET Profile Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// --- PUT: ОБНОВЛЕНИЕ ПРОФИЛЯ ---
router.put("/", authenticateToken, async (req, res) => {
  console.log(">>> [PUT] Запрос дошел до роута профиля");

  try {
    // ВАЖНО: Проверь в консоли бэкенда, что тут не undefined.
    // Если в токене лежит просто 'id', замени userId на id.
    const userId = req.user.userId;
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name }
      }),
      prisma.profile.upsert({
        where: { userId: userId },
        update: {
          bio,
          gender,
          sportType,
          club,
          association,
          hrZones
        },
        create: {
          userId,
          fullName: name || "",
          bio,
          gender,
          sportType,
          club,
          association,
          hrZones
        }
      })
    ]);

    console.log(">>> Данные успешно сохранены для userId:", userId);
    res.json({ success: true, profile: result[1] });

  } catch (error) {
    console.error("!!! ОШИБКА PUT ПРОФИЛЯ:", error.message);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message
    });
  }
});

export default router;