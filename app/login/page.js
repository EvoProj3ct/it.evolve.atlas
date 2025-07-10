'use client'
import { signIn } from 'next-auth/react'

export default function Login() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await signIn('credentials', {
      redirect: true,
      callbackUrl: '/dashboard',
      user: formData.get('user'),
      password: formData.get('password')
    })
  }

  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="user" placeholder="User" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit" className="btn">Entra</button>
      </form>
    </div>
  )
}
