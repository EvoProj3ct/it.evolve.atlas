'use client'
import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from './Icons'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  return (
    <button onClick={toggle} className="link" aria-label="Toggle theme">
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
