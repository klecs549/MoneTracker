import { useEffect, useState } from 'react'
import { getSummary, type Summary, type TagSummary } from '../api/transactions'
import './Categories.css'

interface Props {
  token: string
}

function formatAmount(sum: string) {
  const n = parseFloat(sum)
  const abs = Math.abs(n).toFixed(2)
  return n < 0 ? `-$${abs}` : `+$${abs}`
}

function TagRow({ tag }: { tag: TagSummary }) {
  const name = tag.tagName ?? 'Uncategorized'
  const icon = tag.tagIcon ?? '•'
  const amount = formatAmount(tag.sum)
  const isExpense = parseFloat(tag.sum) < 0

  return (
    <div className="cat-row">
      <div className="cat-icon">{icon}</div>
      <span className="cat-name">{name}</span>
      <span className={`cat-amount ${isExpense ? 'expense' : 'income'}`}>
        {amount}
      </span>
    </div>
  )
}

export default function Categories({ token }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSummary(token)
      .then(setSummary)
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="cat-state">Loading…</div>
  if (error) return <div className="cat-state cat-error-state">{error}</div>
  if (!summary || summary.byTag.length === 0) {
    return <div className="cat-state">No transactions yet.</div>
  }

  const totalAmount = formatAmount(summary.total)
  const isExpense = parseFloat(summary.total) < 0

  return (
    <div className="cat-container">
      <div className="cat-header">
        <span className="cat-header-label">Total</span>
        <span className={`cat-header-amount ${isExpense ? 'expense' : 'income'}`}>
          {totalAmount}
        </span>
      </div>

      <div className="cat-list">
        {summary.byTag.map((tag, i) => (
          <TagRow key={tag.tagId ?? `untagged-${i}`} tag={tag} />
        ))}
      </div>
    </div>
  )
}
