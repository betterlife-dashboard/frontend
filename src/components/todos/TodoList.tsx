import { useState } from 'react';
import type { TodoItem, TodoStatus, TodoType } from '@/types/todo';
import { formatRepeatDays, isTodayDate } from '@/utils/todo';

const formatDeadline = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const statusLabels: Record<TodoStatus, string> = {
  PLANNED: '예정',
  DONE: '완료',
  FAILED: '실패',
  CANCELED: '취소',
};

const typeLabels: Record<TodoType, string> = {
  GENERAL: '일반',
  WORK_STUDY: '업무/공부',
  WORKOUT: '운동',
  SCHEDULE: '일정',
};

interface TodoListProps {
  title: string;
  todos: TodoItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onStatusChange: (todo: TodoItem, status: TodoStatus) => Promise<void>;
  onDelete: (todo: TodoItem) => Promise<void>;
  onSelect?: (todo: TodoItem) => void;
  emptyMessage?: string;
}

export const TodoList = ({
  title,
  todos,
  isLoading = false,
  error,
  onRetry,
  onStatusChange,
  onDelete,
  onSelect,
  emptyMessage = '등록된 할 일이 없습니다.',
}: TodoListProps) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleStatusChange = async (todo: TodoItem, status: TodoStatus) => {
    setProcessingId(todo.id);
    try {
      await onStatusChange(todo, status);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (todo: TodoItem) => {
    if (!window.confirm('정말로 삭제하시겠어요?')) {
      return;
    }
    setProcessingId(todo.id);
    try {
      await onDelete(todo);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="card todo-card">불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="card todo-card">
        <div className="error-banner">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
        {onRetry ? (
          <button type="button" className="secondary-button" onClick={onRetry}>
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="card todo-card">
        <div className="empty-state">
          <strong>{emptyMessage}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="card todo-card" style={{ gap: '16px' }}>
      <div className="card-title">
        <h2 className="section-title" style={{ fontSize: '22px' }}>
          {title}
        </h2>
        <span className="text-caption">총 {todos.length}개</span>
      </div>
      {todos.map((todo) => {
        const repeatLabel = formatRepeatDays(todo.repeatDays);
        const deadlineLabel = formatDeadline(todo.activeUntil ?? todo.activeFrom);
        const metadataParts: string[] = [];
        if (todo.status !== 'PLANNED') {
          metadataParts.push(`상태: ${statusLabels[todo.status]}`);
        }
        metadataParts.push(`마감: ${deadlineLabel ?? '미정'}`);
        const canShowRepeat = Boolean(repeatLabel) && isTodayDate(todo.activeFrom) && isTodayDate(todo.activeUntil);
        if (canShowRepeat && repeatLabel) {
          metadataParts.push(`반복: ${repeatLabel}`);
        }
        return (
          <div
            key={todo.id}
            className={`todo-item type-${todo.type.toLowerCase()}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(todo)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(todo);
              }
            }}
          >
            <div className="todo-meta">
              <span className="todo-type">{typeLabels[todo.type]}</span>
              <div>
                <div className="todo-title">{todo.title}</div>
                <p className="text-caption">{metadataParts.join(' · ')}</p>
              </div>
            </div>
            <div className="todo-actions">
              {todo.status === 'PLANNED' ? (
                <button
                  type="button"
                  className="complete-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleStatusChange(todo, 'DONE');
                  }}
                  disabled={processingId === todo.id}
                >
                  완료
                </button>
              ) : null}
              <button
                type="button"
                className="muted-button"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDelete(todo);
                }}
                disabled={processingId === todo.id}
              >
                삭제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
