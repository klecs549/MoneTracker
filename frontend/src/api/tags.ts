import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const BASE = import.meta.env.BACKEND_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export interface Tag {
  id: number
  userId: number
  name: string
  icon: string | null
}

export interface TagSummary {
  tagId: number | null
  tagName: string | null
  tagIcon: string | null
  sum: string
}

export interface TagsResponse {
  total: string
  byTag: TagSummary[]
}

async function fetchTags(): Promise<TagsResponse> {
  const res = await fetch(`${BASE}/api/tags`, { headers: authHeaders() })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function fetchTagList(): Promise<Tag[]> {
  const res = await fetch(`${BASE}/api/tags/list`, { headers: authHeaders() })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function createTag(data: { name: string; icon?: string }): Promise<Tag> {
  const res = await fetch(`${BASE}/api/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function updateTag(id: number, data: { name?: string; icon?: string | null }): Promise<Tag> {
  const res = await fetch(`${BASE}/api/tags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

async function deleteTag(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/tags/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw await res.json()
}

export function useTagsSummary() {
  return useQuery({
    queryKey: ['tags-summary'],
    queryFn: fetchTags,
    staleTime: 30_000,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTagList,
    staleTime: 60_000,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; icon?: string }) => createTag(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const prev = qc.getQueryData<Tag[]>(['tags'])
      const temp: Tag = { id: -Date.now(), userId: 0, name: data.name, icon: data.icon ?? null }
      qc.setQueryData<Tag[]>(['tags'], (old) => old ? [...old, temp] : [temp])
      return { prev }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tags'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tags'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
    },
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; icon?: string | null }) => updateTag(id, data),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const prev = qc.getQueryData<Tag[]>(['tags'])
      qc.setQueryData<Tag[]>(['tags'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t))
      )
      return { prev }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tags'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tags'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
    },
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tags'] })
      const prev = qc.getQueryData<Tag[]>(['tags'])
      qc.setQueryData<Tag[]>(['tags'], (old) => old?.filter((t) => t.id !== id))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tags'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tags'] })
      qc.invalidateQueries({ queryKey: ['tags-summary'] })
    },
  })
}
