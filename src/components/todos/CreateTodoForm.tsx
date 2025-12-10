import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { TodoRequestPayload, TodoType } from '@/types/todo';
import { DatePickerButton } from '@/components/common/DatePickerButton';
import { WEEKDAY_OPTIONS, todayISODate, isWeekdaySelected, toggleWeekday } from '@/utils/todo';

const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const typeOptions: { value: TodoType; label: string }[] = [
  { value: 'GENERAL', label: '일반' },
  { value: 'WORK_STUDY', label: '업무/공부' },
  { value: 'WORKOUT', label: '운동' },
  { value: 'SCHEDULE', label: '일정' },
];

const alarmOptions = [
  { value: '1h', label: '1시간 전' },
  { value: '1d', label: '하루 전' },
  { value: '3d', label: '3일 전' },
  { value: '1w', label: '일주일 전' },
] as const;

const toDateOnlyValue = (value?: string) => (value ? value.slice(0, 10) : '');
const toTimeOnlyValue = (value?: string) => {
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
  const [startAlarmOffsets, setStartAlarmOffsets] = useState<string[]>([]);
  const [endAlarmOffsets, setEndAlarmOffsets] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const isSchedule = type === 'SCHEDULE';

  useEffect(() => {
    if (!title) {
      if (isSchedule) {
        setActiveFrom(`${selectedDate}T${DEFAULT_START_TIME}`);
        setActiveUntil(`${selectedDate}T${DEFAULT_END_TIME}`);
      } else {
        setActiveFrom(selectedDate);
        setActiveUntil(selectedDate);
      }
    }
  }, [selectedDate, title, isSchedule]);

  useEffect(() => {
    if (!isRecurring) {
      setRepeatDaysMask(0);
    }
  }, [isRecurring]);

  useEffect(() => {
    if (isSchedule) {
      setIsRecurring(false);
      setRepeatDaysMask(0);
      setActiveFrom((current) => ensureDateTimeValue(current, selectedDate, DEFAULT_START_TIME));
      setActiveUntil((current) => ensureDateTimeValue(current, selectedDate, DEFAULT_END_TIME));
    } else {
      setActiveFrom((current) => ensureDateOnlyValue(current, selectedDate));
      setActiveUntil((current) => ensureDateOnlyValue(current, selectedDate));
    }
  }, [isSchedule, selectedDate]);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleActiveFromChange = (next: string) => {
    setActiveFrom(next);
    setActiveUntil((current) => {
      if (!current || next > current) {
        return next;
      }
      return current;
    });
  };

  const handleActiveUntilChange = (next: string) => {
    setActiveUntil(next);
    setActiveFrom((current) => {
      if (!current || next < current) {
        return next;
      }
      return current;
    });
  };

  const handleScheduleStartDateChange = (nextDate: string) => {
    const date = toDateOnlyValue(nextDate) || selectedDate;
    const time = toTimeOnlyValue(activeFrom) || DEFAULT_START_TIME;
    handleActiveFromChange(composeDateTime(date, time));
  };

  const handleScheduleStartTimeChange = (nextTime: string) => {
    const date = toDateOnlyValue(activeFrom) || selectedDate;
    handleActiveFromChange(composeDateTime(date, nextTime || DEFAULT_START_TIME));
  };

  const handleScheduleEndDateChange = (nextDate: string) => {
    const date = toDateOnlyValue(nextDate) || selectedDate;
    const time = toTimeOnlyValue(activeUntil) || DEFAULT_END_TIME;
    handleActiveUntilChange(composeDateTime(date, time));
  };

  const handleScheduleEndTimeChange = (nextTime: string) => {
    const date = toDateOnlyValue(activeUntil) || selectedDate;
    handleActiveUntilChange(composeDateTime(date, nextTime || DEFAULT_END_TIME));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }

    if (isRecurring && repeatDaysMask === 0) {
      setError('반복 일정 요일을 최소 1개 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const normalizedActiveFrom = activeFrom || todayISODate();
    const normalizedActiveUntil = activeUntil || todayISODate();

    const basePayload = {
      title: title.trim(),
      type,
      status: 'PLANNED' as const,
      activeFrom: normalizedActiveFrom,
      activeUntil: normalizedActiveUntil,
    };

    const payload: TodoRequestPayload = isSchedule
      ? {
          ...basePayload,
          alarms: [
            ...startAlarmOffsets.map((offset) => `reminder-${offset}`),
            ...endAlarmOffsets.map((offset) => `deadline-${offset}`),
          ],
        }
      : {
          ...basePayload,
          repeatDays: isRecurring ? repeatDaysMask : 0,
        };

    try {
      await onSubmit(payload);
      setTitle('');
      setRepeatDaysMask(0);
      setIsRecurring(false);
      setActiveFrom(selectedDate);
      setActiveUntil(selectedDate);
      setStartAlarmOffsets([]);
      setEndAlarmOffsets([]);
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
          ref={titleInputRef}
        />
      </div>
      <div className="form-field" style={{ minWidth: '180px' }}>
        <label>유형</label>
        <div className="option-button-group" role="group" aria-label="유형 선택">
          {typeOptions.map((option) => {
            const isActive = type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`option-button ${isActive ? 'active' : ''}`}
                onClick={() => setType(option.value)}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="form-field">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.target.checked)}
            disabled={isSchedule}
          />
          반복 일정으로 등록
        </label>
        {isSchedule ? <p className="text-caption">일정 유형은 반복 설정을 지원하지 않습니다.</p> : null}
      </div>
      {isSchedule ? (
        <>
          <div className="form-row">
            <div className="form-field" style={{ minWidth: '180px' }}>
              <label htmlFor="todo-start-date">시작 날짜</label>
              <DatePickerButton
                id="todo-start-date"
                value={toDateOnlyValue(activeFrom)}
                onChange={handleScheduleStartDateChange}
                label="시작 날짜 선택"
              />
            </div>
            <div className="form-field" style={{ minWidth: '160px' }}>
              <label htmlFor="todo-start-time">시작 시간</label>
              <div className="form-row" style={{ gap: '8px' }}>
                <select
                  id="todo-start-time"
                  value={getTimeParts(activeFrom, DEFAULT_START_TIME)[0]}
                  onChange={(event) =>
                    handleScheduleStartTimeChange(`${event.target.value}:${getTimeParts(activeFrom, DEFAULT_START_TIME)[1]}`)
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
                    handleScheduleStartTimeChange(`${getTimeParts(activeFrom, DEFAULT_START_TIME)[0]}:${event.target.value}`)
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
              <label htmlFor="todo-end-date">종료 날짜</label>
              <DatePickerButton
                id="todo-end-date"
                value={toDateOnlyValue(activeUntil)}
                onChange={handleScheduleEndDateChange}
                label="종료 날짜 선택"
                min={toDateOnlyValue(activeFrom) || undefined}
              />
            </div>
            <div className="form-field" style={{ minWidth: '160px' }}>
              <label htmlFor="todo-end-time">종료 시간</label>
              <div className="form-row" style={{ gap: '8px' }}>
                <select
                  id="todo-end-time"
                  value={getTimeParts(activeUntil, DEFAULT_END_TIME)[0]}
                  onChange={(event) =>
                    handleScheduleEndTimeChange(`${event.target.value}:${getTimeParts(activeUntil, DEFAULT_END_TIME)[1]}`)
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
                    handleScheduleEndTimeChange(`${getTimeParts(activeUntil, DEFAULT_END_TIME)[0]}:${event.target.value}`)
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
      ) : isRecurring ? (
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
              onChange={handleActiveFromChange}
              label="시작일 선택"
            />
          </div>
          <div className="form-field" style={{ minWidth: '160px' }}>
            <label htmlFor="todo-active-until">마감일</label>
            <DatePickerButton
              id="todo-active-until"
              value={activeUntil}
              onChange={handleActiveUntilChange}
              label="마감일 선택"
            />
          </div>
        </div>
      )}
      {isSchedule ? (
        <div className="form-field">
          <label>알림 설정</label>
          <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p className="text-caption">시작 시간 기준</p>
              <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                {alarmOptions.map((option) => {
                  const isChecked = startAlarmOffsets.includes(option.value);
                  return (
                    <label key={`start-${option.value}`} className="checkbox-field">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={isChecked}
                        onChange={() =>
                          setStartAlarmOffsets((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((value) => value !== option.value)
                              : [...prev, option.value],
                          )
                        }
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-caption">종료 시간 기준</p>
              <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                {alarmOptions.map((option) => {
                  const isChecked = endAlarmOffsets.includes(option.value);
                  return (
                    <label key={`end-${option.value}`} className="checkbox-field">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={isChecked}
                        onChange={() =>
                          setEndAlarmOffsets((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((value) => value !== option.value)
                              : [...prev, option.value],
                          )
                        }
                      />
                      {option.label}
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
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '할 일 추가'}
      </button>
    </form>
  );
};
