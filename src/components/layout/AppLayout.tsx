import { NavLink, useNavigate } from 'react-router-dom';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { ToastStack, type ToastMessage } from '@/components/common/ToastStack';
import { useAuth } from '@/hooks/useAuth';

type NavItem =
  | {
      id: string;
      label: string;
      path: string;
      disabled?: false;
    }
  | {
      id: string;
      label: string;
      disabled: true;
    };

const navItems: NavItem[] = [
  { id: 'todos', label: 'Todo 리스트', path: '/' },
  { id: 'repeat', label: '반복 Todo', path: '/repeat-todos' },
  { id: 'calendar', label: '달력', path: '/calendar' },
  { id: 'focus', label: '집중', path: '/focus' },
  { id: 'workout', label: '운동', disabled: true },
];

export const AppLayout = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const { user, logout, isInitializing } = useAuth();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const seenNotifyIdsRef = useRef<Set<number>>(new Set());
  const pollTimerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const resolvedName = user?.name?.trim();
  const resolvedEmail = user?.email?.trim();
  const displayName = user
    ? resolvedName ?? '이름 정보 없음'
    : isInitializing
      ? '계정 확인 중...'
      : '로그인이 필요합니다';
  const accountLabel = isInitializing
    ? '계정 정보를 불러오는 중입니다'
    : user
      ? resolvedEmail ?? '이메일 정보 없음'
      : '로그인 후 이용하세요';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let isMounted = true;
    const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5분 간격
    const FOCUS_POLL_DEBOUNCE_MS = 1500;

    const dismissToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const runPoll = async () => {
      if (isPollingRef.current) {
        return;
      }
      isPollingRef.current = true;
      try {
        const { data } = await apiClient.get<ToastMessage[]>('/notify/now');
        if (!isMounted || !Array.isArray(data)) {
          isPollingRef.current = false;
          return;
        }
        data.forEach((item) => {
          if (seenNotifyIdsRef.current.has(item.id)) {
            return;
          }
          seenNotifyIdsRef.current.add(item.id);
          setToasts((prev) => [...prev, { id: item.id, title: item.title, body: item.body }]);
          window.setTimeout(() => dismissToast(item.id), 15000);
        });
      } catch {
        // 알림 폴링 실패는 조용히 무시 (네트워크 상태 등)
      } finally {
        isPollingRef.current = false;
      }
    };

    const handleVisibilityPoll = () => {
      if (document.visibilityState === 'visible') {
        window.setTimeout(() => {
          runPoll();
        }, FOCUS_POLL_DEBOUNCE_MS);
      }
    };
    const handleFocusPoll = () => {
      runPoll();
    };

    runPoll();
    pollIntervalRef.current = window.setInterval(runPoll, POLL_INTERVAL_MS);
    window.addEventListener('visibilitychange', handleVisibilityPoll);
    window.addEventListener('focus', handleFocusPoll);
    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleVisibilityPoll);
      window.removeEventListener('focus', handleFocusPoll);
      if (pollTimerRef.current) {
        window.clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const handleDismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand-block">
          <span className="brand-mark">Better Life</span>
          <p className="brand-caption">하루를 더 잘 쓰는 대시보드</p>
        </div>
        <nav className="nav-list">
          {navItems.map((item) =>
            item.disabled ? (
              <button key={item.id} type="button" className="nav-item disabled" disabled>
                <span>{item.label}</span>
                <span className="badge">추후 공개</span>
              </button>
            ) : (
              <NavLink
                key={item.id}
                to={item.path}
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </nav>
        <div className="nav-footer">
          <div className="user-card">
            <span className="user-name">{displayName}</span>
            <p className="text-caption">{accountLabel}</p>
          </div>
          <button type="button" className="secondary-button logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="content-area">
        {children}
        <ToastStack toasts={toasts} onDismiss={handleDismissToast} />
      </main>
    </div>
  );
};
