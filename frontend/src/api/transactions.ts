const BASE = import.meta.env.VITE_BACKEND_URL

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
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
    headers: authHeaders(token),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}
