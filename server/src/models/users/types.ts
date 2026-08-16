/**
 * Полная модель пользователя в базе данных (DTO)
 */
export type UserDTO = {
  id: string;
  login: string;
  password: string; // хеш пароля
  nickname: string;
};

/**
 * Публичные данные пользователя, отправляемые клиенту
 */
export type PublicUser = {
  id: string;
  login: string;
  nickname: string;
};

/**
 * Данные для регистрации нового пользователя
 */
export type UserRegistrationData = {
  login: string;
  password: string;
  nickname: string;
};

/**
 * Данные для входа существующего пользователя
 */
export type UserLoginData = {
  login: string;
  password: string;
};

/**
 * Данные для быстрой (гостевой) регистрации
 */
export type QuickRegistrationData = {
  login: string;
};

/**
 * Преобразует UserDTO в PublicUser (исключая пароль)
 */
export function toPublicUser(user: UserDTO): PublicUser {
  return {
    id: user.id,
    login: user.login,
    nickname: user.nickname,
  };
}
