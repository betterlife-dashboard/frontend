import { useState } from 'react';
import type { TodoItem, TodoStatus, TodoType } from '@/types/todo';
import { formatRepeatDays, isTodayDate } from '@/utils/todo';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const formatDeadline = (value?: string | null, includeTime?: boolean) => {
  if (!value) {
    return null;
  }
  const hasTime = includeTime || value.includes('T');
  let date: Date | null = null;
  if (hasTime) {
    const candidate = new Date(value);
    if (!Number.isNaN(candidate.getTime())) {
      date = candidate;
    }
  } else {
    const dateOnly = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const candidate = new Date(`${dateOnly}T00:00:00`);
      if (!Number.isNaN(candidate.getTime())) {
        date = candidate;
      }
    }
  }

  const normalizedDate = date ?? new Date(value);
  if (Number.isNaN(normalizedDate.getTime())) {
    return null;
  }
  return includeTime ? dateTimeFormatter.format(normalizedDate) : dateFormatter.format(normalizedDate);
};

const statusLabels: Record<TodoStatus, string> = {
  PLANNED: '예정',
  DONE: '완료',
  CANCELLED: '취소',
  EXPIRED: '종료',
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
        const hasTime = (todo.activeUntil ?? todo.activeFrom)?.includes('T') || todo.type === 'SCHEDULE';
        const deadlineLabel = formatDeadline(todo.activeUntil ?? todo.activeFrom, hasTime);
        const metadataParts: string[] = [`마감: ${deadlineLabel ?? '미정'}`];
        const canShowRepeat = Boolean(repeatLabel) && isTodayDate(todo.activeFrom) && isTodayDate(todo.activeUntil);
        if (canShowRepeat && repeatLabel) {
          metadataParts.push(`반복: ${repeatLabel}`);
        }
        const statusLabel = statusLabels[todo.status];
        const statusClassName = `todo-status status-${todo.status.toLowerCase()}`;
        return (
          <div
            key={todo.id}
            className={`todo-item type-${todo.type.toLowerCase()} status-${todo.status.toLowerCase()}`}
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
                <div className="todo-title-row">
                  <div className="todo-title">{todo.title}</div>
                  <span className={statusClassName}>{statusLabel}</span>
                </div>
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
