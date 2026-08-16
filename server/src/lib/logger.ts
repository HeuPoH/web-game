import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  base: undefined,
  formatters: {
    level: label => ({ level: label }),
  },
});

export function getTextForGame(str: string) {
  return `[Game] ${str}`;
}

export function getTextForLobby(str: string) {
  return `[Lobby] ${str}`;
}
