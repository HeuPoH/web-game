import { Router } from 'express';

import {
  validateAuthorization,
  validateQuickRegister,
} from '~/api/routes/middlewares/auth-validator.js';
import { validateToken } from '~/api/routes/middlewares/common.js';
import type { IContainer } from '~/lib/container.js';

import { IAuthService } from '../../services/auth-service.js';
import { AuthController } from '../controllers/auth-controller.js';

export function createAuthRouter(container: IContainer) {
  const router = Router();
  const authService = container.getSilent(IAuthService);
  const controller = new AuthController(authService);

  router.post(
    '/quick-register',
    validateQuickRegister,
    controller.quickRegister,
  );
  router.post('/login', validateAuthorization, controller.authorization);
  router.get('/check', validateToken, controller.checkAuthorization);
  router.get('/logout', validateToken, controller.logout);

  return router;
}
