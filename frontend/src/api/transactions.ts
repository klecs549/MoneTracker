import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const BASE = import.meta.env.BACKEND_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export interface Transaction {
  id: number
  userId: number
  tagId: number | null
  amount: string
  note: string | null
  date: string
}

export interface TransactionsResponse {
  data: Transaction[]
  page: number
  totalPages: number
  total: number
}

export interface TagSummary {
  tagId: number | null
  tagName: string | null
  tagIcon: string | null
  sum: string
}

export interface Summary {
  total: string
  byTag: TagSummary[]
}

export async function getSummary(token: string): Promise<Summary> {
  const res = await fetch(`${BASE}/api/tags`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function fetchTransactions(page = 1, tagId?: string): Promise<TransactionsResponse> {
  const params = new URLSearchParams({ page: String(page) })
  if (tagId) params.set('tagId', tagId)
  const res = await fetch(`${BASE}/api/transactions?${params}`, { headers: authHeaders() })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function createTransaction(data: { amount: number; tagId?: number | null; note?: string; date?: string }): Promise<Transaction> {
  const res = await fetch(`${BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function updateTransaction(id: number, data: { amount?: number; tagId?: number | null; note?: string | null; date?: string }): Promise<Transaction> {
  const res = await fetch(`${BASE}/api/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw await res.json()
}

export function useTransactions(page = 1, tagId?: string) {
  return useQuery({
    queryKey: ['transactions', page, tagId],
    queryFn: () => fetchTransactions(page, tagId),
    staleTime: 30_000,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { amount: number; tagId?: number | null; note?: string; date?: string }) => createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; amount?: number; tagId?: number | null; note?: string | null; date?: string }) => updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
