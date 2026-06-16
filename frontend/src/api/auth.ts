const BASE = import.meta.env.BACKEND_URL

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options)
  const body = await res.json()
  if (!res.ok) throw body
  return body as T
}

export function register(username: string, mail: string, password: string) {
  return request<{ token: string }>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, mail, password }),
  })
}

export function login(mail: string, password: string) {
  return request<{ token: string }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, password }),
  })
}
