import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true } // убираем пароль
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
});

export default router;

