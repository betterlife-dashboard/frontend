import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePickerButton } from '@/components/common/DatePickerButton';
import { AppLayout } from '@/components/layout/AppLayout';
import { CreateTodoModal } from '@/components/todos/CreateTodoModal';
import { TodoDetailModal } from '@/components/todos/TodoDetailModal';
import { TodoList } from '@/components/todos/TodoList';
import { useTodos } from '@/hooks/useTodos';
import type { TodoItem, TodoRequestPayload, TodoStatus, TodoUpdatePayload } from '@/types/todo';

const formatKoreanDate = (date: string) => {
  const target = new Date(date);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(target);
};

const makeUpdatePayload = (todo: TodoItem, status: TodoStatus, fallbackDate: string): TodoUpdatePayload => ({
  title: todo.title,
  type: todo.type,
  status,
  activeFrom: todo.activeFrom ?? fallbackDate,
  activeUntil: todo.activeUntil ?? fallbackDate,
});

const Home = () => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const { items, currentDate, changeDate, isLoading, error, fetchTodos, createTodo, updateTodo, deleteTodo } =
    useTodos();

  const headerDateLabel = useMemo(() => formatKoreanDate(currentDate), [currentDate]);
  const visibleTodos = useMemo(
    () =>
      items.filter((todo) => {
        const repeat = todo.repeatDays ?? 0;
        const hasScheduledRange = Boolean(todo.activeFrom) || Boolean(todo.activeUntil);
        if (repeat > 0 && !hasScheduledRange) {
          return false;
        }
        return true;
      }),
    [items],
  );

  const plannedTodos = useMemo(
    () =>
      [...visibleTodos.filter((todo) => todo.status === 'PLANNED')].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      }),
    [visibleTodos],
  );
  const doneTodos = useMemo(
    () =>
      [...visibleTodos.filter((todo) => todo.status === 'DONE')].sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [visibleTodos],
  );
  const cancelledAndExpiredTodos = useMemo(
    () =>
      [
        ...visibleTodos.filter((todo) => todo.status === 'CANCELLED' || todo.status === 'EXPIRED'),
      ].sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [visibleTodos],
  );

  const showFeedback = (message: string) => {
    setFeedback(message);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, 3000);
  };

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  const handleCreate = async (payload: TodoRequestPayload) => {
    const prepared: TodoRequestPayload = {
      ...payload,
      activeFrom: payload.activeFrom ?? currentDate,
      activeUntil: payload.activeUntil ?? currentDate,
    };
    await createTodo(prepared);
    showFeedback('새로운 할 일을 추가했습니다!');
  };

  const handleStatusChange = async (todo: TodoItem, status: TodoStatus) => {
    const payload = makeUpdatePayload(todo, status, currentDate);
    await updateTodo(todo.id, payload);
    const statusLabel =
      status === 'DONE' ? '완료' : status === 'CANCELLED' ? '취소' : status === 'EXPIRED' ? '종료' : '예정';
    showFeedback(`"${todo.title}" 상태를 ${statusLabel}로 변경했습니다.`);
  };

  const handleDelete = async (todo: TodoItem) => {
    await deleteTodo(todo.id);
    showFeedback(`"${todo.title}" 할 일을 삭제했습니다.`);
  };

  const handleDetailUpdate = async (id: number, payload: TodoUpdatePayload) => {
    await updateTodo(id, payload);
    showFeedback('할 일을 수정했습니다.');
  };

  const handleDetailDelete = async (id: number) => {
    const target = items.find((todo) => todo.id === id);
    await deleteTodo(id);
    showFeedback(target ? `"${target.title}" 할 일을 삭제했습니다.` : '할 일을 삭제했습니다.');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="section-title">오늘의 할 일</h1>
          <p className="text-caption">{headerDateLabel}</p>
        </div>
        <div className="todo-toolbar">
          <button type="button" className="primary-button" onClick={() => setIsCreateModalOpen(true)}>
            할 일 추가
          </button>
          <DatePickerButton value={currentDate} onChange={(next) => changeDate(next)} label="조회 날짜 선택" />
          <button type="button" className="secondary-button" onClick={() => void fetchTodos(currentDate)}>
            새로고침
          </button>
        </div>
      </div>
      {feedback ? <div className="success-banner">{feedback}</div> : null}
      <div className="todo-layout">
        <TodoList
          title="예정된 할 일"
          todos={plannedTodos}
          isLoading={isLoading}
          error={error}
          onRetry={() => void fetchTodos(currentDate)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelect={setSelectedTodo}
          emptyMessage="예정된 할 일이 없습니다. 새로운 할 일을 추가해보세요."
        />
        <TodoList
          title="완료된 할 일"
          todos={doneTodos}
          isLoading={isLoading}
          error={null}
          onRetry={() => void fetchTodos(currentDate)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelect={setSelectedTodo}
          emptyMessage="완료된 할 일이 없습니다."
        />
        <TodoList
          title="취소되거나 종료된 할 일"
          todos={cancelledAndExpiredTodos}
          isLoading={isLoading}
          error={null}
          onRetry={() => void fetchTodos(currentDate)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelect={setSelectedTodo}
          emptyMessage="취소되거나 종료된 할 일이 없습니다."
        />
      </div>
      <CreateTodoModal
        isOpen={isCreateModalOpen}
        selectedDate={currentDate}
        onSubmit={handleCreate}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <TodoDetailModal
        todo={selectedTodo}
        isOpen={Boolean(selectedTodo)}
        onUpdate={handleDetailUpdate}
        onDelete={handleDetailDelete}
        onClose={() => setSelectedTodo(null)}
      />
    </AppLayout>
  );
};

export default Home;
