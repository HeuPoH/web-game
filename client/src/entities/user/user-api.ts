import { API } from '../../shared/api';
import type { User } from './types';

const PREFIX = 'auth';

type QuickRegistrationResult = { user: User & { password: string; } };
type AuthorizationResult = { user: User };
type CheckAuthorizationResult = { user: User };

export interface UserAPI {
  quickRegistration(login: string, signal?: AbortSignal): Promise<QuickRegistrationResult>;
  authorization(data: { login: string, password: string }, signal?: AbortSignal): Promise<AuthorizationResult>;
  checkAuthorization(signal?: AbortSignal): Promise<CheckAuthorizationResult | undefined>;
  logout(signal?: AbortSignal): Promise<void>;
}

export function userAPI(): UserAPI {
  return {
    quickRegistration: (login: string, signal?: AbortSignal) => {
      return API().post<{ login: string }, QuickRegistrationResult>(`${PREFIX}/quick-register`, { login }, { signal });
    },
    authorization: (data: { login: string, password: string }, signal?: AbortSignal) => {
      return API().post<{ login: string; password: string }, AuthorizationResult>(`${PREFIX}/login`, data, { signal });
    },
    checkAuthorization: (signal?: AbortSignal) => {
      return API().get<CheckAuthorizationResult | undefined>(`${PREFIX}/check`, { signal });
    },
    logout: (signal?: AbortSignal) => {
      return API().get(`${PREFIX}/logout`, { signal});
    }
  };
}
