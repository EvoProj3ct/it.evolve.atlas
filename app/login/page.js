'use client'
import { signIn } from 'next-auth/react'
import './page.css'

export default function Login() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await signIn('credentials', {
      redirect: true,
      callbackUrl: '/dashboard',
      email: formData.get('email'),
      password: formData.get('password')
    })
  }

  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit" className="btn">Entra</button>
      </form>
    </div>
  )
}
