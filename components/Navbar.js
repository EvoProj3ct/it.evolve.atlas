'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { LogInIcon, LogOutIcon } from './Icons';

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
              item.external ? (
                <a
                  href={item.href}
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} className="link">
                  {item.label}
                </Link>
              )
            ) : (
              item
            )}
          </li>
        ))}
      </ul>
      <div className="actions">
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn"
            aria-label="Logout"
          >
            <LogOutIcon />
          </button>
        ) : (
          <Link href="/login" className="btn" aria-label="Login">
            <LogInIcon />
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
