import { apiFetch } from './api';

export function get<T>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, { ...options, method: options?.method ?? 'GET' });
}

export function post<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export function patch<T>(endpoint: string, body?: unknown, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

export function del<T>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
}
