import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
// Импортируем контроллеры и настройку multer (upload)
import { getMe, uploadAvatar, upload } from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Получить данные текущего авторизованного пользователя
 * @access  Private
 */
router.get('/me', authenticateToken, getMe);

/**
 * @route   POST /api/users/upload-avatar
 * @desc    Загрузка фотографии профиля в S3 (Timeweb)
 * @access  Private
 * @note    Использует multer для обработки multipart/form-data
 */
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

export default router;