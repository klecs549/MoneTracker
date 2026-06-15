import { ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { Transaction } from '../../api/transactions'
import type { Tag } from '../../api/tags'
import './TransactionRow.css'

interface Props {
  transaction: Transaction
  onClick: () => void
  tag?: Tag
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function renderIcon(name: string | null, size = 16) {
  if (!name) return <Hash size={size} />
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[name]
  return Icon ? <Icon size={size} /> : <span>{name}</span>
}

export default function TransactionRow({ transaction, onClick, tag }: Props) {
  const amount = parseFloat(transaction.amount)
  const isExpense = amount < 0

  return (
    <div className="tx-row" onClick={onClick}>
      <div className={`tx-row-icon ${isExpense ? 'tx-row-icon-expense' : 'tx-row-icon-income'}`}>
        {tag ? renderIcon(tag.icon) : (isExpense ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />)}
      </div>
      <div className="tx-row-info">
        <span className="tx-row-note">{transaction.note || tag?.name || 'No note'}</span>
        <span className="tx-row-date">{formatDate(transaction.date)}</span>
      </div>
      <span className={`tx-row-amount ${isExpense ? 'tx-row-amount-expense' : 'tx-row-amount-income'}`}>
        {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
      </span>
    </div>
  )
}
