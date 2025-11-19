import { useEffect, useMemo, useState } from 'react';
import type { TodoItem, TodoStatus, TodoType, TodoUpdatePayload } from '@/types/todo';
import { DatePickerButton } from '@/components/common/DatePickerButton';
import { formatRepeatDays, isTodayDate, todayISODate } from '@/utils/todo';

interface TodoDetailModalProps {
  todo: TodoItem | null;
  isOpen: boolean;
  onUpdate: (id: number, payload: TodoUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClose: () => void;
}

const statusOptions: TodoStatus[] = ['PLANNED', 'DONE', 'CANCELLED', 'EXPIRED'];

const statusLabelMap: Record<TodoStatus, string> = {
  PLANNED: '예정',
  DONE: '완료',
  CANCELLED: '취소',
  EXPIRED: '종료',
};

const extractDateValue = (value?: string | null) => (value ? value.slice(0, 10) : todayISODate());

export const TodoDetailModal = ({ todo, isOpen, onUpdate, onDelete, onClose }: TodoDetailModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>('GENERAL');
  const [status, setStatus] = useState<TodoStatus>('PLANNED');
  const [activeFrom, setActiveFrom] = useState<string>(todayISODate());
  const [activeUntil, setActiveUntil] = useState<string>(todayISODate());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!todo || !isOpen) {
      return;
    }
    setTitle(todo.title);
    setType(todo.type);
    setStatus(todo.status);
    setActiveFrom(extractDateValue(todo.activeFrom));
    setActiveUntil(extractDateValue(todo.activeUntil));
    setError(null);
    setIsSaving(false);
    setIsDeleting(false);
  }, [todo, isOpen]);

  const repeatLabel = useMemo(() => formatRepeatDays(todo?.repeatDays), [todo?.repeatDays]);
  const isSameDayRange = useMemo(
    () => isTodayDate(activeFrom) && isTodayDate(activeUntil),
    [activeFrom, activeUntil],
  );

  const detailSummary = useMemo(() => {
    if (!todo) {
      return '';
    }
    const parts: string[] = [];
    if (todo.createdAt) {
      parts.push(`생성: ${new Date(todo.createdAt).toLocaleString('ko-KR')}`);
    }
    if (todo.updatedAt) {
      parts.push(`수정: ${new Date(todo.updatedAt).toLocaleString('ko-KR')}`);
    }
    const repeatLabel =
      todo.repeatDays && isTodayDate(todo.activeFrom) && isTodayDate(todo.activeUntil)
        ? formatRepeatDays(todo.repeatDays)
        : null;
    if (repeatLabel) {
      parts.push(`반복: ${repeatLabel}`);
    }
    return parts.join(' · ');
  }, [todo]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [isOpen, onClose]);

  if (!isOpen || !todo) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const normalizedActiveFrom = activeFrom || todayISODate();
    const normalizedActiveUntil = activeUntil || todayISODate();
    const payload: TodoUpdatePayload = {
      title: title.trim(),
      type,
      status,
      activeFrom: normalizedActiveFrom,
      activeUntil: normalizedActiveUntil,
    };

    try {
      await onUpdate(todo.id, payload);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '할 일을 수정하지 못했습니다.';
      setError(message);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 할 일을 삭제하시겠어요?')) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(todo.id);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '할 일을 삭제하지 못했습니다.';
      setError(message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card card">
        <div className="modal-header">
          <div>
            <h2 className="section-title" style={{ fontSize: '24px' }}>
              할 일 상세
            </h2>
            <p className="text-caption">{detailSummary}</p>
            {repeatLabel ? (
              <p className="text-caption">반복 패턴: {repeatLabel} (반복 편집은 반복 Todo 페이지에서 가능합니다.)</p>
            ) : null}
          </div>
          <button type="button" className="muted-button" onClick={onClose} disabled={isSaving || isDeleting}>
            닫기
          </button>
        </div>
        <form className="todo-form form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="todo-detail-title">할 일 제목</label>
            <input
              id="todo-detail-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="todo-detail-type">유형</label>
            <select id="todo-detail-type" value={type} onChange={(event) => setType(event.target.value as TodoType)}>
              <option value="GENERAL">일반</option>
              <option value="WORK_STUDY">업무/공부</option>
              <option value="WORKOUT">운동</option>
              <option value="SCHEDULE">일정</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="todo-detail-status">상태</label>
            <select id="todo-detail-status" value={status} onChange={(event) => setStatus(event.target.value as TodoStatus)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabelMap[option]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-field" style={{ minWidth: '160px' }}>
              <label htmlFor="todo-detail-active-from">시작일</label>
              <DatePickerButton
                id="todo-detail-active-from"
                value={activeFrom}
                onChange={(next) => setActiveFrom(next)}
                label="시작일 선택"
              />
            </div>
            <div className="form-field" style={{ minWidth: '160px' }}>
              <label htmlFor="todo-detail-active-until">마감일</label>
              <DatePickerButton
                id="todo-detail-active-until"
                value={activeUntil}
                onChange={(next) => setActiveUntil(next)}
                label="마감일 선택"
              />
            </div>
          </div>
          {repeatLabel && !isSameDayRange ? (
            <p className="text-caption">
              반복 일정은 시작/마감이 오늘인 반복 Todo 페이지에서만 수정할 수 있습니다.
            </p>
          ) : null}
          {error ? <div className="error-banner">{error}</div> : null}
          <div className="modal-actions">
            <button type="button" className="muted-button" onClick={handleDelete} disabled={isDeleting || isSaving}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
            <button type="submit" className="primary-button" disabled={isSaving || isDeleting}>
              {isSaving ? '저장 중...' : '변경 사항 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
