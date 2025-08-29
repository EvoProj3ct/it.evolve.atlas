'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function Login() {
  const [loadingSeed, setLoadingSeed] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await signIn('credentials', {
      redirect: true,
      callbackUrl: '/dashboard',
      user: formData.get('user'),
      password: formData.get('password'),
    })
  }

  const seedUsers = async () => {
    try {
      setLoadingSeed(true)
      setSeedMsg('')
      const res = await fetch('/api/seed-users', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Errore seeding')
      const created = data.results.filter(r => r.status === 'created').map(r => r.user)
      const exists  = data.results.filter(r => r.status === 'exists').map(r => r.user)
      setSeedMsg(
          `Creati: ${created.join(', ') || 'nessuno'} — Già presenti: ${exists.join(', ') || 'nessuno'}`
      )
    } catch (err) {
      setSeedMsg(err.message)
    } finally {
      setLoadingSeed(false)
    }
  }

  return (
      <div className="login">
        <h1>Login</h1>

        <form onSubmit={handleSubmit} className="form">
          <input type="text" name="user" placeholder="User" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit" className="btn">Entra</button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          <button
              type="button"
              className="btn"
              onClick={seedUsers}
              disabled={loadingSeed}
          >
            {loadingSeed ? 'Creo utenti…' : 'Crea utenti demo'}
          </button>
          {seedMsg && <p style={{ marginTop: '.5rem' }}>{seedMsg}</p>}
        </div>
      </div>
  )
}
