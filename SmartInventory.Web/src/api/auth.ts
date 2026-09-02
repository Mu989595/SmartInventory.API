import { apiFetch } from './client';
import { setTokens } from './tokenStorage';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
    false,
  );
  setTokens(response);
  return response;
}

export async function register(
  credentials: RegisterRequest,
): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
    false,
  );
  setTokens(response);
  return response;
}
