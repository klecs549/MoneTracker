import { useState } from 'react'
import Auth from './components/Auth'
import Categories from './components/Categories'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? '')

  function onAuth(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken('')
  }

  if (token) {
    return (
      <>
        <Categories token={token} />
        <div style={{ textAlign: 'center', padding: '0 16px 32px' }}>
          <button onClick={logout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </>
    )
  }

  return <Auth onSuccess={onAuth} />
}
