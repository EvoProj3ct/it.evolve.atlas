import Link from 'next/link';
import styles from '../styles/Navbar.module.css';

export default function Navbar({ user }) {
  return (
    <nav className={styles.nav}>
      <Link href="/"><a>Home</a></Link>
      {user ? (
        <>
          <Link href="/protected"><a>Dashboard</a></Link>
          <a href="/api/logout">Logout</a>
        </>
      ) : (
        <>
          <Link href="/login"><a>Login</a></Link>
          <Link href="/register"><a>Register</a></Link>
        </>
      )}
    </nav>
  );
}
