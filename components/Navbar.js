'use client';
import Link from 'next/link';
import styles from './Navbar.module.css';
import '../app/styles/buttons.css';

export default function Navbar({ items = [] }) {
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
      </ul>
    </nav>
  );
}
