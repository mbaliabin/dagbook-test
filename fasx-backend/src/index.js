import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import profileRoutes from './routes/profile.js'
import workoutRoutes from './routes/workouts.js'  // Импорт роутов тренировок

dotenv.config()
console.log('JWT_SECRET:', process.env.JWT_SECRET);

console.log('DATABASE_URL =', process.env.DATABASE_URL)

const app = express()
const PORT = process.env.PORT || 4000

const prisma = new PrismaClient()

const frontendUrl = 'http://87.249.50.183:5173'

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

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`  // проверка базы
    res.json({ status: 'ok', database: 'connected', timestamp: new Date() })
  } catch (err) {
    console.error('Database connection error:', err)
    res.status(500).json({ status: 'error', database: 'disconnected', timestamp: new Date() })
  }
})

app.get('/', (req, res) => {
  res.send('🚀 FASX API работает!')
})

// Пример API для получения всех пользователей (можно убрать, если не нужно)
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

