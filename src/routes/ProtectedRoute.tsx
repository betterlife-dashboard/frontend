import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { token, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <p style={{ margin: 0 }}>세션을 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
