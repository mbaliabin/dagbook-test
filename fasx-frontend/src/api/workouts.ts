import express from 'express'
import { prisma } from '../prisma'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/api/workouts', authenticateToken, async (req, res) => {
  const userId = req.user.userId

  const {
    name,
    type,
    duration,
    distance,
    comment,
    effort,
    feeling,
    zone1Min,
    zone2Min,
    zone3Min,
    zone4Min,
    zone5Min,
    date,
  } = req.body

  try {
    const workout = await prisma.workout.create({
      data: {
        userId,
        name,
        type,
        duration,
        distance,
        comment,
        effort,
        feeling,
        zone1Min: zone1Min || 0,
        zone2Min: zone2Min || 0,
        zone3Min: zone3Min || 0,
        zone4Min: zone4Min || 0,
        zone5Min: zone5Min || 0,
        date: new Date(date), // преобразуем дату в Date
      },
    })

    res.status(201).json(workout)
  } catch (error) {
    console.error("Ошибка создания тренировки:", error)
    res.status(500).json({ error: "Ошибка сервера" })
  }
})

export default router

