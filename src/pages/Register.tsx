import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, token, isAuthenticating } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="card auth-card">
        <div className="auth-header">
          <h1 className="auth-title">환영합니다 🥳</h1>
          <p className="text-caption">나만의 루틴과 할 일을 관리할 계정을 만들어보세요.</p>
        </div>
        <div className="form-field">
          <label htmlFor="register-name">이름</label>
          <input
            id="register-name"
            type="text"
            placeholder="홍길동"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="register-email">이메일</label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="register-password">비밀번호</label>
          <input
            id="register-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <div className="error-banner">{error}</div> : null}
        <button type="submit" className="primary-button" disabled={isAuthenticating}>
          {isAuthenticating ? '가입 중...' : '회원가입'}
        </button>
        <p className="auth-switch">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="link-button">
            로그인하기
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
