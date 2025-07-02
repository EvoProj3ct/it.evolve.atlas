import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function Protected() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(async (res) => {
      if (res.status === 401) {
        window.location.href = '/login';
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    });
  }, []);

  if (!user) return null;

  return (
    <div>
      <Navbar user={user} />
      <h1>Dashboard</h1>
      <p>Welcome {user.email}</p>
    </div>
  );
}
