export type TodoType = 'GENERAL' | 'WORK_STUDY' | 'WORKOUT' | 'SCHEDULE';

export type TodoStatus = 'PLANNED' | 'DONE' | 'FAILED' | 'CANCELED';

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

export interface TodoRequestPayload {
  title: string;
  type: TodoType;
  status: TodoStatus;
  repeatDays?: number | null;
  activeFrom?: string | null;
  activeUntil?: string | null;
}

export interface TodoUpdatePayload {
  title: string;
  type: TodoType;
  status: TodoStatus;
  activeFrom: string;
  activeUntil: string;
}

export interface RepeatTodoUpdatePayload {
  title: string;
  type: TodoType;
  repeatDays: number;
}
