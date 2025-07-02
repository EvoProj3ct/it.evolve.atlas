import { verifyAuth } from '../../lib/auth';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const decoded = verifyAuth(req);
  if (!decoded) {
    return res.status(401).json({ user: null });
  }
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ email: decoded.email }, { projection: { password: 0 } });
  res.status(200).json({ user });
}
