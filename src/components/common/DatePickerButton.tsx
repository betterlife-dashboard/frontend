import { useId, useMemo, useRef } from 'react';

const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return '날짜 선택';
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '날짜 선택';
    }
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  } catch {
    return '날짜 선택';
  }
};

interface DatePickerButtonProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  name?: string;
  id?: string;
}

export const DatePickerButton = ({
  value,
  onChange,
  label,
  disabled = false,
  min,
  max,
  name,
  id,
}: DatePickerButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const buttonLabel = useMemo(() => formatDateLabel(value), [value]);

  const handleButtonClick = () => {
    if (!inputRef.current || disabled) {
      return;
    }
    if (typeof inputRef.current.showPicker === 'function') {
      inputRef.current.showPicker();
    } else {
      inputRef.current.click();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="date-picker-button">
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="date"
        value={value ?? ''}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="date-input-hidden"
      />
      <button
        type="button"
        className="secondary-button date-button"
        onClick={handleButtonClick}
        disabled={disabled}
        aria-label={label ?? '날짜 선택'}
      >
        {buttonLabel}
      </button>
    </div>
  );
};
