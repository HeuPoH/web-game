import { makeAutoObservable, runInAction } from 'mobx';
import type { User } from '../types';

export class UserStore {
  private user: User | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User | null) {
    runInAction(() => {
      this.user = user;
    });
  }

  getUser() {
    return this.user;
  }

  get isAuthenticated() {
    return this.user !== null;
  }
}
