// src/prisma/client.js
import { PrismaClient } from '@prisma/client';  // импорт из пакета
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export default prisma;

