import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import type { TodoItem, TodoRequestPayload, TodoUpdatePayload } from '@/types/todo';
import { normalizeTodoDateRange } from '@/utils/todo';

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

interface UseTodosOptions {
  initialDate?: string;
}

export const useTodos = ({ initialDate }: UseTodosOptions = {}) => {
  const [currentDate, setCurrentDate] = useState(
    initialDate ?? toISODate(new Date()),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TodoItem[]>([]);

  const fetchTodos = useCallback(
    async (date: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get<TodoItem[]>(`/todo/${date}`);
        setItems(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : '할 일을 불러오지 못했습니다.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTodos(currentDate);
  }, [currentDate, fetchTodos]);

  const changeDate = useCallback((date: string) => {
    setCurrentDate(date);
  }, []);

  const createTodo = useCallback(
    async (payload: TodoRequestPayload) => {
      const normalizedPayload = normalizeTodoDateRange(payload);
      await apiClient.post<TodoItem>('/todo/create', normalizedPayload);
      await fetchTodos(currentDate);
    },
    [currentDate, fetchTodos],
  );

  const updateTodo = useCallback(async (id: number, payload: TodoUpdatePayload) => {
    const normalizedPayload = normalizeTodoDateRange(payload);
    const { data } = await apiClient.patch<TodoItem>(`/todo/patch/${id}`, normalizedPayload);
    setItems((prev) => prev.map((todo) => (todo.id === id ? data : todo)));
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    await apiClient.delete(`/todo/${id}`);
    setItems((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      items,
      currentDate,
      isLoading,
      error,
      fetchTodos,
      changeDate,
      createTodo,
      updateTodo,
      deleteTodo,
    }),
    [items, currentDate, isLoading, error, fetchTodos, changeDate, createTodo, updateTodo, deleteTodo],
  );

  return value;
};
