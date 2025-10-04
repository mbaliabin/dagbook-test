import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Проверка переменных окружения
const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, FRONTEND_URL } = process.env;

if (!EMAIL_USER || !EMAIL_PASS || !SMTP_HOST || !SMTP_PORT || !FRONTEND_URL) {
  console.error("Ошибка: пропущены переменные окружения для email или фронтенда!");
  process.exit(1);
}

console.log("EMAIL_USER:", EMAIL_USER);
console.log("SMTP_HOST:", SMTP_HOST);
console.log("SMTP_PORT:", SMTP_PORT);
console.log("FRONTEND_URL:", FRONTEND_URL);

// Настройка транспортера для отправки писем через SMTPS (порт 465)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // true для SMTPS (465)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
      },
    });

    const verifyUrl = `${FRONTEND_URL}/verify-test?token=${verificationToken}&email=${email}`;

    try {
      // Отправка письма
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: "Подтвердите регистрацию на Fasx",
        html: `<p>Привет, ${name}! Чтобы подтвердить аккаунт, перейдите по ссылке:</p>
               <a href="${verifyUrl}">${verifyUrl}</a>`,
      });
      console.log(`Письмо успешно отправлено на ${email}`);
    } catch (mailErr) {
      console.warn("Письмо не отправлено:", mailErr);
      // Пользователь создан, но письмо не ушло
    }

    return res.status(201).json({
      message: "Пользователь создан. Проверьте почту для подтверждения аккаунта",
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
