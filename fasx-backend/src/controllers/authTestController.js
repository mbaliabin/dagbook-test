import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Настройка транспортера для отправки писем
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerTest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email уже зарегистрирован" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-test?token=${verificationToken}&email=${email}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Подтвердите регистрацию на Fasx",
      html: `<p>Привет, ${name}! Чтобы подтвердить аккаунт, перейдите по ссылке:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    return res.status(201).json({ message: "Проверьте почту для подтверждения аккаунта" });
  } catch (err: any) {
    console.error("RegisterTest Error:", err);
    return res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

export const verifyTest = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) return res.status(400).send("Неверный запрос");

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
    console.error(err);
    return res.status(500).send("Ошибка сервера");
  }
};
