import type { AuthResponse } from '../types';

const ACCESS_TOKEN_KEY = 'si_access_token';
const REFRESH_TOKEN_KEY = 'si_refresh_token';
const EXPIRES_AT_KEY = 'si_expires_at';

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: AuthResponse): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  sessionStorage.setItem(EXPIRES_AT_KEY, tokens.expiresAt);
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_AT_KEY);
}
