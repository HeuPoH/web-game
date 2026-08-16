import type { ChatMessage, ChatMessagePayload } from '@game/shared-types';

export class ChatEntity {
  private messages: ChatMessage[] = [];

  addMessage(m: ChatMessagePayload) {
    const id = `${this.messages.length}`;
    const timestamp = Date.now();
    const message = { ...m, id, timestamp };
    this.messages.push(message);
    return message;
  }

  getMessages() {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
