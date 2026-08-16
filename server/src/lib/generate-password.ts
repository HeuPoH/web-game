import { randomInt } from 'node:crypto';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Генерирует случайный пароль заданной длины.
 * Использует криптостойкий генератор randomInt из модуля crypto.
 *
 * @param length - длина пароля (по умолчанию 12 символов)
 * @param includeSpecial - включать ли специальные символы !@#$%^&*()_+[]{}<>? (по умолчанию true)
 * @returns строка, содержащая случайный пароль
 *
 * @example
 * // Пароль длиной 10 символов без спецсимволов
 * const pwd = generatePassword(10, false);
 * // Пример результата: "aB3kL9pQ2r"
 *
 * @example
 * // Пароль длиной 16 символов со спецсимволами
 * const pwd = generatePassword(16, true);
 * // Пример результата: "kD8#mQ2$zL9pXy7!"
 */
export function generatePassword(
  length: number = 12,
  includeSpecial: boolean = true,
): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+[]{}<>?';
  let chars = letters + digits;
  if (includeSpecial) {
    chars += special;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[randomInt(chars.length)];
  }
  return password;
}

const scryptAsync = promisify(scrypt);

/**
 * Хеширует пароль с солью, используя scrypt.
 * @param password - пароль (строка)
 * @returns строка вида "соль:хеш" (hex)
 */
export async function passwordHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex'); // 16 байт соли
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer; // 64 байта хеша
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Проверяет, соответствует ли пароль сохранённому хешу.
 * @param password - проверяемый пароль
 * @param hashedPassword - строка вида "соль:хеш"
 * @returns true, если пароль верный
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const [salt, key] = hashedPassword.split(':') as [string, string];
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return key === derivedKey.toString('hex');
}
