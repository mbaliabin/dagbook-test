import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Глобальная настройка заголовков для этого роута.
 * Это решает проблему со статусом 204 (OPTIONS), отвечая браузеру 200 OK
 * и разрешая передачу заголовка Authorization.
 */
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- GET: ПОЛУЧЕНИЕ ПРОФИЛЯ ---
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Проверяем оба варианта ключа, так как в разных проектах jwt payload может отличаться
    const userId = req.user.userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
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
  console.log(">>> [PUT] Запрос получен для userId:", req.user.userId || req.user.id);

  try {
    const userId = req.user.userId || req.user.id;
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    // Выполняем обновление в базе данных
    const result = await prisma.$transaction([
      // 1. Обновляем имя пользователя в таблице User
      prisma.user.update({
        where: { id: userId },
        data: { name }