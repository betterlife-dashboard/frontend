export type TodoType = 'GENERAL' | 'WORK_STUDY' | 'WORKOUT' | 'SCHEDULE';

export type TodoStatus = 'PLANNED' | 'DONE' | 'CANCELLED' | 'EXPIRED';

export interface TodoItem {
  id: number;
  title: string;
  type: TodoType;
  status: TodoStatus;
  repeatDays?: number | null;
  activeFrom?: string | null;
  activeUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseTodoRequestPayload {
  title: string;
  type: TodoType;
  status: TodoStatus;
  activeFrom?: string | null;
  activeUntil?: string | null;
}

export interface GeneralTodoRequestPayload extends BaseTodoRequestPayload {
  repeatDays?: number | null;
}

export interface ScheduleTodoRequestPayload extends BaseTodoRequestPayload {
  alarms: string[];
}

export type TodoRequestPayload = GeneralTodoRequestPayload | ScheduleTodoRequestPayload;

export interface BaseTodoUpdatePayload {
  title: string;
  type: TodoType;
  status: TodoStatus;
  activeFrom: string;
  activeUntil: string;
}

export interface GeneralTodoUpdatePayload extends BaseTodoUpdatePayload {
  repeatDays?: number | null;
}

export interface ScheduleTodoUpdatePayload extends BaseTodoUpdatePayload {
  alarms: string[];
}

export type TodoUpdatePayload = GeneralTodoUpdatePayload | ScheduleTodoUpdatePayload;

export interface RepeatTodoUpdatePayload {
  title: string;
  type: TodoType;
  repeatDays: number;
}
