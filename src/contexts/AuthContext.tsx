import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { apiClient } from '@/services/apiClient';
import type { LoginPayload, LoginResponse, RegisterPayload, UserProfile } from '@/types/auth';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isInitializing: boolean;
  isAuthenticating: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = 'authToken';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data } = await apiClient.get<UserProfile>('/auth/me');
        setUser(data);
      } catch {
        localStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrap();
  }, [token]);

  const applyAuthResult = useCallback((data: LoginResponse) => {
    setUser({ name: data.name });
    setToken(data.token);
    localStorage.setItem(storageKey, data.token);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsAuthenticating(true);
      try {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
        applyAuthResult(data);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applyAuthResult],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsAuthenticating(true);
      try {
        await apiClient.post('/auth/register', payload);
        await login({ email: payload.email, password: payload.password });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isInitializing,
      isAuthenticating,
    }),
    [user, token, login, register, logout, isInitializing, isAuthenticating],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};
