import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authApi from '../api/auth';
import { isAdminToken } from '../api/client';
import { clearTokens, getAccessToken } from '../api/tokenStorage';
import type { LoginRequest, RegisterRequest } from '../types';

const EMAIL_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress';

interface AuthContextValue {
  isAuthenticated: boolean;
  isAdmin: boolean;
  email: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getEmailFromToken(token: string): string | null {
  const decoded = jwtDecode<Record<string, string>>(token);
  return decoded.email ?? decoded[EMAIL_CLAIM] ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getAccessToken(),
  );

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setAccessToken(response.accessToken);
  }, []);

  const register = useCallback(async (credentials: RegisterRequest) => {
    const response = await authApi.register(credentials);
    setAccessToken(response.accessToken);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      isAdmin: isAdminToken(accessToken),
      email: accessToken ? getEmailFromToken(accessToken) : null,
      login,
      register,
      logout,
    }),
    [accessToken, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
