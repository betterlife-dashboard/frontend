import { type FormEvent, useEffect, useState } from 'react';
import type { TodoRequestPayload, TodoType } from '@/types/todo';
import { DatePickerButton } from '@/components/common/DatePickerButton';
import { WEEKDAY_OPTIONS, todayISODate, isWeekdaySelected, toggleWeekday } from '@/utils/todo';

const typeOptions: { value: TodoType; label: string }[] = [
  { value: 'GENERAL', label: '일반' },
  { value: 'WORK_STUDY', label: '업무/공부' },
  { value: 'WORKOUT', label: '운동' },
  { value: 'SCHEDULE', label: '일정' },
];

interface CreateTodoFormProps {
  selectedDate: string;
  onSubmit: (payload: TodoRequestPayload) => Promise<void>;
  withIntro?: boolean;
}

export const CreateTodoForm = ({ selectedDate, onSubmit, withIntro = true }: CreateTodoFormProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>('GENERAL');
  const [repeatDaysMask, setRepeatDaysMask] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [activeFrom, setActiveFrom] = useState<string>(selectedDate);
  const [activeUntil, setActiveUntil] = useState<string>(selectedDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setActiveFrom(selectedDate);
      setActiveUntil(selectedDate);
    }
  }, [selectedDate, title]);

  useEffect(() => {
    if (!isRecurring) {
      setRepeatDaysMask(0);
    }
  }, [isRecurring]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const normalizedActiveFrom = activeFrom || todayISODate();
    const normalizedActiveUntil = activeUntil || todayISODate();

    const payload: TodoRequestPayload = {
      title: title.trim(),
      type,
      status: 'PLANNED',
      repeatDays: isRecurring ? repeatDaysMask : 0,
      activeFrom: normalizedActiveFrom,
      activeUntil: normalizedActiveUntil,
    };

    try {
      await onSubmit(payload);
      setTitle('');
      setRepeatDaysMask(0);
      setIsRecurring(false);
      setActiveFrom(selectedDate);
      setActiveUntil(selectedDate);
    } catch (err) {
      const message = err instanceof Error ? err.message : '할 일을 저장하지 못했습니다.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form form-grid">
      {withIntro ? (
        <div>
          <h2 className="section-title">새로운 할 일</h2>
          <p className="text-caption">오늘 집중할 할 일을 기록하세요.</p>
        </div>
      ) : null}
      <div className="form-field">
        <label htmlFor="todo-title">할 일 제목</label>
        <input
          id="todo-title"
          type="text"
          placeholder="예) 아침 스트레칭, 데일리 스탠드업 준비"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="form-field" style={{ minWidth: '180px' }}>
        <label htmlFor="todo-type">유형</label>
        <select id="todo-type" value={type} onChange={(event) => setType(event.target.value as TodoType)}>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.target.checked)}
          />
          반복 일정으로 등록
        </label>
      </div>
      {isRecurring ? (
        <div className="form-field">
          <label>반복 요일</label>
          <div className="repeat-day-grid">
            {WEEKDAY_OPTIONS.map((option) => {
              const isSelected = isWeekdaySelected(repeatDaysMask, option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`repeat-day-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => setRepeatDaysMask((mask) => toggleWeekday(mask, option.value))}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-caption">사이클링할 요일을 선택하세요.</p>
        </div>
      ) : (
        <div className="form-row">
          <div className="form-field" style={{ minWidth: '160px' }}>
            <label htmlFor="todo-active-from">시작일</label>
            <DatePickerButton
              id="todo-active-from"
              value={activeFrom}
              onChange={(next) => setActiveFrom(next)}
              label="시작일 선택"
            />
          </div>
          <div className="form-field" style={{ minWidth: '160px' }}>
            <label htmlFor="todo-active-until">마감일</label>
            <DatePickerButton
              id="todo-active-until"
              value={activeUntil}
              onChange={(next) => setActiveUntil(next)}
              label="마감일 선택"
            />
          </div>
        </div>
      )}
      {error ? <div className="error-banner">{error}</div> : null}
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '할 일 추가'}
      </button>
    </form>
  );
};
