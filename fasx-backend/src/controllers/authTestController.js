import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
// import nodemailer from "nodemailer"; // временно не используем

const prisma = new PrismaClient();

// Проверка переменных окружения
const { FRONTEND_URL } = process.env;

if (!FRONTEND_URL) {
  console.error("Ошибка: пропущена переменная окружения FRONTEND_URL!");
  process.exit(1);
}

export const registerTest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Создание пользователя в БД
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
      },
    });

    // Генерация ссылки для подтверждения
    const verifyUrl = `${FRONTEND_URL}/verify-test?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Логируем ссылку вместо отправки письма
    console.log(`=== ТЕСТОВАЯ ССЫЛКА ДЛЯ ПОДТВЕРЖДЕНИЯ ===`);
    console.log(verifyUrl);
    console.log(`==========================================`);

    return res.status(201).json({
      message: "Пользователь создан. Ссылка для подтверждения выведена в консоль (тест).",
    });
  } catch (err) {
    console.error("RegisterTest Error:", err);
    return res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

export const verifyTest = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).send("Неверный запрос");
    }

    const user = await prisma.user.findUnique({ where: { email: String(email) } });
    if (!user) return res.status(404).send("Пользователь не найден");

    if (user.isVerified) return res.send("Аккаунт уже подтверждён");
    if (user.verificationToken !== token) return res.status(400).send("Неверный токен");

    await prisma.user.update({
      where: { email: String(email) },
      data: { isVerified: true, verificationToken: null },
    });

    return res.send("Аккаунт успешно подтверждён!");
  } catch (err) {
    console.error("VerifyTest Error:", err);
    return res.status(500).send("Ошибка сервера");
  }
};
