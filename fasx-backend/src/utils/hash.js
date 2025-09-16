import bcrypt from 'bcrypt';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}
export async function comparePasswords(inputPassword, hashedPassword) {
  return bcrypt.compare(inputPassword, hashedPassword);
}
