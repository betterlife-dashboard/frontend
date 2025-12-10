import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import type { TodoItem, TodoStatus, TodoType, TodoUpdatePayload } from '@/types/todo';
import { DatePickerButton } from '@/components/common/DatePickerButton';
import { formatRepeatDays, isTodayDate, todayISODate } from '@/utils/todo';

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const toDateOnlyValue = (value?: string | null) => (value ? value.slice(0, 10) : todayISODate());
const toTimeOnlyValue = (value?: string | null) => {
  if (!value) return '';
  const [, time] = value.split('T');
  if (!time) return '';
  return time.slice(0, 5);
};

const ensureDateTimeValue = (value: string | undefined, baseDate: string, fallbackTime: string) => {
  if (value?.includes('T')) {
    return value;
  }
  const date = toDateOnlyValue(value) || baseDate;
  return `${date}T${fallbackTime}`;
};

const ensureDateOnlyValue = (value: string | undefined, baseDate: string) => toDateOnlyValue(value) || baseDate;
const composeDateTime = (date: string, time: string) => `${date}T${time || DEFAULT_START_TIME}`;
const getTimeParts = (value: string | undefined, fallback: string) => {
  const time = toTimeOnlyValue(value) || fallback;
  const [hour = '00', minute = '00'] = time.split(':');
  return [hour.padStart(2, '0'), minute.padStart(2, '0')];
};

const parseAlarmOffsetsByBase = (alarms: string[]): { start: string[]; end: string[] } => {
  if (!alarms || alarms.length === 0) {
    return { start: [], end: [] };
  }

  const allowedOffsets = ['1h', '1d', '3d', '1w'];
  const start: string[] = [];
  const end: string[] = [];

  alarms.forEach((alarm) => {
    const normalized = (alarm ?? '').toLowerCase();
    const offset = normalized.replace(/^(reminder|deadline)[-_]?/, '');
    if (!allowedOffsets.includes(offset)) {
      return;
    }
    if (normalized.startsWith('deadline-') || normalized.startsWith('deadline_')) {
      end.push(offset);
      return;
    }
    start.push(offset);
  });

  return { start, end };
};

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

const auditDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const TodoDetailModal = ({ todo, isOpen, onUpdate, onDelete, onClose }: TodoDetailModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>('GENERAL');
  const [status, setStatus] = useState<TodoStatus>('PLANNED');
  const [activeFrom, setActiveFrom] = useState<string>(todayISODate());
  const [activeUntil, setActiveUntil] = useState<string>(todayISODate());
  const [startAlarmOffsets, setStartAlarmOffsets] = useState<string[]>([]);
  const [endAlarmOffsets, setEndAlarmOffsets] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSchedule = type === 'SCHEDULE';

  useEffect(() => {
    if (!todo || !isOpen) {
      return;
    }
    setTitle(todo.title);
    setType(todo.type);
    setStatus(todo.status);
    if (todo.type === 'SCHEDULE') {
      setActiveFrom(ensureDateTimeValue(todo.activeFrom ?? undefined, todayISODate(), DEFAULT_START_TIME));
      setActiveUntil(ensureDateTimeValue(todo.activeUntil ?? undefined, todayISODate(), DEFAULT_END_TIME));
    } else {
      setActiveFrom(ensureDateOnlyValue(todo.activeFrom ?? undefined, todayISODate()));
      setActiveUntil(ensureDateOnlyValue(todo.activeUntil ?? undefined, todayISODate()));
    }
    setStartAlarmOffsets([]);
    setEndAlarmOffsets([]);
    setError(null);
    setIsSaving(false);
    setIsDeleting(false);
  }, [todo, isOpen]);

  useEffect(() => {
    if (!todo || !isOpen || todo.type !== 'SCHEDULE') {
      return;
    }
    let mounted = true;
    const loadAlarms = async () => {
      try {
        const { data } = await apiClient.get<{ alarms: string[] }>(`/notify/${todo.id}`);
        if (!mounted) {
          return;
        }
        const { start, end } = parseAlarmOffsetsByBase(data.alarms ?? []);
        setStartAlarmOffsets(start);
        setEndAlarmOffsets(end);
      } catch {
        if (mounted) {
          setStartAlarmOffsets([]);
          setEndAlarmOffsets([]);
        }
      }
    };
    void loadAlarms();
    return () => {
      mounted = false;
    };
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
      parts.push(`생성: ${auditDateFormatter.format(new Date(todo.createdAt))}`);
    }
    if (todo.updatedAt) {
      parts.push(`수정: ${auditDateFormatter.format(new Date(todo.updatedAt))}`);
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

  useEffect(() => {
    if (isSchedule) {
      setActiveFrom((current) => ensureDateTimeValue(current, todayISODate(), DEFAULT_START_TIME));
      setActiveUntil((current) => ensureDateTimeValue(current, todayISODate(), DEFAULT_END_TIME));
    } else {
      setActiveFrom((current) => ensureDateOnlyValue(current, todayISODate()));
      setActiveUntil((current) => ensureDateOnlyValue(current, todayISODate()));
      setStartAlarmOffsets([]);
      setEndAlarmOffsets([]);
    }
  }, [isSchedule]);

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
    const basePayload = {
      title: title.trim(),
      type,
      status,
      activeFrom: normalizedActiveFrom,
      activeUntil: normalizedActiveUntil,
    } as const;

    const payload: TodoUpdatePayload =
      type === 'SCHEDULE'
        ? {
            ...basePayload,
            alarms: [
              ...startAlarmOffsets.map((offset) => `reminder-${offset}`),
              ...endAlarmOffsets.map((offset) => `deadline-${offset}`),
            ],
          }
        : basePayload;

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

  const handleScheduleStartDateChange = (nextDate: string) => {
    const date = toDateOnlyValue(nextDate);
    const time = toTimeOnlyValue(activeFrom) || DEFAULT_START_TIME;
    setActiveFrom(composeDateTime(date, time));
  };

  const handleScheduleStartTimeChange = (nextTime: string) => {
    const date = toDateOnlyValue(activeFrom);
    setActiveFrom(composeDateTime(date, nextTime || DEFAULT_START_TIME));
  };

  const handleScheduleEndDateChange = (nextDate: string) => {
    const date = toDateOnlyValue(nextDate);
    const time = toTimeOnlyValue(activeUntil) || DEFAULT_END_TIME;
    setActiveUntil(composeDateTime(date, time));
  };

  const handleScheduleEndTimeChange = (nextTime: string) => {
    const date = toDateOnlyValue(activeUntil);
    setActiveUntil(composeDateTime(date, nextTime || DEFAULT_END_TIME));
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
            <label>유형</label>
            <div className="option-button-group" role="group" aria-label="유형 선택">
              {(['GENERAL', 'WORK_STUDY', 'WORKOUT', 'SCHEDULE'] as TodoType[]).map((option) => {
                const isActive = type === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-button ${isActive ? 'active' : ''}`}
                    onClick={() => setType(option)}
                    aria-pressed={isActive}
                    disabled={isSaving || isDeleting}
                  >
                    {option === 'GENERAL'
                      ? '일반'
                      : option === 'WORK_STUDY'
                        ? '업무/공부'
                        : option === 'WORKOUT'
                          ? '운동'
                          : '일정'}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-field">
            <label>상태</label>
            <div className="option-button-group" role="group" aria-label="상태 선택">
              {statusOptions.map((option) => {
                const isActive = status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`option-button ${isActive ? 'active' : ''}`}
                    onClick={() => setStatus(option)}
                    aria-pressed={isActive}
                    disabled={isSaving || isDeleting}
                  >
                    {statusLabelMap[option]}
                  </button>
                );
              })}
            </div>
          </div>
          {isSchedule ? (
            <>
              <div className="form-row">
                <div className="form-field" style={{ minWidth: '180px' }}>
                  <label htmlFor="todo-detail-start-date">시작 날짜</label>
                  <DatePickerButton
                    id="todo-detail-start-date"
                    value={toDateOnlyValue(activeFrom)}
                    onChange={handleScheduleStartDateChange}
                    label="시작 날짜 선택"
                  />
                </div>
                <div className="form-field" style={{ minWidth: '160px' }}>
                  <label htmlFor="todo-detail-start-time">시작 시간</label>
                  <div className="form-row" style={{ gap: '8px' }}>
                    <select
                      id="todo-detail-start-time"
                      value={getTimeParts(activeFrom, DEFAULT_START_TIME)[0]}
                      onChange={(event) =>
                        handleScheduleStartTimeChange(
                          `${event.target.value}:${getTimeParts(activeFrom, DEFAULT_START_TIME)[1]}`,
                        )
                      }
                      aria-label="시작 시각 시간 선택"
                    >
                      {HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <select
                      value={getTimeParts(activeFrom, DEFAULT_START_TIME)[1]}
                      onChange={(event) =>
                        handleScheduleStartTimeChange(
                          `${getTimeParts(activeFrom, DEFAULT_START_TIME)[0]}:${event.target.value}`,
                        )
                      }
                      aria-label="시작 시각 분 선택"
                    >
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field" style={{ minWidth: '180px' }}>
                  <label htmlFor="todo-detail-end-date">종료 날짜</label>
                  <DatePickerButton
                    id="todo-detail-end-date"
                    value={toDateOnlyValue(activeUntil)}
                    onChange={handleScheduleEndDateChange}
                    label="종료 날짜 선택"
                    min={toDateOnlyValue(activeFrom)}
                  />
                </div>
                <div className="form-field" style={{ minWidth: '160px' }}>
                  <label htmlFor="todo-detail-end-time">종료 시간</label>
                  <div className="form-row" style={{ gap: '8px' }}>
                    <select
                      id="todo-detail-end-time"
                      value={getTimeParts(activeUntil, DEFAULT_END_TIME)[0]}
                      onChange={(event) =>
                        handleScheduleEndTimeChange(
                          `${event.target.value}:${getTimeParts(activeUntil, DEFAULT_END_TIME)[1]}`,
                        )
                      }
                      aria-label="종료 시각 시간 선택"
                    >
                      {HOURS.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <select
                      value={getTimeParts(activeUntil, DEFAULT_END_TIME)[1]}
                      onChange={(event) =>
                        handleScheduleEndTimeChange(
                          `${getTimeParts(activeUntil, DEFAULT_END_TIME)[0]}:${event.target.value}`,
                        )
                      }
                      aria-label="종료 시각 분 선택"
                    >
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
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
          )}
          {repeatLabel && !isSameDayRange ? (
            <p className="text-caption">
              반복 일정은 시작/마감이 오늘인 반복 Todo 페이지에서만 수정할 수 있습니다.
            </p>
          ) : null}
          {isSchedule ? (
            <div className="form-field">
              <label>알림 설정</label>
              <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p className="text-caption">시작 시간 기준</p>
                  <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    {['1h', '1d', '3d', '1w'].map((value) => {
                      const labelMap: Record<string, string> = {
                        '1h': '1시간 전',
                        '1d': '하루 전',
                        '3d': '3일 전',
                        '1w': '일주일 전',
                      };
                      const isChecked = startAlarmOffsets.includes(value);
                      return (
                        <label key={`detail-start-${value}`} className="checkbox-field">
                          <input
                            type="checkbox"
                            value={value}
                            checked={isChecked}
                            onChange={() =>
                              setStartAlarmOffsets((prev) =>
                                prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
                              )
                            }
                          />
                          {labelMap[value]}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-caption">마감 시간 기준</p>
                  <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    {['1h', '1d', '3d', '1w'].map((value) => {
                      const labelMap: Record<string, string> = {
                        '1h': '1시간 전',
                        '1d': '하루 전',
                        '3d': '3일 전',
                        '1w': '일주일 전',
                      };
                      const isChecked = endAlarmOffsets.includes(value);
                      return (
                        <label key={`detail-end-${value}`} className="checkbox-field">
                          <input
                            type="checkbox"
                            value={value}
                            checked={isChecked}
                            onChange={() =>
                              setEndAlarmOffsets((prev) =>
                                prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
                              )
                            }
                          />
                          {labelMap[value]}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-caption">시작(reminder-)·마감(deadline-) 기준 알림을 각각 선택할 수 있습니다.</p>
            </div>
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
