import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { deleteAvatar } from '../controllers/userController.js';

const router = express.Router();

// Настройка заголовков для работы CORS и предзапросов OPTIONS
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

/// --- GET: Получение профиля ---
 router.get("/", authenticateToken, async (req, res) => {
   try {
     const userId = req.user.userId || req.user.id;

     const user = await prisma.user.findUnique({
       where: { id: userId },
       // ДОБАВЛЯЕМ originalAvatarUrl В ВЫБОРКУ
       select: {
         id: true,
         name: true,
         email: true,
         avatarUrl: true,
         originalAvatarUrl: true, // <-- ОБЯЗАТЕЛЬНО ДОБАВИТЬ ЭТО
         profile: true
       },
     });

     if (!user) return res.status(404).json({ error: "User not found" });

     // Возвращаем объект пользователя, который теперь содержит всё необходимое
     res.json(user);
   } catch (error) {
     console.error("GET Profile Error:", error);
     res.status(500).json({ error: "Server error" });
   }
 });

// --- PUT: Обновление профиля ---
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name }
      }),
      prisma.profile.upsert({
        where: { userId: userId },
        update: { bio, gender, sportType, club, association, hrZones },
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

    res.json({ success: true, profile: result[1] });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.delete("/delete-avatar", authenticateToken, deleteAvatar);
export default router;
