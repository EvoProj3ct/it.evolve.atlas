'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ items = [] }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(prev => !prev);

  return (
    <nav className={`nav ${open ? 'open' : ''}`}>
      <button className="burger" onClick={toggleMenu} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className="menu">
        {items.map((item, idx) => (
          <li key={idx} className="item">
            {typeof item === 'object' && !item.type ? (
              <Link href={item.href} className="link">{item.label}</Link>
            ) : (
              item
            )}
          </li>
        ))}
        {session ? (
          <li className="item">
            <button onClick={() => signOut({ callbackUrl: '/' })} className="link">Logout</button>
          </li>
        ) : (
          <li className="item">
            <Link href="/login" className="link">Login</Link>
          </li>
        )}
      </ul>
      <ThemeToggle />
    </nav>
  );
}
