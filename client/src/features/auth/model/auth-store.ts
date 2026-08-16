import { makeAutoObservable, runInAction } from 'mobx';
import type { UserStore, UserAPI } from '../../../entities/user';

export class AuthStore {
  private loading = false;

  constructor(
    private userAPI: UserAPI,
    private userStore: UserStore
  ) {
    makeAutoObservable(this);
  }

  get isLoading() {
    return this.loading;
  }

  async quickRegister(login: string) {
    try {
      this.setLoading(true);
      const result = await this.userAPI.quickRegistration(login);
      this.userStore.setUser(result.user);
      return result.user;
    } catch (error) {
      console.log('Не удалось зарегистрироваться');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async checkAuth() {
    try {
      this.setLoading(true);
      const result = await this.userAPI.checkAuthorization();
      if (!result) {
        throw new Error('Не получилось восстановить данные пользователя');
      }

      this.userStore.setUser(result.user);
    } catch (error) {
      console.log('Не получилось восстановить данные пользователя');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async authorization(login: string, password: string) {
    try {
      this.setLoading(true);
      const result = await this.userAPI.authorization({ login, password });
      this.userStore.setUser(result.user);
    } catch (error) {
      console.log('Не удалось войти');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async logout() {
    try {
      this.setLoading(true);
      await this.userAPI.logout();
      this.userStore.setUser(null);
    } catch (error) {
      console.log('Не удалось выйти аз аккаунта');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean) {
    runInAction(() => this.loading = loading);
  }
}
