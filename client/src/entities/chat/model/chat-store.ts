import type { ChatMessage } from '@game/shared-types';
import { makeAutoObservable, runInAction } from 'mobx';

export class ChatStore {
  private messages: ChatMessage[] = [];
  private newMessages = false;

  constructor() {
    makeAutoObservable(this);
  }

  dispose() {
    this.messages = [];
  }

  getMessages() {
    return this.messages;
  }

  addMessage(message: ChatMessage) {
    runInAction(() => {
      this.messages = [...this.messages, message];
      this.newMessages = true;
    });
  }

  hasNewMessages() {
    return this.newMessages;
  }

  setAllMessagesRead() {
    runInAction(() => {
      this.newMessages = false;
    });
  }

  prependMessages(messages: ChatMessage[]): void {
    runInAction(() => {
      const existingIds = new Set(this.messages.map(m => m.id));
      const newMessages = messages.filter(m => !existingIds.has(m.id));
      this.messages = [...newMessages, ...this.messages];
    });
  }
}
