import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScheduleCalendar } from '@/components/todos/ScheduleCalendar';
import { TodoDetailModal } from '@/components/todos/TodoDetailModal';
import { apiClient } from '@/services/apiClient';
import type { TodoItem, TodoUpdatePayload } from '@/types/todo';

const toMonthStart = (value: string) => {
  if (!value) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
  const month = value.slice(0, 7);
  return `${month}-01`;
};

const ScheduleCalendarPage = () => {
  const [currentMonthStart, setCurrentMonthStart] = useState<string>(() => toMonthStart(''));
  const [items, setItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);

  const scheduleTodos = useMemo(() => items.filter((todo) => todo.type === 'SCHEDULE'), [items]);

  const fetchMonth = useCallback(async (monthStart: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<TodoItem[]>(`/todo/schedule/${monthStart}`);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '일정을 불러오지 못했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMonth(currentMonthStart);
  }, [currentMonthStart, fetchMonth]);

  const handleMonthChange = (next: string) => {
    setCurrentMonthStart(toMonthStart(next));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="section-title">일정 캘린더</h1>
          <p className="text-caption">월 단위 일정만 표시합니다.</p>
          <p className="text-caption" style={{ marginTop: '4px' }}>
            {Number(currentMonthStart.slice(5, 7))}월 일정
          </p>
        </div>
        <div className="todo-toolbar">
          <label className="text-caption" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            조회 월 선택
            <input
              type="month"
              value={currentMonthStart.slice(0, 7)}
              onChange={(e) => handleMonthChange(`${e.target.value}-01`)}
              className="date-input"
              style={{ width: '150px' }}
            />
          </label>
          <button type="button" className="secondary-button" onClick={() => void fetchMonth(currentMonthStart)}>
            새로고침
          </button>
        </div>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      {isLoading ? <div className="card">불러오는 중...</div> : null}
      {!isLoading ? (
        <ScheduleCalendar
          referenceDate={currentMonthStart}
          todos={scheduleTodos}
          onSelectDate={handleMonthChange}
          onSelectTodo={(todo) => setSelectedTodo(todo)}
        />
      ) : null}
      <TodoDetailModal
        todo={selectedTodo}
        isOpen={Boolean(selectedTodo)}
        onUpdate={async (id: number, payload: TodoUpdatePayload) => {
          const { data } = await apiClient.patch<TodoItem>(`/todo/patch/${id}`, payload);
          setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
          setSelectedTodo(null);
        }}
        onDelete={async (id: number) => {
          await apiClient.delete(`/todo/${id}`);
          setItems((prev) => prev.filter((item) => item.id !== id));
          setSelectedTodo(null);
        }}
        onClose={() => setSelectedTodo(null)}
      />
    </AppLayout>
  );
};

export default ScheduleCalendarPage;
