import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepeatTodos } from '@/hooks/useRepeatTodos';
import type { RepeatTodoUpdatePayload, TodoItem, TodoType } from '@/types/todo';
import { WEEKDAY_OPTIONS, formatRepeatDays, isWeekdaySelected, toggleWeekday } from '@/utils/todo';

const typeOptions: { value: TodoType; label: string }[] = [
  { value: 'GENERAL', label: '일반' },
  { value: 'WORK_STUDY', label: '업무/공부' },
  { value: 'WORKOUT', label: '운동' },
  { value: 'SCHEDULE', label: '일정' },
];

const RepeatTodosPage = () => {
  const { items, isLoading, error, fetchTodos, updateTodo, deleteTodo } = useRepeatTodos();
  const [selected, setSelected] = useState<TodoItem | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>('GENERAL');
  const [repeatDaysMask, setRepeatDaysMask] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selected) {
      return;
    }
    setTitle(selected.title);
    setType(selected.type);
    setRepeatDaysMask(selected.repeatDays ?? 0);
    setFormError(null);
  }, [selected]);

  const repeatTodos = useMemo(() => items.filter((todo) => (todo.repeatDays ?? 0) > 0), [items]);

  const handleSelect = (todo: TodoItem) => {
    setSelected(todo);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      return;
    }
    if (!title.trim()) {
      setFormError('할 일 제목을 입력해주세요.');
      return;
    }
    if (repeatDaysMask <= 0) {
      setFormError('반복 요일을 최소 한 개 이상 선택해야 합니다.');
      return;
    }

    const payload: RepeatTodoUpdatePayload = {
      title: title.trim(),
      type,
      repeatDays: repeatDaysMask,
    };

    setIsSaving(true);
    setFormError(null);
    try {
      await updateTodo(selected.id, payload);
      setFeedback('반복 할 일을 수정했습니다.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '반복 할 일을 수정하지 못했습니다.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) {
      return;
    }
    if (!window.confirm('선택한 반복 Todo를 삭제하시겠어요?')) {
      return;
    }
    setIsDeleting(true);
    setFormError(null);
    try {
      await deleteTodo(selected.id);
      setSelected(null);
      setFeedback('반복 할 일을 삭제했습니다.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '반복 할 일을 삭제하지 못했습니다.';
      setFormError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!selected) {
      return undefined;
    }
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [selected]);

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="section-title">반복 할 일 관리</h1>
          <p className="text-caption">반복 패턴을 수정하기 위해 전용 페이지에서 관리하세요.</p>
        </div>
        <div className="todo-toolbar">
          <button type="button" className="secondary-button" onClick={() => void fetchTodos()}>
            새로고침
          </button>
        </div>
      </div>
      {feedback ? <div className="success-banner">{feedback}</div> : null}
      <div className="repeat-layout">
        <div className="card repeat-list">
          <div className="card-title">
            <h2 className="section-title" style={{ fontSize: '22px' }}>
              반복 Todo 목록
            </h2>
            <span className="text-caption">총 {repeatTodos.length}개</span>
          </div>
          {isLoading ? (
            <p className="text-caption">불러오는 중...</p>
          ) : error ? (
            <div className="error-banner">
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : repeatTodos.length === 0 ? (
            <div className="empty-state">
              <strong>반복 설정된 할 일이 없습니다.</strong>
            </div>
          ) : (
            <div className="repeat-list-items">
              {repeatTodos.map((todo) => {
                const repeatLabel = formatRepeatDays(todo.repeatDays);
                const isActive = selected?.id === todo.id;
                return (
                  <button
                    key={todo.id}
                    type="button"
                    className={`repeat-list-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelect(todo)}
                  >
                    <span className="todo-title">{todo.title}</span>
                    <span className="text-caption">{repeatLabel ?? '반복 정보 없음'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="card repeat-editor">
          <h2 className="section-title" style={{ fontSize: '22px' }}>
            반복 Todo 상세
          </h2>
          {selected ? (
            <form className="todo-form form-grid" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="repeat-editor-title">할 일 제목</label>
                <input
                  id="repeat-editor-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="repeat-editor-type">유형</label>
                <select
                  id="repeat-editor-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as TodoType)}
                  disabled={isSaving}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>반복 요일</label>
                <div className="repeat-day-grid">
                  {WEEKDAY_OPTIONS.map((option) => {
                    const selectedFlag = isWeekdaySelected(repeatDaysMask, option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`repeat-day-button ${selectedFlag ? 'selected' : ''}`}
                        onClick={() => setRepeatDaysMask((mask) => toggleWeekday(mask, option.value))}
                        disabled={isSaving}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-caption">반복 요일을 최소 한 개 이상 선택해야 합니다.</p>
              </div>
              {formError ? <div className="error-banner">{formError}</div> : null}
              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="muted-button" onClick={handleDelete} disabled={isDeleting || isSaving}>
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
                <button type="submit" className="primary-button" disabled={isSaving || isDeleting}>
                  {isSaving ? '저장 중...' : '변경 사항 저장'}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state">
              <strong>수정할 반복 Todo를 왼쪽 목록에서 선택하세요.</strong>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RepeatTodosPage;
