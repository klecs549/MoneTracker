import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../../api/transactions'
import { useTags } from '../../api/tags'
import TransactionRow from './TransactionRow'
import './TransactionList.css'

type Filter = 'all' | 'expense' | 'income'

export default function TransactionList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useTransactions(page)
  const { data: tags } = useTags()

  const transactions = data?.data ?? []

  const filtered = transactions.filter((tx) => {
    const amount = parseFloat(tx.amount)
    if (filter === 'expense') return amount < 0
    if (filter === 'income') return amount > 0
    return true
  })

  if (isLoading) return <div className="tx-list-state">Loading...</div>
  if (error) return <div className="tx-list-state tx-list-error">Failed to load transactions</div>

  function tagForTx(tagId: number | null) {
    return tags?.find((t) => t.id === tagId)
  }

  return (
    <div className="tx-list">
      <div className="tx-list-filters">
        {(['all', 'expense', 'income'] as Filter[]).map((f) => (
          <button
            key={f}
            className={`tx-list-filter ${filter === f ? 'tx-list-filter-active' : ''}`}
            onClick={() => { setFilter(f); setPage(1) }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="tx-list-state">
          <p>No transactions found</p>
          <button className="tx-list-add-btn" onClick={() => navigate('/transactions/new')}>
            Add transaction
          </button>
        </div>
      ) : (
        <>
          <div className="tx-list-items">
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                tag={tagForTx(tx.tagId)}
                onClick={() => navigate(`/transactions/${tx.id}/edit`)}
              />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="tx-list-pages">
              <button
                className="tx-list-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="tx-list-page-info">Page {page} of {data.totalPages}</span>
              <button
                className="tx-list-page-btn"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
