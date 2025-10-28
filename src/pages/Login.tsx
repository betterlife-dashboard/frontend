import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token, isAuthenticating } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fromState = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = fromState?.from?.pathname ?? '/';

  useEffect(() => {
    if (token) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="card auth-card">
        <div className="auth-header">
          <h1 className="auth-title">다시 만나서 반가워요 👋</h1>
          <p className="text-caption">더 나은 하루를 위한 개인 보드에 로그인하세요.</p>
        </div>
        <div className="form-field">
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <div className="error-banner">{error}</div> : null}
        <button type="submit" className="primary-button" disabled={isAuthenticating}>
          {isAuthenticating ? '로그인 중...' : '로그인'}
        </button>
        <p className="auth-switch">
          처음이신가요?{' '}
          <Link to="/register" className="link-button">
            계정 만들기
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
