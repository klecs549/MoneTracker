import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { AnalyticsPoint } from '../../api/analytics'
import './SpendingChart.css'

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="chart-tooltip-value">
          {entry.name === 'income' ? 'Income' : 'Expense'}: ${Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

interface Props {
  data: AnalyticsPoint[]
}

export default function SpendingChart({ data }: Props) {
  if (!data.length) {
    return <div className="chart-empty">No data for this period</div>
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="income" fill="var(--teal)" radius={[4, 4, 0, 0]} maxBarSize={16} />
          <Bar dataKey="expense" fill="var(--red)" radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
