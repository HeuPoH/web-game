import { v4 as uuidv4 } from 'uuid';

/**
 * Генерирует уникальный идентификатор UUID версии 4 (случайный).
 *
 * UUID v4 создаётся на основе криптостойких случайных чисел,
 * что обеспечивает высокую вероятность уникальности.
 *
 * @returns строка, содержащая UUID в формате "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 *
 * @example
 * const id = generateId();
 * console.log(id); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 */
export function generateId() {
  return uuidv4();
}
