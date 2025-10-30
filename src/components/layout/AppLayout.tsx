import { NavLink, useNavigate } from 'react-router-dom';
import { type PropsWithChildren } from 'react';
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
  { id: 'calendar', label: '달력', disabled: true },
  { id: 'focus', label: '집중', disabled: true },
  { id: 'workout', label: '운동', disabled: true },
];

export const AppLayout = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const { user, logout, isInitializing } = useAuth();
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
      <main className="content-area">{children}</main>
    </div>
  );
};
