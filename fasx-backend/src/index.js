import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import profileRoutes from './routes/profile.js'
import workoutRoutes from './routes/workouts.js'  // Импорт роутов тренировок
import dailyInformationRouter from './routes/dailyInformation.js';

dotenv.config()

// Проверка ключевых переменных окружения
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('DATABASE_URL =', process.env.DATABASE_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : undefined);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const app = express()
const PORT = process.env.PORT || 4000
const prisma = new PrismaClient()

// Используем FRONTEND_URL из .env или дефолт
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({
  origin: true,   // разрешаем все источники
  credentials: true,
}))

app.use(express.json())

// Подключаем роуты с префиксами
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/workouts', workoutRoutes)
app.use("/api/daily-information", dailyInformationRouter);

// Проверка соединения с БД
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected', timestamp: new Date() })
  } catch (err) {
    console.error('Database connection error:', err)
    res.status(500).json({ status: 'error', database: 'disconnected', timestamp: new Date() })
  }
})

app.get('/', (req, res) => {
  res.send('🚀 FASX API работает!')
})

// Пример API для получения всех пользователей
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка при получении пользователей' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://0.0.0.0:${PORT}`)
})
