import './PeriodSelector.css'

const PERIODS = ['week', 'month', 'year'] as const

interface Props {
  value: string
  onChange: (period: string) => void
}

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="period-selector">
      {PERIODS.map((p) => (
        <button
          key={p}
          className={`period-btn ${value === p ? 'period-btn-active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  )
}
