import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import type { PublicUser } from '~/models/users/types.js';

/**
 * Генерирует JWT токен с указанными данными и сроком действия.
 *
 * @template T - Тип данных, помещаемых в токен.
 * @param {T} data - Объект с данными для включения в токен.
 * @param {SignOptions['expiresIn']} expiresIn - Время жизни токена (например, '1h', '7d', 3600).
 * @returns {string} Подписанный JWT токен.
 */
export function generateToken<T extends object>(
  data: T,
  expiresIn: SignOptions['expiresIn'],
) {
  const privateKey = process.env.PRIVATE_KEY!;
  return jwt.sign(data, privateKey, { expiresIn });
}

/**
 * Проверяет и декодирует JWT токен. Если токен валиден, возвращает его содержимое,
 * иначе выбрасывает ошибку.
 *
 * @param {string} token - JWT токен для проверки.
 * @returns {string | JwtPayload} Декодированные данные токена (обычно объект).
 * @throws {JsonWebTokenError} Если токен недействителен, просрочен или имеет неверную подпись.
 */
export function verifyToken(token: string) {
  const privateKey = process.env.PRIVATE_KEY!;
  return jwt.verify(token, privateKey);
}

/**
 * Декодирует JWT токен без проверки подписи. Возвращает полезную нагрузку (payload).
 *
 * @param {string} token - JWT токен.
 * @returns {JwtPayload | string | null} Декодированные данные:
 *  - объект JwtPayload, если токен содержит JSON-объект,
 *  - строка, если токен содержит строку,
 *  - null, если токен не удалось декодировать.
 */
export function parseToken(token: string): JwtPayload | string | null {
  return jwt.decode(token);
}

/**
 * Извлекает данные пользователя из JWT токена и приводит их к типу PublicUser.
 * Выбрасывает ошибки, если токен пустой или данные имеют неверный формат.
 *
 * @param {string} token - JWT токен пользователя.
 * @returns {PublicUser | undefined} Объект с данными пользователя, соответствующий типу PublicUser либо undefined.
 */
export function getUserDataFromToken(token: string) {
  const payload = parseToken(token);
  if (!payload) {
    return;
  }

  if (typeof payload === 'string') {
    return;
  }

  return payload as PublicUser;
}
