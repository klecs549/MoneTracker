import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const BASE = import.meta.env.BACKEND_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export interface Borrowing {
  id: number
  userId: number
  amount: string
  date: string
  returnDate: string | null
  status: 'awaiting' | 'returned'
}

async function fetchBorrowings(): Promise<Borrowing[]> {
  const res = await fetch(`${BASE}/api/borrowing`, { headers: authHeaders() })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function createBorrowing(data: { amount: number; date?: string; returnDate?: string | null; status?: string }): Promise<Borrowing> {
  const res = await fetch(`${BASE}/api/borrowing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function updateBorrowing(id: number, data: { amount?: number; date?: string; returnDate?: string | null; status?: string }): Promise<Borrowing> {
  const res = await fetch(`${BASE}/api/borrowing/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function deleteBorrowing(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/borrowing/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw await res.json()
}

export function useBorrowings() {
  return useQuery({
    queryKey: ['borrowings'],
    queryFn: fetchBorrowings,
    staleTime: 30_000,
  })
}

export function useCreateBorrowing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { amount: number; date?: string; returnDate?: string | null; status?: string }) => createBorrowing(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['borrowings'] })
      const prev = qc.getQueryData<Borrowing[]>(['borrowings'])
      const temp: Borrowing = { id: -Date.now(), userId: 0, amount: String(data.amount), date: data.date ?? new Date().toISOString(), returnDate: data.returnDate ?? null, status: (data.status as 'awaiting' | 'returned') ?? 'awaiting' }
      qc.setQueryData<Borrowing[]>(['borrowings'], (old) => old ? [...old, temp] : [temp])
      return { prev }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) qc.setQueryData(['borrowings'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['borrowings'] }),
  })
}

export function useUpdateBorrowing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; amount?: number; date?: string; returnDate?: string | null; status?: string }) => updateBorrowing(id, data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ['borrowings'] })
      const prev = qc.getQueryData<Borrowing[]>(['borrowings'])
      qc.setQueryData<Borrowing[]>(['borrowings'], (old) =>
        old?.map((b) => (b.id === id ? { ...b, ...data, amount: data.amount !== undefined ? String(data.amount) : b.amount } : b))
      )
      return { prev }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) qc.setQueryData(['borrowings'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['borrowings'] }),
  })
}

export function useDeleteBorrowing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBorrowing(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['borrowings'] })
      const prev = qc.getQueryData<Borrowing[]>(['borrowings'])
      qc.setQueryData<Borrowing[]>(['borrowings'], (old) => old?.filter((b) => b.id !== id))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['borrowings'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['borrowings'] }),
  })
}
