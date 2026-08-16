import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';

import { createAuthRouter } from './api/routes/auth.js';
import { createRoomsRouter } from './api/routes/rooms.js';
import { initSocket } from './api/socket/index.js';
import { getContainer, init } from './init.js';
import { logger } from './lib/logger.js';

const API_PREFIX = '/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export default (() => {
  try {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
      cookie: true,
      cors: {
        origin: CLIENT_URL,
        credentials: true,
      },
      path: `${API_PREFIX}/socket.io`,
    });

    const container = getContainer();
    init(container);
    initSocket(io, container);

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            scriptSrc: ["'self'"], // разрешать только свои скрипты
            styleSrc: ["'self'", "'unsafe-inline'"], // если нужны inline-стили
            connectSrc: ["'self'", 'wss:', 'https:'], // для WebSocket
            // другие директивы по необходимости
          },
        },
      }),
    ); // Защита от известных уязвимостей
    app.use(compression()); // Сжатие ответов (gzip)

    app.use(
      cors({
        origin: CLIENT_URL,
        credentials: true, // разрешить передачу кук
      }),
    );

    app.use(morgan('combined')); // логирование запросов
    app.use(express.json()); // парсинг JSON тела
    app.use(cookieParser()); // парсинг cookie (для req.cookies)

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 100, // максимум 100 запросов с одного IP
      message: { error: 'Too many requests, please try again later.' },
    });

    if (process.env.NODE_ENV === 'production') {
      const staticPath = path.join(__dirname, 'public');
      app.use(express.static(staticPath));

      // SPA fallback: все запросы, кроме /api, ведут к index.html
      app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(staticPath, 'index.html'));
      });
    }

    app.get('/health', (_req, res) => {
      res
        .status(200)
        .json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.use(`${API_PREFIX}/auth`, authLimiter, createAuthRouter(container));
    app.use(`${API_PREFIX}/rooms`, createRoomsRouter(container));

    app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((err: any, req: express.Request, res: express.Response) => {
      logger.error({ err, path: req.path }, 'Unhandled error');
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const PORT = process.env.PORT || 4000;

    server.listen(PORT, () => {
      logger.info(
        { port: PORT, env: process.env.NODE_ENV || 'development' },
        'Server started',
      );
    });

    return server;
  } catch (error) {
    logger.fatal({ err: error }, 'Unhandled exception during startup');
  }
})();
