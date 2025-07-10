'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './Navbar.module.css';

export default function Navbar({ items = [] }) {
  const { data: session } = useSession();

  return (
    <nav className={styles.nav}>
      <ul className={styles.menu}>
        {items.map((item, idx) => (
          <li key={idx} className={styles.item}>
            {typeof item === 'object' && !item.type ? (
              <Link href={item.href} className={styles.link}>{item.label}</Link>
            ) : (
              item
            )}
          </li>
        ))}
        {session ? (
          <li className={styles.item}>
            <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.link}>Logout</button>
          </li>
        ) : (
          <li className={styles.item}>
            <Link href="/login" className={styles.link}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
