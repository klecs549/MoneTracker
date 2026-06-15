import { useState } from 'react'
import { Plus, X, Check, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useBorrowings, useCreateBorrowing, useUpdateBorrowing, useDeleteBorrowing } from '../../api/borrowings'
import type { Borrowing } from '../../api/borrowings'
import './BorrowingList.css'

interface BorrowingFormProps {
  initial?: Borrowing
  onClose: () => void
  onSave: (data: { amount: number; date?: string; returnDate?: string | null; status?: string }) => Promise<void>
  onDelete?: () => Promise<void>
}

function BorrowingForm({ initial, onClose, onSave, onDelete }: BorrowingFormProps) {
  const initAmount = initial ? parseFloat(initial.amount) : 0
  const [amount, setAmount] = useState(initial ? Math.abs(initAmount).toString() : '')
  const [type, setType] = useState<'borrowed' | 'lent'>(initAmount >= 0 ? 'borrowed' : 'lent')
  const [date, setDate] = useState(initial ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [returnDate, setReturnDate] = useState(initial?.returnDate ? new Date(initial.returnDate).toISOString().slice(0, 10) : '')
  const [status, setStatus] = useState<'awaiting' | 'returned'>(initial?.status ?? 'awaiting')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
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
        amount: type === 'borrowed' ? numAmount : -numAmount,
        date,
        returnDate: returnDate || null,
        status,
      })
      onClose()
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="borr-modal-overlay" onClick={onClose}>
      <div className="borr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="borr-modal-header">
          <h3 className="borr-modal-title">{initial ? 'Edit Borrowing' : 'New Borrowing'}</h3>
          <button className="borr-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="borr-modal-form">
          <div className="borr-modal-type">
            <button
              type="button"
              className={`borr-modal-type-btn ${type === 'borrowed' ? 'borr-modal-type-borrowed' : ''}`}
              onClick={() => setType('borrowed')}
            >
              <ArrowUpRight size={16} />
              I borrowed
            </button>
            <button
              type="button"
              className={`borr-modal-type-btn ${type === 'lent' ? 'borr-modal-type-lent' : ''}`}
              onClick={() => setType('lent')}
            >
              <ArrowDownRight size={16} />
              I lent
            </button>
          </div>

          <label className="borr-modal-label">
            Amount ($)
            <input className="borr-modal-input" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus required />
          </label>
          <label className="borr-modal-label">
            Date
            <input className="borr-modal-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="borr-modal-label">
            Return Date
            <input className="borr-modal-input" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </label>
          <div className="borr-modal-status">
            <button type="button" className={`borr-modal-status-btn ${status === 'awaiting' ? 'borr-modal-status-active' : ''}`} onClick={() => setStatus('awaiting')}>
              Awaiting
            </button>
            <button type="button" className={`borr-modal-status-btn ${status === 'returned' ? 'borr-modal-status-returned' : ''}`} onClick={() => setStatus('returned')}>
              Returned
            </button>
          </div>
          {error && <p className="borr-modal-error">{error}</p>}

          <div className="borr-modal-actions">
            <button className="borr-modal-save" type="submit" disabled={saving}>
              <Check size={18} />
              {saving ? 'Saving...' : initial ? 'Update' : 'Create'}
            </button>
            {initial && onDelete && (
              <button className="borr-modal-delete" type="button" onClick={onDelete}>
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

interface BorrowingGroupProps {
  items: Borrowing[]
  title: string
  onEdit: (b: Borrowing) => void
  onStatusToggle: (b: Borrowing) => void
}

function BorrowingGroup({ items, title, onEdit, onStatusToggle }: BorrowingGroupProps) {
  if (!items.length) return null
  return (
    <div className="borr-group">
      <h3 className="borr-group-title">{title}</h3>
      {items.map((b) => {
        const amt = parseFloat(b.amount)
        const isBorrowed = amt >= 0
        const isReturned = b.status === 'returned'
        return (
          <div key={b.id} className="borr-item" onClick={() => onEdit(b)}>
            <div className={`borr-item-icon ${isBorrowed ? 'borr-item-icon-borrowed' : 'borr-item-icon-lent'}`}>
              {isBorrowed ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            </div>
            <div className="borr-item-info">
              <span className={`borr-item-amount ${isBorrowed ? 'borr-item-amount-borrowed' : 'borr-item-amount-lent'}`}>
                {isBorrowed ? '+' : '-'}${Math.abs(amt).toFixed(2)}
              </span>
              <span className="borr-item-label">{isBorrowed ? 'I borrowed' : 'I lent'}</span>
            </div>
            <div className="borr-item-date">{b.returnDate ? ("Return to " + new Date(b.returnDate).toLocaleDateString()) : 'No time limit'}</div>
            <div
              className={`borr-checkbox ${isReturned ? 'borr-checkbox-returned' : 'borr-checkbox-awaiting'}`}
              onClick={(e) => { e.stopPropagation(); onStatusToggle(b) }}
              title={isReturned ? 'Mark awaiting' : 'Mark returned'}
            >
              {isReturned ? <Check size={14} /> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BorrowingList() {
  const { data: borrowings, isLoading, error } = useBorrowings()
  const createBorrowing = useCreateBorrowing()
  const updateBorrowing = useUpdateBorrowing()
  const deleteBorrowing = useDeleteBorrowing()
  const [modal, setModal] = useState<Borrowing | null>(null)

  if (isLoading) return <div className="borr-state">Loading...</div>
  if (error) return <div className="borr-state borr-error">Failed to load borrowings</div>

  const awaiting = borrowings?.filter((b) => b.status === 'awaiting') ?? []
  const returned = borrowings?.filter((b) => b.status === 'returned') ?? []

  async function handleSave(data: { amount: number; date?: string; returnDate?: string | null; status?: string }) {
    if (modal?.id) {
      await updateBorrowing.mutateAsync({ id: modal.id, ...data })
    } else {
      await createBorrowing.mutateAsync(data)
    }
  }

  async function handleStatusToggle(b: Borrowing) {
    const newStatus = b.status === 'awaiting' ? 'returned' : 'awaiting'
    await updateBorrowing.mutateAsync({ id: b.id, status: newStatus, returnDate: newStatus === 'returned' ? new Date().toISOString() : null })
  }

  async function handleDelete() {
    if (!modal?.id) return
    await deleteBorrowing.mutateAsync(modal.id)
    setModal(null)
  }

  return (
    <div className="borr-list">
      {!borrowings?.length ? (
        <div className="borr-state">
          <p>No borrowings yet</p>
        </div>
      ) : (
        <>
          <BorrowingGroup items={awaiting} title="Awaiting" onEdit={setModal} onStatusToggle={handleStatusToggle} />
          <BorrowingGroup items={returned} title="Returned" onEdit={setModal} onStatusToggle={handleStatusToggle} />
        </>
      )}

      <button className="borr-fab" onClick={() => setModal({} as Borrowing)}>
        <Plus size={24} />
      </button>

      {modal && (
        <BorrowingForm
          key={modal?.id ?? 'new'}
          initial={modal?.id ? modal : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal?.id ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
