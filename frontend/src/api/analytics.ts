import { useQuery } from '@tanstack/react-query'

const BASE = import.meta.env.VITE_BACKEND_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export interface AnalyticsPoint {
  label: string
  income: number
  expense: number
}

export interface AnalyticsResponse {
  period: string
  format: string
  data: AnalyticsPoint[]
}

function fetchAnalytics(period: string): Promise<AnalyticsResponse> {
  return fetch(`${BASE}/api/analytics/spending-over-time?period=${period}`, {
    headers: authHeaders(),
  }).then(r => { if (!r.ok) throw r; return r.json() })
}

export function useAnalytics(period: string) {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 60_000,
  })
}
