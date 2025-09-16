import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  console.log('Authorization header:', authHeader);
  console.log('Extracted token:', token);
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

  if (!token) {
    console.warn('Требуется токен авторизации');
    return res.status(401).json({ error: 'Требуется токен авторизации' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token payload:', decoded);

    req.user = decoded; // Теперь можно использовать req.user.userId
    next();
  } catch (err) {
    console.error('Ошибка валидации токена:', err.message);
    return res.status(403).json({ error: 'Невалидный токен' });
  }
}

