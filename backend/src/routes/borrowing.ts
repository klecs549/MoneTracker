import { and, eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { borrowing } from '../db/schema';

type BorrowingStatus = 'awaiting' | 'returned';
import { authenticate, AuthRequest } from '../lib/middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const result = await db.select().from(borrowing).where(eq(borrowing.userId, userId));
  res.json(result);
});

router.post('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const { amount, date, returnDate, status } = req.body;
  if (amount === undefined) {
    res.status(400).json({ error: 'amount is required' });
    return;
  }
  if (status !== undefined && status !== 'awaiting' && status !== 'returned') {
    res.status(400).json({ error: 'status must be "awaiting" or "returned"' });
    return;
  }
  const [record] = await db
    .insert(borrowing)
    .values({
      userId,
      amount: String(amount),
      date: date ? new Date(date) : new Date(),
      returnDate: returnDate ? new Date(returnDate) : null,
      status: (status as BorrowingStatus) ?? 'awaiting',
    })
    .returning();
  res.status(201).json(record);
});

router.patch('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(borrowing).where(and(eq(borrowing.id, id), eq(borrowing.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  if (req.body.status !== undefined && req.body.status !== 'awaiting' && req.body.status !== 'returned') {
    res.status(400).json({ error: 'status must be "awaiting" or "returned"' });
    return;
  }
  const patch: { amount?: string; date?: Date; returnDate?: Date | null; status?: BorrowingStatus } = {};
  if (req.body.amount !== undefined) patch.amount = String(req.body.amount);
  if (req.body.date !== undefined) patch.date = new Date(req.body.date);
  if (req.body.returnDate !== undefined) patch.returnDate = req.body.returnDate ? new Date(req.body.returnDate) : null;
  if (req.body.status !== undefined) patch.status = req.body.status as BorrowingStatus;

  const [updated] = await db.update(borrowing).set(patch).where(eq(borrowing.id, id)).returning();
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(borrowing).where(and(eq(borrowing.id, id), eq(borrowing.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  await db.delete(borrowing).where(eq(borrowing.id, id));
  res.json({ message: 'Deleted' });
});

export default router;
