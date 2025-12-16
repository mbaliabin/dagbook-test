import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import cors from 'cors';

const router = express.Router();

// --- ЛОКАЛЬНАЯ НАСТРОЙКА CORS ТОЛЬКО ДЛЯ ЭТОГО РОУТА ---
// Это гарантирует, что PUT и OPTIONS запросы не будут блокироваться браузером
const localCors = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});

// Применяем CORS ко всем запросам в этом файле
router.use(localCors);
router.options('*', localCors);

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
        profile: true // Подтягиваем данные из связанной таблицы Profile
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
    const userId = req.user.userId;
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    // Используем транзакцию, чтобы обновить и User (имя), и Profile (остальное)
    const result = await prisma.$transaction([
      // 1. Обновляем имя в основной таблице User
      prisma.user.update({
        where: { id: userId },
        data: { name }
      }),
      // 2. Создаем или обновляем запись в таблице Profile
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

    // Возвращаем обновленный профиль (результат второй операции в транзакции)
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