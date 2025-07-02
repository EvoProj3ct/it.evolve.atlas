import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const client = await clientPromise;
  const db = client.db();
  const existing = await db.collection('users').findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  await db.collection('users').insertOne({ email, password: hashed });
  res.status(201).json({ message: 'User created' });
}
