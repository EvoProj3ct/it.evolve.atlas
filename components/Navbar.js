'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ items = [] }) {
  const { data: session } = useSession();

  return (
    <nav className="nav">
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
