import prisma from '../prisma/client.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import sharp from "sharp";

// Настройка S3 для Timeweb
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "ru-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Настройка Multer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// --- 1. Получение данных пользователя (ИСПРАВЛЕНО) ---
export async function getMe(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Используем include вместо select, чтобы получить ВСЕ поля User
      // (включая originalAvatarUrl) + связанные данные профиля
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Удаляем пароль из объекта перед отправкой
    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// --- 2. Загрузка аватара (Оригинал + Миниатюра) ---
export async function uploadAvatar(req, res) {
  try {
    const userId = req.user?.userId;
    const file = req.file;
    const { cropX, cropY, cropWidth, cropHeight } = req.body;

    if (!userId) return res.status(401).json({ error: 'Не авторизован' });
    if (!file) return res.status(400).json({ error: 'Файл не загружен' });

    const timestamp = Date.now();

    // 1. ПУТИ ДЛЯ S3
    const thumbFileName = `avatars/${userId}-${timestamp}-thumb.jpg`;
    const fullFileName = `avatars/${userId}-${timestamp}-full.jpg`;

    // 2. ОБРАБОТКА МИНИАТЮРЫ ЧЕРЕЗ SHARP
    let sharpInstance = sharp(file.buffer);

    if (cropX && cropY && cropWidth && cropHeight) {
      sharpInstance = sharpInstance.extract({
        left: Math.round(parseFloat(cropX)),
        top: Math.round(parseFloat(cropY)),
        width: Math.round(parseFloat(cropWidth)),
        height: Math.round(parseFloat(cropHeight))
      });
    }

    const thumbBuffer = await sharpInstance
      .resize(400, 400)
      .toFormat('jpeg')
      .toBuffer();

    // 3. ЗАГРУЗКА МИНИАТЮРЫ В S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: thumbFileName,
      Body: thumbBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    }));

    // 4. ЗАГРУЗКА ОРИГИНАЛА В S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fullFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }));

    // Формируем ссылки
    const avatarUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${thumbFileName}`;
    const originalUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fullFileName}`;

    // 5. ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatarUrl,
        originalAvatarUrl: originalUrl
      },
      include: {
        profile: true // Возвращаем обновленного юзера сразу с профилем
      }
    });

    res.json({
      message: "Успешно",
      avatarUrl: updatedUser.avatarUrl,
      originalAvatarUrl: updatedUser.originalAvatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Ошибка обработки изображения:', error);
    res.status(500).json({ error: 'Ошибка при обработке или загрузке фото' });
  }
}

// --- 3. Удаление аватара (БД + S3) ---
export async function deleteAvatar(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Не авторизован' });

    // 1. Сначала найдем пользователя, чтобы узнать пути к файлам в S3
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true, originalAvatarUrl: true }
    });

    if (user) {
      // Функция для извлечения Key (пути) из полного URL S3
      const getS3Key = (url) => {
        if (!url) return null;
        // Разбивает URL и берет всё, что после имени бакета
        const parts = url.split(`${process.env.S3_BUCKET_NAME}/`);
        return parts.length > 1 ? parts[1] : null;
      };

      const thumbKey = getS3Key(user.avatarUrl);
      const fullKey = getS3Key(user.originalAvatarUrl);

      // 2. Удаляем файлы из S3 (если они там есть)
      // Используем DeleteObjectCommand (нужно импортировать в начале файла)
      const deletePromises = [];
      if (thumbKey) {
        deletePromises.push(s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME, Key: thumbKey
        })));
      }
      if (fullKey) {
        deletePromises.push(s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME, Key: fullKey
        })));
      }
      await Promise.all(deletePromises).catch(err => console.error("Ошибка удаления из S3:", err));
    }

    // 3. Обнуляем ссылки в базе данных
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
        originalAvatarUrl: null
      },
      include: {
        profile: true
      }
    });

    res.json({ message: "Фото удалено", user: updatedUser });
  } catch (error) {
    console.error('Ошибка при удалении аватара:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении фото' });
  }
}