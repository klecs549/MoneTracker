import { useState } from 'react'
import { useAnalytics } from '../../api/analytics'
import { useTransactions } from '../../api/transactions'
import { useTagsSummary } from '../../api/tags'
import PeriodSelector from './PeriodSelector'
import SpendingChart from './SpendingChart'
import RecentTransactions from './RecentTransactions'
import './Dashboard.css'

export default function Dashboard() {
  const [period, setPeriod] = useState('month')
  const { data: analytics, isLoading: chartLoading } = useAnalytics(period)
  const { data: txData } = useTransactions(1)
  const { data: summary } = useTagsSummary()

  const total = summary ? parseFloat(summary.total) : 0
  const isNegative = total < 0
  const recentTxs = txData?.data.slice(0, 5) ?? []

  return (
    <div className="dashboard">
      <div className="dashboard-balance">
        <span className="dashboard-balance-label">Total Balance</span>
        <h2 className={`dashboard-balance-amount ${isNegative ? 'dashboard-balance-negative' : 'dashboard-balance-positive'}`}>
          {isNegative ? '-' : ''}${Math.abs(total).toFixed(2)}
        </h2>
      </div>

      <PeriodSelector value={period} onChange={setPeriod} />

      <div className="dashboard-section">
        <h3 className="dashboard-section-title">Spending Overview</h3>
        {chartLoading ? (
          <div className="dashboard-loading">Loading chart...</div>
        ) : (
          <SpendingChart data={analytics?.data ?? []} />
        )}
      </div>

      <RecentTransactions transactions={recentTxs} />
    </div>
  )
}
