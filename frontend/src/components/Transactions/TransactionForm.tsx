import { FormEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useTransactions } from '../../api/transactions'
import { useTags } from '../../api/tags'
import type { Tag } from '../../api/tags'
import { Trash2 } from 'lucide-react'
import './TransactionForm.css'

interface FormData {
  amount: string
  type: 'expense' | 'income'
  tagId: number | ''
  note: string
  date: string
}

function TransactionFormInner({ initial, onSave, isEdit, tags, onDelete }: {
  initial?: FormData
  onSave: (data: { amount: number; tagId?: number | null; note?: string; date: string }) => Promise<void>
  isEdit: boolean
  tags?: Tag[]
  onDelete?: () => Promise<void>
}) {
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [type, setType] = useState<'expense' | 'income'>(initial?.type ?? 'expense')
  const [tagId, setTagId] = useState<number | ''>(initial?.tagId ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setSaving(true)
    try {
      await onSave({
        amount: type === 'expense' ? -numAmount : numAmount,
        tagId: tagId || null,
        note: note || undefined,
        date,
      })
    } catch {
      setError(isEdit ? 'Failed to update transaction' : 'Failed to create transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="tx-form" onSubmit={handleSubmit}>
      <h2 className="tx-form-title">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h2>

      <div className="tx-form-type">
        <button
          type="button"
          className={`tx-form-type-btn ${type === 'expense' ? 'tx-form-type-expense' : ''}`}
          onClick={() => setType('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`tx-form-type-btn ${type === 'income' ? 'tx-form-type-income' : ''}`}
          onClick={() => setType('income')}
        >
          Income
        </button>
      </div>

      <div className="tx-form-amount-wrap">
        <span className="tx-form-currency">$</span>
        <input
          className="tx-form-amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          autoFocus
          required
        />
      </div>

      <label className="tx-form-label">
        Category
        <select
          className="tx-form-select"
          value={tagId}
          onChange={(e) => setTagId(e.target.value ? parseInt(e.target.value) : '')}
        >
          <option value="">None</option>
          {tags?.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>

      <label className="tx-form-label">
        Note
        <input
          className="tx-form-input"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
        />
      </label>

      <label className="tx-form-label">
        Date
        <input
          className="tx-form-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      {error && <p className="tx-form-error">{error}</p>}

      <div className="tx-form-actions">
        <button className="tx-form-submit" type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </button>
        {isEdit && onDelete && (
          <button className="tx-form-delete" type="button" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>
    </form>
  )
}

export default function TransactionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: tags } = useTags()
  const { data: txData } = useTransactions(1)
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()

  const handleSave = async (data: { amount: number; tagId?: number | null; note?: string; date: string }) => {
    if (isEdit) {
      await updateTx.mutateAsync({ id: parseInt(id!), ...data })
    } else {
      await createTx.mutateAsync(data)
    }
    navigate('/transactions')
  }

  const handleDelete = async () => {
    if (!isEdit) return
    await deleteTx.mutateAsync(parseInt(id!))
    navigate('/transactions')
  }

  if (isEdit && txData) {
    const tx = txData.data.find((t) => t.id === parseInt(id!))
    if (tx) {
      const amt = parseFloat(tx.amount)
      return (
        <TransactionFormInner
          key={tx.id}
          isEdit
          tags={tags}
          initial={{
            amount: String(Math.abs(amt)),
            type: amt < 0 ? 'expense' : 'income',
            tagId: tx.tagId ?? '',
            note: tx.note ?? '',
            date: new Date(tx.date).toISOString().slice(0, 10),
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )
    }
  }

  if (isEdit) {
    return <div className="tx-list-state">Loading transaction...</div>
  }

  return <TransactionFormInner isEdit={false} tags={tags} onSave={handleSave} />
}
