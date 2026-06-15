import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionList from './components/Transactions/TransactionList'
import TransactionForm from './components/Transactions/TransactionForm'
import TagManager from './components/Tags/TagManager'
import BorrowingList from './components/Borrowings/BorrowingList'

function ProtectedRoute({ token, children }: { token: string; children: React.ReactNode }) {
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? '')

  function onAuth(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Auth onSuccess={onAuth} />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute token={token}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="transactions/new" element={<TransactionForm />} />
        <Route path="transactions/:id/edit" element={<TransactionForm />} />
        <Route path="tags" element={<TagManager />} />
        <Route path="borrowings" element={<BorrowingList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
