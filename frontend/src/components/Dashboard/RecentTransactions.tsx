import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Transaction } from '../../api/transactions'
import './RecentTransactions.css'

interface Props {
  transactions: Transaction[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentTransactions({ transactions }: Props) {
  const navigate = useNavigate()

  if (!transactions.length) {
    return (
      <div className="recent-empty">
        <p>No transactions yet</p>
        <button className="recent-add-btn" onClick={() => navigate('/transactions/new')}>
          Add your first transaction
        </button>
      </div>
    )
  }

  return (
    <div className="recent-section">
      <h3 className="recent-title">Recent Transactions</h3>
      <div className="recent-list">
        {transactions.map((tx) => {
          const amount = parseFloat(tx.amount)
          const isExpense = amount < 0
          return (
            <div key={tx.id} className="recent-row" onClick={() => navigate(`/transactions/${tx.id}/edit`)}>
              <div className={`recent-icon ${isExpense ? 'recent-icon-expense' : 'recent-icon-income'}`}>
                {isExpense ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className="recent-info">
                <span className="recent-note">{tx.note || 'No note'}</span>
                <span className="recent-date">{formatDate(tx.date)}</span>
              </div>
              <span className={`recent-amount ${isExpense ? 'recent-amount-expense' : 'recent-amount-income'}`}>
                {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
