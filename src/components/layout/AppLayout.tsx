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
  const { user, logout } = useAuth();

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
            <span className="user-name">{user?.name ?? '사용자'}</span>
            <p className="text-caption">계정</p>
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
