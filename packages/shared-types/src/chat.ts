export type ChatMessagePayload = {
  login: string;
  message: string;
};

export type ChatMessage = ChatMessagePayload & {
  id: string;
  timestamp: number;
};