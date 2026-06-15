import { FormEvent, useState } from 'react'
import { login, register } from '../api/auth'
import './Auth.css'

interface Props {
  onSuccess: (token: string) => void
}

type View = 'login' | 'register'

export default function Auth({ onSuccess }: Props) {
  const [view, setView] = useState<View>('login')
  const [username, setUsername] = useState('')
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchView(next: View) {
    setView(next)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = view === 'login'
        ? await login(mail, password)
        : await register(username, mail, password)
      onSuccess(token)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : view === 'login' ? 'Invalid email or password' : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = view === 'login'

  return (
    <div className="auth-card">
      <h1 className="auth-title">MoneyTrack</h1>
      <p className="auth-subtitle">{isLogin ? 'Sign in to your account' : 'Create your account'}</p>

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <label className="auth-label">
            Username
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="johndoe"
              autoComplete="username"
              required
            />
          </label>
        )}

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={mail}
            onChange={e => setMail(e.target.value)}
            placeholder="john@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading
            ? (isLogin ? 'Signing in…' : 'Creating account…')
            : (isLogin ? 'Sign in' : 'Create account')}
        </button>
      </form>

      <p className="auth-switch">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          className="auth-link"
          type="button"
          onClick={() => switchView(isLogin ? 'register' : 'login')}
        >
          {isLogin ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
