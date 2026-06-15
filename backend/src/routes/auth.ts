import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { signToken } from '../lib/auth';
import { authenticate, AuthRequest } from '../lib/middleware';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, mail, password } = req.body;
  if (!username || !mail || !password) {
    res.status(400).json({ error: 'username, mail and password are required' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    const [user] = await db
      .insert(users)
      .values({ username, mail, password: hashed })
      .returning({ id: users.id });
    res.status(201).json({ token: signToken(user.id) });
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
      res.status(409).json({ error: 'Username or email already taken' });
      return;
    }
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { mail, password } = req.body;
  if (!mail || !password) {
    res.status(400).json({ error: 'mail and password are required' });
    return;
  }
  const [user] = await db.select().from(users).where(eq(users.mail, mail));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json({ token: signToken(user.id) });
});

router.post('/logout', authenticate, (_req, res) => {
  // JWT is stateless — instruct the client to delete the token from storage.
  res.json({ message: 'Logged out' });
});

router.delete('/account', authenticate, async (req, res) => {
  const { userId } = req as AuthRequest;
  await db.delete(users).where(eq(users.id, userId));
  res.json({ message: 'Account deleted' });
});

export default router;
