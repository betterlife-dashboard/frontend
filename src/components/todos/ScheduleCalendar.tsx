import type { TodoItem } from '@/types/todo';

interface ScheduleCalendarProps {
  referenceDate: string;
  todos: TodoItem[];
  onSelectDate?: (date: string) => void;
}

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const getMonthGrid = (referenceDate: string) => {
  const date = new Date(`${referenceDate}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // Sunday start
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    days.push(current);
  }
  return days;
};

const isWithinRange = (target: string, start?: string | null, end?: string | null) => {
  if (!start && !end) return false;
  const targetKey = target;
  const startKey = start ? start.slice(0, 10) : targetKey;
  const endKey = end ? end.slice(0, 10) : targetKey;
  return targetKey >= startKey && targetKey <= endKey;
};

const getRangeInfo = (todo: TodoItem) => {
  const startKey = todo.activeFrom ? todo.activeFrom.slice(0, 10) : todo.activeUntil?.slice(0, 10) ?? '';
  const endKey = todo.activeUntil ? todo.activeUntil.slice(0, 10) : startKey;
  return { startKey, endKey };
};

export const ScheduleCalendar = ({ referenceDate, todos, onSelectDate }: ScheduleCalendarProps) => {
  const days = getMonthGrid(referenceDate);
  const schedules = todos.filter((todo) => todo.type === 'SCHEDULE');
  const weeks = Array.from({ length: 6 }, (_, idx) => days.slice(idx * 7, idx * 7 + 7));

  return (
    <div className="card schedule-calendar-card">
      <div className="card-title">
        <div>
          <h2 className="section-title" style={{ fontSize: '20px' }}>
            {new Date(`${referenceDate}T00:00:00`).getMonth() + 1}월 캘린더
          </h2>
          <p className="text-caption">일정</p>
        </div>
      </div>
      <div className="schedule-month-grid">
        <div className="week-label-row">
          {WEEK_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => {
          const weekStart = week[0];
          const weekEnd = week[6];
          const weekStartKey = toDateKey(weekStart);
          const weekEndKey = toDateKey(weekEnd);
          const dayNumbers = week.map((day) => day.getDate());
          const weekStartDate = new Date(`${weekStartKey}T00:00:00`);
          const weekEndDate = new Date(`${weekEndKey}T00:00:00`);

          const weekItems = schedules
            .map((todo) => {
              const { startKey, endKey } = getRangeInfo(todo);
              if (!startKey && !endKey) return null;
              const startDate = new Date(`${startKey || weekStartKey}T00:00:00`);
              const endDate = new Date(`${endKey || startKey || weekStartKey}T00:00:00`);
              if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                return null;
              }
              if (endDate < weekStartDate || startDate > weekEndDate) {
                return null;
              }
              const clampedStart = startDate < weekStartDate ? weekStartDate : startDate;
              const clampedEnd = endDate > weekEndDate ? weekEndDate : endDate;
              const colStart = Math.floor((clampedStart.getTime() - weekStartDate.getTime()) / 86400000);
              const colEnd = Math.floor((clampedEnd.getTime() - weekStartDate.getTime()) / 86400000);
              return {
                id: `${todo.id}-w${weekIndex}`,
                colStart,
                colEnd,
                title: todo.title,
                isPlanned: todo.status === 'PLANNED',
              };
            })
            .filter(Boolean) as Array<{ id: string; colStart: number; colEnd: number; title: string; isPlanned: boolean }>;

          const laneEnds: number[] = [];
          const bars = weekItems
            .sort((a, b) => a.colStart - b.colStart || (a.colEnd - a.colStart) - (b.colEnd - b.colStart))
            .map((item) => {
              let lane = 0;
              while (lane < laneEnds.length && item.colStart <= laneEnds[lane]) {
                lane += 1;
              }
              if (lane === laneEnds.length) {
                laneEnds.push(item.colEnd);
              } else {
                laneEnds[lane] = item.colEnd;
              }
              return { ...item, lane };
            });

          const barRows = Math.max(1, laneEnds.length);

          return (
            <div key={`${weekStartKey}-${weekIndex}`} className="week-block">
              <div className="week-header" />
              <div className="week-day-inline text-caption">
                {dayNumbers.map((num, i) => (
                  <span key={`${weekStartKey}-d${i}`} className="day-inline">
                    {num}
                  </span>
                ))}
              </div>
              <div
                className="week-bars-grid"
                style={{
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gridTemplateRows: `repeat(${barRows}, auto)`,
                }}
              >
                {bars.map((bar) => (
                  <div
                    key={bar.id}
                    className={`schedule-bar ${bar.isPlanned ? 'event-planned' : 'event-muted'}`}
                    style={{
                      gridColumn: `${bar.colStart + 1} / ${bar.colEnd + 2}`,
                      gridRow: `${bar.lane + 1}`,
                    }}
                  >
                    <span className="event-title">{bar.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-caption" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <span className="legend planned">예정</span>
        <span className="legend dimmed">완료/취소/종료</span>
      </div>
    </div>
  );
};
