export type NotifyEventType = 'REMINDER' | 'DEADLINE' | 'SUMMARY' | 'TIMER';

export interface WebNotify {
  id?: number;
  userId?: number;
  eventType?: NotifyEventType;
  notifyType?: NotifyEventType;
  title?: string;
  body?: string;
  sendAt?: string;
  todoId?: number;
  remainTime?: string;
  link?: string;
}

export interface FcmTokenResponse {
  userId: number;
  token: string;
  updatedAt: string;
  enabled: boolean;
}
