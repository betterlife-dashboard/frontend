import { NavLink, useNavigate } from 'react-router-dom';
import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { ToastStack, type ToastMessage } from '@/components/common/ToastStack';
import { useAuth } from '@/hooks/useAuth';
import { initFcm } from '@/services/fcm';

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
    let unsubscribe = () => {};

    const dismissToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const pushToast = (title: string, body: string, id?: number) => {
      const resolvedId = id ?? Date.now();
      if (seenNotifyIdsRef.current.has(resolvedId)) {
        return;
      }
      seenNotifyIdsRef.current.add(resolvedId);
      setToasts((prev) => [...prev, { id: resolvedId, title, body }]);
      window.setTimeout(() => dismissToast(resolvedId), 15000);
    };

    const setupFcm = async () => {
      if (!user) {
        return;
      }
      const { unsubscribe: release } = await initFcm((payload) => {
        if (!isMounted) {
          return;
        }
        const title = payload.notification?.title || payload.data?.title || '새 알림';
        const body = payload.notification?.body || payload.data?.body || '';
        const id = payload.data?.id ? Number(payload.data.id) : undefined;
        if (title || body) {
          pushToast(title, body, Number.isNaN(id) ? undefined : id);
        }
      });
      unsubscribe = release;
    };

    void setupFcm();
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

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
