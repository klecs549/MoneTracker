import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { tags, transactions } from '../db/schema';
import { authenticate, AuthRequest } from '../lib/middleware';

const router = Router();
router.use(authenticate);

async function resolveTag(tagId: number, userId: number) {
  const [tag] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
  return tag ?? null;
}

router.get('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(transactions.userId, userId)];
  if (req.query.tagId === 'none') {
    conditions.push(isNull(transactions.tagId));
  } else if (req.query.tagId !== undefined) {
    const tagId = parseInt(req.query.tagId as string);
    if (!isNaN(tagId)) conditions.push(eq(transactions.tagId, tagId));
  }
  const where = and(...conditions);

  const [data, [{ total }]] = await Promise.all([
    db.select().from(transactions).where(where).orderBy(desc(transactions.date)).limit(limit).offset(offset),
    db.select({ total: count() }).from(transactions).where(where),
  ]);

  res.json({ data, page, totalPages: Math.ceil(total / limit), total });
});

router.post('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const { tagId, amount, note, date } = req.body;

  if (amount === undefined) {
    res.status(400).json({ error: 'amount is required' });
    return;
  }
  if (tagId != null && !(await resolveTag(tagId, userId))) {
    res.status(400).json({ error: 'Tag not found' });
    return;
  }

  const [transaction] = await db
    .insert(transactions)
    .values({
      userId,
      tagId: tagId ?? null,
      amount: String(amount),
      note: note ?? null,
      date: date ? new Date(date) : new Date(),
    })
    .returning();
  res.status(201).json(transaction);
});

router.patch('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  if (req.body.tagId != null && !(await resolveTag(req.body.tagId, userId))) {
    res.status(400).json({ error: 'Tag not found' });
    return;
  }

  const patch: { tagId?: number | null; amount?: string; note?: string | null; date?: Date } = {};
  if (req.body.tagId !== undefined) patch.tagId = req.body.tagId;
  if (req.body.amount !== undefined) patch.amount = String(req.body.amount);
  if (req.body.note !== undefined) patch.note = req.body.note;
  if (req.body.date !== undefined) patch.date = new Date(req.body.date);

  const [updated] = await db.update(transactions).set(patch).where(eq(transactions.id, id)).returning();
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  await db.delete(transactions).where(eq(transactions.id, id));
  res.json({ message: 'Deleted' });
});

export default router;
