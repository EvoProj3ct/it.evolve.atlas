import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(async (res) => {
      const data = await res.json();
      setUser(data.user);
    });
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <h1>Welcome to Next.js Auth App</h1>
    </div>
  );
}
