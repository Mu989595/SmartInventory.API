import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from './config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage';
import type { AuthResponse } from '../types';

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let refreshPromise: Promise<AuthResponse> | null = null;

async function refreshAccessToken(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, 'Session expired');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refreshToken),
  });

  if (!response.ok) {
    clearTokens();
    const message = await readErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  const tokens = (await response.json()) as AuthResponse;
  setTokens(tokens);
  return tokens;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const data = (await response.json()) as { message?: string };
    return data.message ?? response.statusText;
  }

  const text = await response.text();
  return text || response.statusText;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retryOnUnauthorized && getRefreshToken()) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    try {
      await refreshPromise;
    } catch (error) {
      throw error;
    }

    const newToken = getAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
    }

    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getRoleFromToken(token: string): string | null {
  const decoded = jwtDecode<Record<string, string>>(token);
  return decoded.role ?? decoded[ROLE_CLAIM] ?? null;
}

export function isAdminToken(token: string | null): boolean {
  if (!token) return false;
  return getRoleFromToken(token) === 'Admin';
}
