import { useNavigate } from 'react-router-dom';
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
import type { ApiError } from '@/services/apiClient';

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
const profileKey = 'authProfile';

const loadStoredProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(profileKey);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    localStorage.removeItem(profileKey);
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(() => loadStoredProfile());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(profileKey);
    setToken(null);
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    if (data && typeof data === 'object') {
      const storedProfile = loadStoredProfile();
      const nextProfile: UserProfile = {
        ...(storedProfile ?? {}),
        ...data,
      };
      setUser(nextProfile);
      localStorage.setItem(profileKey, JSON.stringify(nextProfile));
    }
    const latestToken = localStorage.getItem(storageKey);
    setToken(latestToken);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        await fetchProfile();
      } catch (error) {
        clearAuthState();
        if ((error as ApiError)?.status === 400) {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrap();
  }, [token, navigate, fetchProfile, clearAuthState]);

  const applyAuthResult = useCallback(
    async (data: LoginResponse) => {
      setToken(data.token);
      localStorage.setItem(storageKey, data.token);
      await fetchProfile();
    },
    [fetchProfile],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsAuthenticating(true);
      try {
        const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
        await applyAuthResult(data);
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
    clearAuthState();
  }, [clearAuthState]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};
