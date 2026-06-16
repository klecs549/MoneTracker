import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useTags, useTagsSummary, useCreateTag, useUpdateTag, useDeleteTag } from '../../api/tags'
import './TagManager.css'

const ICON_NAMES = [
  'ShoppingCart', 'Utensils', 'Car', 'Home', 'Heart', 'Book', 'Music',
  'Gamepad2', 'Plane', 'Smartphone', 'Gift', 'Coffee', 'Shirt', 'Dumbbell',
  'Tv', 'Wifi', 'Droplets', 'Zap', 'Leaf', 'Wallet', 'Briefcase',
  'GraduationCap', 'Pill', 'Dog', 'Cat', 'Moon', 'Star', 'Sun',
]

function renderIcon(name: string | null, size = 22) {
  if (!name) return null
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[name]
  return Icon ? <Icon size={size} /> : <span>{name}</span>
}

interface TagModalProps {
  initial?: { id: number; name: string; icon: string | null }
  onClose: () => void
  onSave: (data: { name: string; icon?: string }) => Promise<void>
  onDelete?: () => Promise<void>
}

function TagModal({ initial, onClose, onSave, onDelete }: TagModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), icon: icon || undefined })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tag-modal-overlay" onClick={onClose}>
      <div className="tag-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tag-modal-header">
          <h3 className="tag-modal-title">{initial ? 'Edit Category' : 'New Category'}</h3>
          <button className="tag-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="tag-modal-form">
          <label className="tag-modal-label">
            Name
            <input className="tag-modal-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Food" autoFocus required />
          </label>

          <label className="tag-modal-label">Icon</label>
          <div className="tag-icon-grid">
            {ICON_NAMES.map((icn) => (
              <button
                key={icn}
                type="button"
                className={`tag-icon-btn ${icon === icn ? 'tag-icon-btn-active' : ''}`}
                onClick={() => setIcon(icon === icn ? '' : icn)}
                title={icn}
              >
                {renderIcon(icn, 20)}
              </button>
            ))}
          </div>

          <div className="tag-modal-actions">
            <button className="tag-modal-save" type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : initial ? 'Update' : 'Create'}
            </button>
            {initial && onDelete && (
              <button className="tag-modal-delete" type="button" onClick={onDelete}>
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

export default function TagManager() {
  const { data: tags } = useTags()
  const { data: summary } = useTagsSummary()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const [modal, setModal] = useState<{ id?: number; name: string; icon: string | null } | null>(null)

  const untaggedTotal = summary?.byTag.find((t) => t.tagId === null)?.sum

  function getTotal(tagId: number | null): string | undefined {
    return summary?.byTag.find((t) => t.tagId === tagId)?.sum
  }

  async function handleSave(data: { name: string; icon?: string }) {
    if (modal?.id !== undefined) {
      await updateTag.mutateAsync({ id: modal.id, ...data })
    } else {
      await createTag.mutateAsync(data)
    }
  }

  async function handleDelete() {
    if (!modal?.id) return
    await deleteTag.mutateAsync(modal.id)
    setModal(null)
  }

  return (
    <div className="tag-manager">
      <div className="tag-manager-list">
        {tags?.map((tag) => {
          const total = getTotal(tag.id)
          return (
            <div key={tag.id} className="tag-manager-item" onClick={() => setModal({ id: tag.id, name: tag.name, icon: tag.icon })}>
              <div className="tag-manager-icon">
                {renderIcon(tag.icon)}
              </div>
              <span className="tag-manager-name">{tag.name}</span>
              {total && (
                <span className={`tag-manager-amount ${parseFloat(total) >= 0 ? 'tag-manager-amount-positive' : 'tag-manager-amount-negative'}`}>
                  {parseFloat(total) >= 0 ? '+' : '-'}${Math.abs(parseFloat(total)).toFixed(2)}
                </span>
              )}
            </div>
          )
        })}
        {untaggedTotal && (
          <div key="untagged" className="tag-manager-item">
            <div className="tag-manager-icon"></div>
            <span className="tag-manager-name">Uncategorized</span>
            <span className={`tag-manager-amount ${parseFloat(untaggedTotal) >= 0 ? 'tag-manager-amount-positive' : 'tag-manager-amount-negative'}`}>
              {parseFloat(untaggedTotal) >= 0 ? '+' : '-'}${Math.abs(parseFloat(untaggedTotal)).toFixed(2)}
            </span>
          </div>
        )}
        {!tags?.length && !untaggedTotal && (
          <div className="tag-manager-empty">No categories yet. Create one to organize your transactions.</div>
        )}
      </div>

      <button className="tag-fab" onClick={() => setModal({ name: '', icon: null })}>
        <Plus size={24} />
      </button>

      {modal && (
        <TagModal
          initial={modal.id !== undefined ? modal : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal.id !== undefined ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
