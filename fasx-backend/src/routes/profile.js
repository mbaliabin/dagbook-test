import express from "express";
import prisma from "../prisma/client.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ПОЛУЧЕНИЕ ПРОФИЛЯ ---
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

// --- ОБНОВЛЕНИЕ ПРОФИЛЯ (С ЛОГАМИ) ---
router.put("/", authenticateToken, async (req, res) => {
  console.log(">>> [PUT] Запрос на обновление получен");
  console.log(">>> UserID из токена:", req.user.userId);
  console.log(">>> Тело запроса (body):", JSON.stringify(req.body, null, 2));

  try {
    const userId = req.user.userId;
    const { name, bio, gender, sportType, club, association, hrZones } = req.body;

    // Выполняем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // 1. Обновляем имя пользователя
      const userUpdate = await tx.user.update({
        where: { id: userId },
        data: { name }
      });
      console.log(">>> 1/2 Успешно обновлен User:", userUpdate.id);

      // 2. Обновляем или создаем профиль
      const profileUpsert = await tx.profile.upsert({
        where: { userId: userId },
        update: {
          bio,
          gender,
          sportType,
          club,
          association,
          hrZones // Убедись, что это объект
        },
        create: {
          userId,
          fullName: name || "Не указано",
          bio,
          gender,
          sportType,
          club,
          association,
          hrZones
        }
      });
      console.log(">>> 2/2 Успешно выполнен Upsert профиля:", profileUpsert.id);

      return { userUpdate, profileUpsert };
    });

    console.log(">>> Транзакция завершена успешно!");
    res.json({ success: true, profile: result.profileUpsert });

  } catch (error) {
    console.error("!!! ОШИБКА ОБНОВЛЕНИЯ ПРОФИЛЯ !!!");
    console.error("Тип ошибки:", error.constructor.name);
    console.error("Сообщение:", error.message);

    // Если ошибка в Prisma, она даст код (например, P2002)
    if (error.code) console.error("Код ошибки Prisma:", error.code);

    res.status(500).json({
      error: "Failed to update profile",
      details: error.message
    });
  }
});

export default router;