export const WEEKDAY_OPTIONS = [
  { label: '월', value: 1 },
  { label: '화', value: 2 },
  { label: '수', value: 4 },
  { label: '목', value: 8 },
  { label: '금', value: 16 },
  { label: '토', value: 32 },
  { label: '일', value: 64 },
] as const;

export type WeekdayBit = (typeof WEEKDAY_OPTIONS)[number]['value'];

export const toggleWeekday = (mask: number, bit: WeekdayBit) => mask ^ bit;

export const isWeekdaySelected = (mask: number, bit: WeekdayBit) => (mask & bit) === bit;

export const todayISODate = () => new Date().toISOString().slice(0, 10);

const onlyDate = (value?: string | null) => (value ? value.slice(0, 10) : null);

const isDateOnlyValue = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const toStartOfDayDateTime = (date: string) => `${date}T00:00:00`;

export const toEndOfDayDateTime = (date: string) => `${date}T23:59:59`;

const normalizeDateTimeValue = (value: string, mode: 'start' | 'end') => {
  if (!value) {
    return value;
  }
  if (!isDateOnlyValue(value)) {
    return value;
  }
  return mode === 'start' ? toStartOfDayDateTime(value) : toEndOfDayDateTime(value);
};

export const normalizeTodoDateRange = <T extends { activeFrom?: string | null; activeUntil?: string | null }>(
  payload: T,
) => ({
  ...payload,
  activeFrom: payload.activeFrom ? normalizeDateTimeValue(payload.activeFrom, 'start') : payload.activeFrom ?? null,
  activeUntil: payload.activeUntil ? normalizeDateTimeValue(payload.activeUntil, 'end') : payload.activeUntil ?? null,
});

export const isTodayDate = (value?: string | null) => {
  if (!value) {
    return false;
  }
  return onlyDate(value) === todayISODate();
};

export const formatRepeatDays = (mask?: number | null) => {
  if (!mask) {
    return null;
  }

  const selected = WEEKDAY_OPTIONS.filter((option) => isWeekdaySelected(mask, option.value));
  if (selected.length === 0) {
    return null;
  }

  return selected.map((option) => option.label).join(', ');
};
