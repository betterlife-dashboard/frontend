import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import type { RepeatTodoUpdatePayload, TodoItem } from '@/types/todo';

export const useRepeatTodos = () => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<TodoItem[]>('/todo/recur');
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '반복 할 일을 불러오지 못했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const updateTodo = useCallback(async (id: number, payload: RepeatTodoUpdatePayload) => {
    const { data } = await apiClient.patch<TodoItem>(`/todo/patch/repeat/${id}`, payload);
    setItems((prev) => prev.map((todo) => (todo.id === id ? data : todo)));
  }, []);

  const deleteTodo = useCallback(async (id: number) => {
    await apiClient.delete(`/todo/${id}`);
    setItems((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      error,
      fetchTodos,
      updateTodo,
      deleteTodo,
    }),
    [items, isLoading, error, fetchTodos, updateTodo, deleteTodo],
  );

  return value;
};
