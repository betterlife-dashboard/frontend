import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

const clampMinutes = (value: number) => Math.max(1, Math.min(180, Number.isNaN(value) ? 1 : value));
const SCROLL_PIXELS_PER_MINUTE = 100; // 누적 200px 당 1분 조정 (중간 속도)

const Focus = () => {
  const [minutesInput, setMinutesInput] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => minutesInput * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const [isFloatingOpen, setIsFloatingOpen] = useState(true);
  const scrollAccumRef = useRef(0);

  const totalSeconds = useMemo(() => minutesInput * 60, [minutesInput]);
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            window.clearInterval(intervalRef.current ?? undefined);
            intervalRef.current = null;
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      setRemainingSeconds(totalSeconds);
    }
  }, [totalSeconds, isRunning]);

  const handleStart = () => {
    if (totalSeconds === 0) {
      return;
    }
    setRemainingSeconds((prev) => (prev === 0 ? totalSeconds : prev));
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const displayMinutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const displaySeconds = String(remainingSeconds % 60).padStart(2, '0');
  const progressDegrees = Math.round(progress * 360);
  const ringStyle: CSSProperties = { ['--progress' as '--progress']: `${progressDegrees}deg` };

  const handleTimeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isRunning) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setMinutesInput((prev) => clampMinutes(prev - 1));
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setMinutesInput((prev) => clampMinutes(prev + 1));
    }
  };

  const handleTimeWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (isRunning) return;
    event.preventDefault();
    scrollAccumRef.current += -event.deltaY; // 위로 스크롤하면 플러스
    const steps = Math.trunc(scrollAccumRef.current / SCROLL_PIXELS_PER_MINUTE);
    if (steps !== 0) {
      scrollAccumRef.current -= steps * SCROLL_PIXELS_PER_MINUTE;
      setMinutesInput((prev) => clampMinutes(prev + steps));
    }
  };

  return (
    <AppLayout>
      <section className="focus-page">
        <div className="page-header">
          <div>
            <h1 className="section-title">집중</h1>
            <p className="text-caption">흐름 끊기지 않게, 타이머는 항상 상단에 고정돼요.</p>
          </div>
        </div>
        <div className="focus-layout">
          <div className="focus-timer-shell">
            <div className="focus-hero">
              <div className="focus-ring" style={ringStyle}>
                <div className="focus-ring-track" />
                <div className="focus-ring-fill" />
                <div className="focus-ring-center">
                  <span className={`focus-status ${isRunning ? 'running' : 'paused'}`}>
                    {isRunning ? '진행 중' : '대기'}
                  </span>
                  <div
                    className={`focus-time ${isRunning ? 'locked' : ''}`}
                    role="slider"
                    aria-valuemin={1}
                    aria-valuemax={180}
                    aria-valuenow={minutesInput}
                    aria-label="집중 시간 (분)"
                    tabIndex={isRunning ? -1 : 0}
                    onWheel={handleTimeWheel}
                    onKeyDown={handleTimeKeyDown}
                  >
                    {displayMinutes}:{displaySeconds}
                  </div>
                </div>
              </div>
              <div className="focus-controls">
                <div className="focus-control-columns">
                  <div className="focus-column">
                    {[10, 30, 60].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="option-button small"
                        onClick={() => {
                          setMinutesInput(preset);
                        }}
                        disabled={isRunning}
                      >
                        {preset}분
                      </button>
                    ))}
                  </div>
                  <div className="focus-column">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleStart}
                      disabled={isRunning || totalSeconds === 0}
                    >
                      시작
                    </button>
                    <button type="button" className="secondary-button" onClick={handlePause} disabled={!isRunning}>
                      중지
                    </button>
                    <button
                      type="button"
                      className="muted-button"
                      onClick={handleReset}
                      disabled={isRunning || totalSeconds === 0}
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card focus-note-card">
            <div className="card-title">
              <h2 className="section-title" style={{ fontSize: '22px' }}>
                노트
              </h2>
              <span className="text-caption">필요한 메모를 여기에 쌓을 예정입니다.</span>
            </div>
            <div className="note-placeholder">
              <p className="text-caption">노트 입력 영역을 곧 추가할게요.</p>
            </div>
          </div>
        </div>
      </section>
      <div className={`focus-floating ${isFloatingOpen ? 'open' : ''}`}>
        <button className="focus-floating-toggle" type="button" onClick={() => setIsFloatingOpen((prev) => !prev)}>
          {isFloatingOpen ? '숨기기' : '타이머'}
        </button>
        <div className="focus-floating-panel">
          <div className="focus-floating-time">
            <span className={`focus-status ${isRunning ? 'running' : 'paused'}`}>
              {isRunning ? '진행 중' : '대기'}
            </span>
            <strong>
              {displayMinutes}:{displaySeconds}
            </strong>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Focus;
